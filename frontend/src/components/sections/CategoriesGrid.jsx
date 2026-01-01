import React from "react";
import { categories } from "../../data/dummyCategories";
import CategoryCard from "../ui/CategoryCard";

const CategoriesGrid = () => {
  return (
    <section className="px-6 py-10">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Categories
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </section>
  );
};

export default CategoriesGrid;
