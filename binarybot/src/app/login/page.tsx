"use client";

import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import Modal from "@/app/components/modal";
import deriv from "../deriv.png";
import aiTrader from "../aiTrader.png";

export default function Login() {
  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Head>
        <title>Login</title>
      </Head>
      <div
        className="flex flex-col md:flex-row items-center justify-between bg-white rounded-lg shadow-lg p-8 w-full max-w-5xl"
        style={{ width: "785px", height: "500px" }}
      >
        {/* Left Section */}
        <div className="md:w-1/2 flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Free Binary Bot & Deriv Bot
          </h1>
          <p className="text-gray-600 mb-6">Click to start free AutoTrading</p>
          <Image width="150" height="80" src={deriv} alt="/" />
          <p className="text-sm mt-6 text-gray-600">
            Binary Bot and Deriv Bot auto trading platforms.
          </p>
          <p className="text-sm text-gray-600">Start your algorithmic trading journey today!</p>
          <button
            className="bg-red-600 mt-6 text-white py-2 px-4 rounded-md shadow-md hover:bg-red-700 w-full md:w-auto"
          >
            NO TOKEN? CREATE AN ACCOUNT
          </button>
        </div>

        {/* Vertical Divider */}
        <div className="hidden md:block w-[1px] bg-gray-300 h-full mx-4"></div>

        {/* Right Section */}
        <div className="md:w-1/2 flex flex-col items-center justify-center text-center p-4">
          <div className="text-center md:w-1/2 rounded-lg p-6">
            <Image width="200" height="120" src={aiTrader} alt="/" />
          </div>
          <div className="flex flex-col items-center mb-6">
            <button className="flex items-center justify-center w-full py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700 " 
                onClick={openModal}>
              LOGIN WITH{" "}
              <span className="ml-2 font-bold text-red-500">DERIV</span>
            </button>
            <p className="text-gray-500 my-4">OR</p>
            <input
              type="text"
              placeholder="Enter API Token"
              className="w-full border border-gray-300 rounded-md py-2 px-4 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
            />
            <button className="bg-gray-800 text-white py-2 px-4 rounded-md shadow-md hover:bg-gray-700 w-[20rem]">
              SIGN IN
            </button>
          </div>
        </div>
      </div>

      {/* Reusable Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Already have an account?">
        <p className="text-gray-600 mb-4">
          You already have an existing Deriv or Binary account?
        </p>
        <label className="flex items-center text-gray-600">
          <input
            type="checkbox"
            className="mr-2 border-gray-300 rounded"
          />
          Don't show this message again
        </label>
      </Modal>
    </div>
  );
}
