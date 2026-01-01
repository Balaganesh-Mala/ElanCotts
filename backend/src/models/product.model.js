import mongoose from "mongoose";

/* ================= REVIEW SCHEMA ================= */
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
    },

    images: [
      {
        public_id: String,
        url: String,
      },
    ],

    verifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/* ================= SIZE SCHEMA ================= */
const sizeSchema = new mongoose.Schema(
  {
    size: {
      type: String, // S, M, L, XL
      required: true,
      trim: true,
    },

    sku: {
      type: String, // Shiprocket SKU (unique per size)
      required: true,
      trim: true,
    },

    mrp: {
      type: Number,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    weight: {
      type: Number, // grams (Shiprocket)
      required: true,
    },

    dimensions: {
      length: Number, // cm
      breadth: Number,
      height: Number,
    },
  },
  { _id: false }
);

/* ================= VARIANT (COLOR) SCHEMA ================= */
const variantSchema = new mongoose.Schema(
  {
    color: {
      type: String,
      required: true,
      trim: true,
    },

    images: [
      {
        public_id: String,
        url: String,
      },
    ],

    sizes: {
      type: [sizeSchema],
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

/* ================= PRODUCT SCHEMA ================= */
const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    brand: {
      type: String,
      default: "Elan Cotts",
      trim: true,
    },

    company: {
      type: String,
      default: "Hunger",
      trim: true,
    },

    /* 🔗 CATEGORY REFERENCES */
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex"],
      required: true,
    },

    shortDescription: {
      type: String,
      required: true,
      trim: true,
    },

    longDescription: {
      type: String,
      trim: true,
    },

    attributes: {
      fabric: String,
      fit: String,
      sleeve: String,
      occasion: String,
      washCare: String,
      countryOfOrigin: String,
    },

    /* ✅ COLOR VARIANTS */
    variants: {
      type: [variantSchema],
      required: true,
    },

    /* ================= REVIEWS ================= */
    reviews: [reviewSchema],

    ratingsAverage: {
      type: Number,
      default: 0,
    },

    ratingsCount: {
      type: Number,
      default: 0,
    },

    /* ================= FLAGS ================= */
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    isBestSeller: {
      type: Boolean,
      default: false,
      index: true,
    },

    isNewArrival: {
      type: Boolean,
      default: false,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    /* ================= POLICIES ================= */
    returnPolicy: {
      isReturnable: {
        type: Boolean,
        default: true,
      },
      returnDays: {
        type: Number,
        default: 7,
      },
    },

    shipping: {
      codAvailable: {
        type: Boolean,
        default: true,
      },
      shiprocketEnabled: {
        type: Boolean,
        default: true,
      },
    },

    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */
productSchema.index({ name: "text", shortDescription: "text" });
productSchema.index({ category: 1, isActive: 1 });

const Product = mongoose.model("Product", productSchema);
export default Product;
