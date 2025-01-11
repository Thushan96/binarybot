"use client";

import React, { useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

interface TopBarProps {
  isExpanded: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ isExpanded }) => {
  const selectedAccount = useSelector((state: RootState) => state.selectedAccount);

  useEffect(() => {
    console.log(selectedAccount);
  }, [selectedAccount]);

  return (
    <div
      className={`flex flex-wrap items-center justify-between bg-blue-900 text-white px-6 py-3 shadow-md transition-all duration-300 ${
        isExpanded ? "ml-60" : "ml-16"
      }`}
    >
      {/* Account Info */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {/* Display Login ID */}
          <span
            className="text-sm md:text-base font-semibold cursor-pointer hover:text-cyan-400"
            onClick={() =>
              console.log(`${selectedAccount?.loginid || ""} clicked`)
            }
          >
            {selectedAccount?.loginid || ""}
          </span>
          {/* Account Type (Virtual/Real) */}
          <span
            className={`text-xs md:text-sm rounded px-2 py-1 ${
              selectedAccount
                ? selectedAccount.is_virtual
                  ? "bg-yellow-500 text-blue-900"
                  : "bg-green-500 text-white"
                : "bg-none"
            }`}
          >
            {selectedAccount
              ? selectedAccount.is_virtual
                ? "Virtual"
                : "Real"
              : ""}
          </span>

        </div>

        {/* Display Balance and Currency */}
        <div
          className="text-sm md:text-base font-semibold cursor-pointer hover:text-cyan-400"
          onClick={() =>
            console.log(
              `${selectedAccount?.balance ?? ""} ${
                selectedAccount?.currency || ""
              } clicked`
            )
          }
        >
          <span>
            {selectedAccount?.balance !== undefined && selectedAccount?.currency
              ? `${selectedAccount.balance} ${selectedAccount.currency}`
              : ""}
          </span>
        </div>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-3">
        <FaUserCircle className="text-lg md:text-2xl" />
        <span
          className="text-xs md:text-sm truncate max-w-xs cursor-pointer hover:text-cyan-400"
          onClick={() =>
            console.log(`Email clicked: ${selectedAccount?.userEmail || ""}`)
          }
        >
          {selectedAccount?.userEmail || ""}
        </span>
      </div>
    </div>
  );
};

export default TopBar;
