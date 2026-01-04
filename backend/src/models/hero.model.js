import mongoose from "mongoose";

const heroImageSchema = new mongoose.Schema(
  {
    public_id: String,
    url: String,
  },
  { _id: false }
);

const heroSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, required: true },
    buttonText: { type: String, required: true },

    // 🔥 CTA LINK
    linkType: {
      type: String,
      enum: ["INTERNAL", "EXTERNAL", "ANCHOR"],
      default: "INTERNAL",
    },
    type: {
      type: String,
      enum: ["HERO", "FIXED_BANNER"],
      required: true,
    },

    link: {
      type: String,
      default: "",
    },

    image: heroImageSchema,

    isActive: { type: Boolean, default: true },

    // 🔥 ORDER IS IMPORTANT (banner priority)
    order: { type: Number, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

const HeroSlide = mongoose.model("HeroSlide", heroSchema);
export default HeroSlide;
