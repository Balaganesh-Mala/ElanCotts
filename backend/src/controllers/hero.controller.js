import asyncHandler from "express-async-handler";
import HeroSlide from "../models/hero.model.js";
import cloudinary from "../config/cloudinary.js";
import sharp from "sharp";

/* =====================================================
   🧠 HELPERS
===================================================== */

const getSlideType = (order) => {
  if (order >= 1 && order <= 9) return "HERO";
  if (order >= 10 && order <= 20) return "FIXED_BANNER";
  return "UNKNOWN";
};

const uploadImageToCloudinary = async (buffer) => {
  const optimized = await sharp(buffer)
    .resize({
      width: 1920, // Full HD banners
      withoutEnlargement: true,
      fit: "inside",
    })
    .sharpen({
      // IMPORTANT
      sigma: 0.6,
      m1: 0.5,
      m2: 0.5,
    })
    .webp({
      quality: 92, // 🔥 increase quality
      effort: 6, // better compression algorithm
      smartSubsample: true, // preserves text & edges
    })
    .toBuffer();

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "ecommerce-hero-banners" }, (err, result) => {
        if (err) reject(err);
        else
          resolve({
            public_id: result.public_id,
            url: result.secure_url,
          });
      })
      .end(optimized);
  });
};

/* =====================================================
   ➕ CREATE SLIDE (ADMIN)
===================================================== */
export const createHeroSlide = asyncHandler(async (req, res) => {
  const { title, subtitle, buttonText, order, link = "", linkType } = req.body;

  if (!title || !subtitle || !buttonText || order === undefined) {
    return res.status(400).json({
      success: false,
      message: "Title, subtitle, button text & order required ❌",
    });
  }

  const numericOrder = Number(order);
  const slideType = getSlideType(numericOrder);

  if (slideType === "UNKNOWN") {
    return res.status(400).json({
      success: false,
      message: "Order must be between 1–20 ❌",
    });
  }

  const exists = await HeroSlide.findOne({ order: numericOrder });
  if (exists) {
    return res.status(400).json({
      success: false,
      message: "Slide order already exists ❌",
    });
  }

  const safeLinkType = ["INTERNAL", "EXTERNAL", "ANCHOR"].includes(linkType)
    ? linkType
    : "INTERNAL";

  let image = null;
  if (req.file) {
    image = await uploadImageToCloudinary(req.file.buffer);
  }

  const slide = await HeroSlide.create({
    title,
    subtitle,
    buttonText,
    link,
    linkType: safeLinkType,
    order: numericOrder,
    type: slideType,
    image,
  });

  res.status(201).json({
    success: true,
    message: "Slide created",
    slide,
  });
});

/* =====================================================
   📦 GET SLIDES (PUBLIC)
===================================================== */
export const getHeroSlides = asyncHandler(async (req, res) => {
  const slides = await HeroSlide.find({ isActive: true }).sort({ order: 1 });

  res.status(200).json({
    success: true,
    hero: slides.filter((s) => s.type === "HERO"),
    fixedBanners: slides.filter((s) => s.type === "FIXED_BANNER"),
  });
});

/* =====================================================
   ✏ UPDATE SLIDE (ADMIN)
===================================================== */
export const updateHeroSlide = asyncHandler(async (req, res) => {
  const slide = await HeroSlide.findById(req.params.id);
  if (!slide) {
    return res.status(404).json({
      success: false,
      message: "Slide not found",
    });
  }

  const { title, subtitle, buttonText, order, isActive, link, linkType } =
    req.body;

  if (order !== undefined) {
    const numericOrder = Number(order);
    const slideType = getSlideType(numericOrder);

    if (slideType === "UNKNOWN") {
      return res.status(400).json({
        success: false,
        message: "Order must be between 1–20",
      });
    }

    const exists = await HeroSlide.findOne({
      order: numericOrder,
      _id: { $ne: slide._id },
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Order already in use",
      });
    }

    slide.order = numericOrder;
    slide.type = slideType;
  }

  if (req.file) {
    if (slide.image?.public_id) {
      await cloudinary.uploader.destroy(slide.image.public_id);
    }
    slide.image = await uploadImageToCloudinary(req.file.buffer);
  }

  const safeLinkType = ["INTERNAL", "EXTERNAL", "ANCHOR"].includes(linkType)
    ? linkType
    : slide.linkType;

  slide.title = title ?? slide.title;
  slide.subtitle = subtitle ?? slide.subtitle;
  slide.buttonText = buttonText ?? slide.buttonText;
  slide.link = link ?? slide.link;
  slide.linkType = safeLinkType;

  if (isActive !== undefined) {
    slide.isActive = isActive === "true" || isActive === true;
  }

  await slide.save();

  res.json({
    success: true,
    message: "Slide updated",
    slide,
  });
});

/* =====================================================
   ❌ DELETE SLIDE (ADMIN)
===================================================== */
export const deleteHeroSlide = asyncHandler(async (req, res) => {
  const slide = await HeroSlide.findById(req.params.id);
  if (!slide) {
    return res
      .status(404)
      .json({ success: false, message: "Slide not found" });
  }

  if (slide.image?.public_id) {
    await cloudinary.uploader.destroy(slide.image.public_id);
  }

  await slide.deleteOne();

  res.status(200).json({
    success: true,
    message: "Slide deleted",
  });
});
