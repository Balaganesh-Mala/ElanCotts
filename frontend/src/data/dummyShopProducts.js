import image1 from "../assets/images/image1.jpg";
import image2 from "../assets/images/image2.jpg";
import image3 from "../assets/images/image3.jpg";
import image4 from "../assets/images/image4.jpg";
import image5 from "../assets/images/image5.jpg";

export const shopProducts = [
  {
    id: 1,
    name: "Black Leather Office Bag",
    price: 2499,
    rating: 4.8,
    category: "Office",
    stock: 50,
    brand: "Nike",
    images: [image1, image2, image3, image4], // 4 images ✅
    sizes: {
      shirt: ["S", "M", "L", "XL", "XXL"],
    },
    description:
      "Premium black leather office bag with elegant finish, spacious compartments, waterproof inner lining, smooth zippers, lightweight build, and luxury professional look. Ideal for daily office, business meetings, and travel use.",
    mrp: 2699.0,
    isFeatured: true,
    isBestSeller: true,
    isActive: true,
    ratings: 5,
    reviews: [{ name: "ganesh", rating: 5, comment: "super premium product!" }],
  },

  {
    id: 2,
    name: "Grey Casual Backpack",
    price: 1299,
    rating: 4.1,
    category: "Casual",
    stock: 30,
    brand: "Puma",
    images: [image2, image1, image3, image5],
    sizes: {
      shirt: ["S", "M", "L", "XL", "XXL"],
    },
    description:
      "Stylish grey casual backpack made with durable fabric, lightweight design, large storage capacity with multi-purpose compartments. Best for college, office, and travel use.",
    mrp: 1499.0,
    isFeatured: false,
    isBestSeller: true,
    isActive: true,
    ratings: 4,
    reviews: [{ name: "ganesh", rating: 4, comment: "Comfortable daily use bag." }],
  },

  {
    id: 3,
    name: "Premium Brown Leather Bag",
    price: 3199,
    rating: 4.7,
    category: "Office",
    stock: 20,
    brand: "Nike",
    images: [image3, image2, image1, image4],
    sizes: {
      shirt: ["S", "M", "L", "XL", "XXL"],
    },
    description:
      "Luxury premium brown leather bag with handcrafted finishing, ultra-soft inner lining, sturdy strap, and rust-free metal zippers. Suitable for business professionals and long-term use.",
    mrp: 3499.0,
    isFeatured: true,
    isBestSeller: false,
    isActive: true,
    ratings: 5,
    reviews: [{ name: "ganesh", rating: 5, comment: "Looks amazing and premium!" }],
  },

  {
    id: 4,
    name: "Blue College Bag",
    price: 999,
    rating: 3.9,
    category: "College",
    stock: 40,
    brand: "Skybags",
    images: [image4, image1, image2, image3],
    sizes: {
      shirt: ["S", "M", "L", "XL", "XXL"],
      pant: ["28", "30", "32", "34", "36", "38", "40", "42"],
    },
    description:
      "Trendy blue denim college backpack with durable build, stylish zipper, padded shoulder straps, and ergonomic design. Perfect for students who carry laptops, books, and accessories.",
    mrp: 1299.0,
    isFeatured: false,
    isBestSeller: true,
    isActive: true,
    ratings: 3,
    reviews: [{ name: "ganesh", rating: 3, comment: "Good, but can be better." }],
  },

  {
    id: 5,
    name: "Classic Black Jeans",
    price: 1699,
    rating: 4.4,
    category: "Pants",
    stock: 25,
    brand: "Levi's",
    images: [image4, image5, image3, image2],
    sizes: {
      pant: ["28", "30", "32", "34", "36", "38", "40", "42"],
    },
    description:
      "Comfortable stretchable denim jeans with slim fit, durable fabric, premium stitching, fade-resistant color, breathable feel, and classic casual style. Suitable for daily, college and travel wear.",
    mrp: 1899.0,
    isFeatured: true,
    isBestSeller: true,
    isActive: true,
    ratings: 4,
    reviews: [{ name: "ganesh", rating: 4, comment: "Great fit and comfort!" }],
  },

  {
    id: 6,
    name: "Minimal Cream Backpack",
    price: 1099,
    rating: 4.0,
    category: "Bags",
    stock: 25,
    brand: "Wildcraft",
    images: [image1, image3, image2, image5],
    sizes: {
      pant: ["Free Size"],
    },
    description:
      "Minimal cream-color modern backpack with lightweight build, premium canvas material, soft straps and clean stylish look. Suitable for office, casual or everyday use.",
    mrp: 1199.0,
    isFeatured: false,
    isBestSeller: false,
    isActive: true,
    ratings: 4,
    reviews: [{ name: "ganesh", rating: 4, comment: "Simple and clean bag design." }],
  },

  {
    id: 7,
    name: "Formal White Shirt",
    price: 1299,
    rating: 4.2,
    category: "Shirts",
    stock: 10,
    brand: "Raymond",
    images: [image1,image2,image3,image4],
    sizes: {
      shirt: ["S", "M", "L", "XL", "XXL"],
    },
    description:
      "Formal white cotton shirt with soft breathable fabric, regular fit, lightweight feel, wrinkle-free finish and premium buttons. Best for office, interviews and formal occasions.",
    mrp: 1499.0,
    isFeatured: false,
    isBestSeller: false,
    isActive: true,
    ratings: 4,
    reviews: [{ name: "ganesh", rating: 4, comment: "Good shirt quality 👔" }],
  }
];
