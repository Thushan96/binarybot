"use client";

import React from "react";
import { FaUserCircle } from "react-icons/fa";

const TopBar: React.FC = () => {
  return (
    <div className="relative flex flex-wrap items-center justify-between bg-blue-900 text-white px-6 py-3 shadow-md w-full lg:w-5/6 lg:ml-60 md:ml-40 sm:ml-0">
      {/* Left Section: Account Details */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm md:text-base font-semibold">VRTC12183974</span>
          <span className="text-xs md:text-sm bg-yellow-500 text-blue-900 rounded px-2 py-1">
            Virtual
          </span>
        </div>

        {/* 10000 USD in a new row */}
        <div className="text-sm md:text-base font-semibold">
          <span>10000 USD</span>
        </div>
      </div>

      {/* Right Section: User Email */}
      <div className="flex items-center gap-3">
        <FaUserCircle className="text-lg md:text-2xl" />
        <span className="text-xs md:text-sm truncate max-w-xs">
          samadhinilakshana1999@gmail.com
        </span>
      </div>
    </div>
  );
};

export default TopBar;