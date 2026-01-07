import React from "react";
import { Link } from "react-router-dom";
import notfoundImg from "../assets/images/notfound.png";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-lg w-full text-center ">

        {/* IMAGE */}
        <div className="flex justify-center mb-6">
          <img
            src={notfoundImg}
            alt="Page not found"
            className="w-52 h-auto"
          />
        </div>

        {/* TEXT */}
        <h1 className="text-5xl font-extrabold text-slate-800 mb-2">
          404
        </h1>

        <p className="text-lg font-semibold text-slate-700">
          Page not found
        </p>

        <p className="text-sm text-slate-500 mt-2 mb-8">
          Sorry, the page you’re looking for doesn’t exist or was moved.
        </p>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium
                       hover:bg-indigo-700 transition"
          >
            Go to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="px-6 py-2.5 border border-slate-300 rounded-xl text-sm font-medium
                       text-slate-700 hover:bg-slate-100 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
