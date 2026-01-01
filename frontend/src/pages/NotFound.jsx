import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800">
      <h1 className="text-6xl font-extrabold mb-4">404</h1>
      <p className="text-lg mb-6">Page Not Found</p>
      <Link to="/" className="px-5 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-700 transition">
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
