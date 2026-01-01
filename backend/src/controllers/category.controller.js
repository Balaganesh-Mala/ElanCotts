import Category from "../models/category.model.js";
import slugify from "slugify";
import { uploadToCloudinary } from "../middleware/upload.middleware.js";
import Product from "../models/product.model.js";

/* ================= CREATE CATEGORY ================= */
export const createCategory = async (req, res) => {
  try {
    const { name, description, parent, order, showInMenu, seo } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const slug = slugify(name, { lower: true, strict: true });

    const exists = await Category.findOne({ slug });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    let level = 1;
    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: "Parent category not found",
        });
      }
      level = parentCategory.level + 1;
    }

    /* ===== IMAGE UPLOAD (OPTIONAL) ===== */
    let image = null;
    if (req.file) {
      image = await uploadToCloudinary(
        req.file.buffer,
        "elan-cotts/categories"
      );
    }

    const category = await Category.create({
      categoryId: `CAT-${Date.now()}`,
      name,
      slug,
      description,
      parent: parent || null,
      level,
      order,
      showInMenu,
      image,
      seo,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

/* ================= GET ALL CATEGORIES ================= */
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .populate("parent", "name slug");

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get Categories Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

/* ================= GET SINGLE CATEGORY ================= */
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      "parent",
      "name slug"
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Get Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
    });
  }
};

/* ================= UPDATE CATEGORY ================= */
export const updateCategory = async (req, res) => {
  try {
    const { name, description, parent, order, showInMenu, isActive, seo } =
      req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (name && name !== category.name) {
      const slug = slugify(name, { lower: true, strict: true });

      const slugExists = await Category.findOne({
        slug,
        _id: { $ne: category._id },
      });

      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: "Category with this name already exists",
        });
      }

      category.name = name;
      category.slug = slug;
    }

    if (parent !== undefined) {
      if (parent) {
        const parentCategory = await Category.findById(parent);
        if (!parentCategory) {
          return res.status(400).json({
            success: false,
            message: "Invalid parent category",
          });
        }
        category.parent = parent;
        category.level = parentCategory.level + 1;
      } else {
        category.parent = null;
        category.level = 1;
      }
    }

    /* ===== UPDATE IMAGE (OPTIONAL) ===== */
    if (req.file) {
      const image = await uploadToCloudinary(
        req.file.buffer,
        "elan-cotts/categories"
      );
      category.image = image;
    }

    if (description !== undefined) category.description = description;
    if (order !== undefined) category.order = order;
    if (showInMenu !== undefined) category.showInMenu = showInMenu;
    if (isActive !== undefined) category.isActive = isActive;
    if (seo !== undefined) category.seo = seo;

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

/* ================= SOFT DELETE CATEGORY (SAFE) ================= */
export const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    /* ================= CHECK CHILD CATEGORIES ================= */
    const childCategories = await Category.find({
      parent: categoryId,
      isActive: true,
    }).select("_id");

    const categoryIdsToCheck = [
      categoryId,
      ...childCategories.map((c) => c._id),
    ];

    /* ================= CHECK PRODUCTS ================= */
    const productExists = await Product.findOne({
      category: { $in: categoryIdsToCheck },
      isActive: true,
    });

    if (productExists) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete category. Products are associated with this category or its sub-categories.",
      });
    }

    /* ================= SAFE SOFT DELETE ================= */
    category.isActive = false;
    await category.save();

    res.status(200).json({
      success: true,
      message: "Category deactivated successfully",
    });
  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};

/* ================= HARD DELETE CATEGORY (SAFE) ================= */
export const hardDeleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const childCategories = await Category.find({
      parent: categoryId,
    }).select("_id");

    const categoryIdsToCheck = [
      categoryId,
      ...childCategories.map((c) => c._id),
    ];

    const productExists = await Product.findOne({
      category: { $in: categoryIdsToCheck },
    });

    if (productExists) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete category permanently. Products are associated with it.",
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Category permanently deleted",
    });
  } catch (error) {
    console.error("Hard Delete Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete category permanently",
    });
  }
};

/* ================= CATEGORY TREE ================= */
export const getCategoryTree = async (req, res) => {
  try {
    // 1️⃣ Fetch all active categories
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .lean(); // important for performance

    // 2️⃣ Create map (id → category)
    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat._id] = { ...cat, children: [] };
    });

    // 3️⃣ Build tree
    const tree = [];

    categories.forEach((cat) => {
      if (cat.parent) {
        // child category
        if (categoryMap[cat.parent]) {
          categoryMap[cat.parent].children.push(categoryMap[cat._id]);
        }
      } else {
        // root category
        tree.push(categoryMap[cat._id]);
      }
    });

    res.status(200).json({
      success: true,
      categories: tree,
    });
  } catch (error) {
    console.error("Category Tree Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch category tree",
    });
  }
};
