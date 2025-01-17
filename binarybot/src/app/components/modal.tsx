"use client";
import React, { ReactNode } from "react";

interface ReusableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode; // Explicitly define children as ReactNode
}

const Modal: React.FC<ReusableModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  const APP_ID = process.env.NEXT_PUBLIC_APP_ID;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-11/12 sm:w-3/4 md:w-2/3 lg:w-2/5 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-600">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            ✖
          </button>
        </div>

        {/* Content */}
        <div>{children}</div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-evenly mt-6 gap-4">
          <button
            onClick={() =>
              (window.location.href = "https://hub.deriv.com/tradershub/signup")
            }
            className="bg-red-600 text-white px-4 py-2 rounded-2xl hover:bg-red-700 w-full sm:w-auto"
          >
            NO, CREATE AN ACCOUNT
          </button>
          <button
            onClick={() =>
              (window.location.href = `https://oauth.deriv.com/oauth2/authorize?app_id=${APP_ID}`)
            }
            className="bg-gray-800 text-white px-4 py-2 rounded-2xl hover:bg-gray-700 w-full sm:w-auto"
          >
            YES, LET&apos;S LOGIN
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
