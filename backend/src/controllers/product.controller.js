import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import Order from "../models/order.model.js";
import slugify from "slugify";
import {
  uploadMultipleToCloudinary,
} from "../middleware/upload.middleware.js";

export const createProduct = async (req, res) => {
  try {
    /* ================= PARSE BODY ================= */
    const productData = JSON.parse(req.body.productData);

    const {
      name,
      brand,
      company,
      category,
      subCategory,
      gender,
      shortDescription,
      longDescription,
      attributes,
      variants, // 👈 color based
      isFeatured,
      isBestSeller,
      isNewArrival,
      returnPolicy,
      shipping,
      seo,
    } = productData;

    /* ================= BASIC VALIDATION ================= */
    if (!name || !category || !gender || !shortDescription) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one color variant is required",
      });
    }

    /* ================= CATEGORY VALIDATION ================= */
    const mainCategory = await Category.findById(category);
    if (!mainCategory || !mainCategory.isActive) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    if (subCategory) {
      const subCat = await Category.findById(subCategory);
      if (
        !subCat ||
        !subCat.isActive ||
        String(subCat.parent) !== String(category)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid sub-category",
        });
      }
    }

    /* ================= SKU VALIDATION (GLOBAL) ================= */
    const allSkus = [];

    variants.forEach((variant) => {
      if (!variant.sizes || variant.sizes.length === 0) {
        throw new Error(`Sizes missing for color ${variant.color}`);
      }

      variant.sizes.forEach((s) => {
        if (!s.sku) throw new Error("SKU missing in size");
        allSkus.push(s.sku);
      });
    });

    if (allSkus.length !== new Set(allSkus).size) {
      return res.status(400).json({
        success: false,
        message: "Duplicate SKU found in variants",
      });
    }

    const skuExists = await Product.findOne({
      "variants.sizes.sku": { $in: allSkus },
    });

    if (skuExists) {
      return res.status(400).json({
        success: false,
        message: "One or more SKUs already exist",
      });
    }

    /* ================= SLUG ================= */
    const slug = slugify(name, { lower: true, strict: true });

    /* ================= UPLOAD VARIANT (COLOR) IMAGES ================= */
    const updatedVariants = [];

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const imageKey = `variantImages_${i}`;

      let images = [];

      if (req.files?.[imageKey]) {
        images = await uploadMultipleToCloudinary(
          req.files[imageKey],
          "elan-cotts/products/colors"
        );
      }

      updatedVariants.push({
        color: variant.color,
        images,
        sizes: variant.sizes,
        isActive: variant.isActive ?? true,
      });
    }

    /* ================= CREATE PRODUCT ================= */
    const product = await Product.create({
      productId: `PRD-${Date.now()}`,
      name,
      slug,
      brand,
      company,
      category,
      subCategory,
      gender,
      shortDescription,
      longDescription,
      attributes,
      variants: updatedVariants,
      isFeatured,
      isBestSeller,
      isNewArrival,
      returnPolicy,
      shipping,
      seo,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message || "Product creation failed",
    });
  }
};

/* ================= GET PRODUCTS BY CATEGORY ================= */
export const getProductsByCategory = async (req, res) => {
  try {
    const { slug } = req.params;

    /* ================= FIND CATEGORY ================= */
    const category = await Category.findOne({
      slug,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    /* ================= FIND CHILD CATEGORIES ================= */
    const childCategories = await Category.find({
      parent: category._id,
      isActive: true,
    }).select("_id");

    const categoryIds = [
      category._id,
      ...childCategories.map((c) => c._id),
    ];

    /* ================= QUERY PRODUCTS ================= */
    const products = await Product.find({
      category: { $in: categoryIds },
      isActive: true,
    })
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      category: {
        name: category.name,
        slug: category.slug,
      },
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get Products By Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products by category",
    });
  }
};

/* ================= GET SINGLE PRODUCT BY SLUG ================= */
export const getProductBySlug = async (req, res) => {
  const { slug } = req.params;

  const product = await Product.findOne({ slug, isActive: true });

  if (!product) {
    return res.status(404).json({ success: false });
  }

  res.json({ success: true, product });
};


/* ================= ADD PRODUCT REVIEW ================= */
export const addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId = req.user._id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    /* ================= FIND PRODUCT ================= */
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    /* ================= CHECK PURCHASE ================= */
    const hasPurchased = await Order.findOne({
      user: userId,
      orderStatus: "DELIVERED",
      "orderItems.product": productId,
    });

    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        message: "You can review this product only after purchase",
      });
    }

    /* ================= PREVENT DUPLICATE REVIEW ================= */
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === userId.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    /* ================= CREATE REVIEW ================= */
    const review = {
      user: userId,
      name: req.user.name,
      rating: Number(rating),
      comment,
      verifiedPurchase: true,
    };

    product.reviews.push(review);

    /* ================= UPDATE RATINGS ================= */
    product.ratingsCount = product.reviews.length;
    product.ratingsAverage =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      ratingsAverage: product.ratingsAverage,
      ratingsCount: product.ratingsCount,
    });
  } catch (error) {
    console.error("Add Review Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add review",
    });
  }
};

/* ================= GET ALL PRODUCTS (ADMIN) ================= */
export const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name slug")
      .populate("subCategory", "name slug")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get All Products Admin Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

export const getAllProductsPublic = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate("category", "name slug")
      .populate("subCategory", "name slug")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get All Products Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

/* ================= UPDATE PRODUCT ================= */
export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const productData = JSON.parse(req.body.productData);

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    /* ================= CATEGORY VALIDATION ================= */
    if (productData.category) {
      const mainCategory = await Category.findById(productData.category);
      if (!mainCategory || !mainCategory.isActive) {
        return res.status(400).json({
          success: false,
          message: "Invalid category",
        });
      }

      if (productData.subCategory) {
        const subCat = await Category.findById(productData.subCategory);
        if (
          !subCat ||
          !subCat.isActive ||
          String(subCat.parent) !== String(productData.category)
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid sub-category for selected category",
          });
        }
      }
    }

    /* ================= SLUG UPDATE ================= */
    if (productData.name && productData.name !== product.name) {
      product.slug = slugify(productData.name, {
        lower: true,
        strict: true,
      });
    }

    /* ================= PRODUCT IMAGES ================= */
    if (req.files?.productImages) {
      product.images = await uploadMultipleToCloudinary(
        req.files.productImages,
        "elan-cotts/products/main"
      );
    }

    /* ================= VARIANT IMAGES ================= */
    if (productData.variants) {
      const updatedVariants = [];

      for (let i = 0; i < productData.variants.length; i++) {
        const key = `variantImages_${i}`;
        let images = product.variants[i]?.images || [];

        if (req.files?.[key]) {
          images = await uploadMultipleToCloudinary(
            req.files[key],
            "elan-cotts/products/variants"
          );
        }

        updatedVariants.push({
          ...productData.variants[i],
          images,
        });
      }

      product.variants = updatedVariants;
    }

    Object.assign(product, productData);

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};


/* ================= SOFT DELETE PRODUCT ================= */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product deactivated successfully",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

/* ================= HARD DELETE PRODUCT ================= */
export const hardDeleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product permanently deleted",
    });
  } catch (error) {
    console.error("Hard Delete Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product permanently",
    });
  }
};
