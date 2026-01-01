import React from "react";
import { FaSearch } from "react-icons/fa";


const ShopFilters = ({
  search, setSearch,
  category, setCategory,
  sort, setSort,
  rating, setRating,
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-wrap gap-4 items-center justify-between">

      {/* Search */}
      <div className="flex items-center bg-gray-100 px-3 py-2 rounded-full w-full sm:w-64">
        <FaSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search products..."
          className="bg-transparent outline-none text-sm w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category Filter */}
      <select
        className="bg-gray-100 px-3 py-2 text-sm rounded-full outline-none"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">All Categories</option>
        <option value="Casual">Casual</option>
        <option value="Office">Office</option>
        <option value="College">College</option>
        <option value="Travel">Travel</option>
      </select>

      {/* Rating Filter */}
      <select
        className="bg-gray-100 px-3 py-2 text-sm rounded-full outline-none"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
      >
        <option value="">All Ratings</option>
        <option value="4">4 ★ & above</option>
        <option value="3">3 ★ & above</option>
      </select>

      {/* Sorting */}
      <select
        className="bg-gray-100 px-3 py-2 text-sm rounded-full outline-none"
        value={sort}
        onChange={(e) => setSort(e.target.value)}
      >
        <option value="">Sort By</option>
        <option value="low-high">Price: Low → High</option>
        <option value="high-low">Price: High → Low</option>
        <option value="top-rated">Top Rated</option>
      </select>

    </div>
  );
};

export default ShopFilters;
