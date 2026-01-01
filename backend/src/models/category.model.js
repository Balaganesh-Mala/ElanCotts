import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    categoryId: {
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

    description: {
      type: String,
      trim: true,
    },

    image: {
      public_id: String,
      url: String,
    },

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null, // null = main category
    },

    level: {
      type: Number,
      default: 1, // 1 = main, 2 = sub, 3 = child
    },

    order: {
      type: Number,
      default: 0, // menu sorting
    },

    showInMenu: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
  },
  { timestamps: true }
);

/* 🔥 INDEXES */
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });

const Category = mongoose.model("Category", categorySchema);
export default Category;
