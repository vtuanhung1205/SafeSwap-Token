import React from "react";
import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-6 bg-transparent text-white">
      <div className="relative z-10 flex flex-col items-center">
        {/* Icon */}
        <div className="mb-8 p-5 bg-gray-800/50 border border-[#23232a] rounded-full">
          <SearchX className="h-16 w-16 text-cyan-400" strokeWidth={1.5} />
        </div>

        {/* 404 Title */}
        <h1 className="text-8xl md:text-9xl font-black bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent mb-4">
          404
        </h1>

        {/* Page Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-lg text-gray-400 mb-10 max-w-md mx-auto">
          Oops! The page you are looking for doesn't exist. It might have been
          moved, deleted, or you may have mistyped the URL.
        </p>

        {/* CTA Button */}
        <Link
          to="/"
          className="inline-block px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105"
        >
          Go Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;