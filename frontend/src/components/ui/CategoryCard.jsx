import React from "react";
import { Link } from "react-router-dom";

const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/category-products?category=${category._id}`} // ✅ link with _id
      className="block group cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden border"
    >
      <img
        src={category.image?.url}
        alt={category.name}
        className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
      />
      <div className="p-3 text-center">
        <h3 className="text-base md:text-lg font-semibold text-gray-800 group-hover:text-black transition">
          {category.name}
        </h3>
      </div>
    </Link>
  );
};

export default CategoryCard;
