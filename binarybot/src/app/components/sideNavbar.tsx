"use client";

import React from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { Disclosure } from "@headlessui/react";
import {
  MdOutlineLogout,
  MdOutlineIntegrationInstructions,
} from "react-icons/md"; 
import { RiBankLine } from "react-icons/ri"; 

import { FaTelegramPlane, FaYoutube, FaFacebook } from "react-icons/fa";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { SiOpenai } from "react-icons/si";
import { RiExchangeFundsLine } from "react-icons/ri";
import Image from "next/image";
import binarybot from "../binarybot.png"

const SideNavbar: React.FC = () => {
  return (
    <div>
      <Disclosure as="nav">
        <Disclosure.Button className="absolute top-4 right-2 inline-flex items-center peer justify-center rounded-md p-2 text-white hover:bg-gray-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white group">
          <GiHamburgerMenu
            className="block md:hidden h-5 w-5"
            aria-hidden="true"
          />
        </Disclosure.Button>
        <div className="p-6 w-1/2 h-screen bg-blue-900 z-20 fixed top-0 -left-96 lg:left-0 lg:w-60 peer-focus:left-0 peer:transition ease-out delay-150 duration-200">
          <div className="flex flex-col justify-start items-start">
            {/* Binary Bot Bird Image */}
            <div className="mb-6 flex items-center justify-center">
            <Image width="80" height="30" src={binarybot} alt="/" />
            </div>

            {/* Select Account Section */}
            <div className="my-5 border-b border-gray-100 pb-3">
              <h2 className="text-xs font-semibold text-white mb-2">
                Select Account
              </h2>
              <div className="flex mb-2 justify-start items-center gap-3 p-2 hover:bg-gray-800 rounded-md group cursor-pointer hover:shadow-lg m-auto">
                <RiBankLine className="text-lg text-gray-300 group-hover:text-white" />
                <h3 className="text-xs sm:text-sm text-gray-300 group-hover:text-white font-semibold">
                  VRTC12183974 - USD
                </h3>
              </div>
            </div>

            {/* Support Section */}
            <div className="my-5 border-b border-gray-100 pb-3">
              <h2 className="text-xs font-semibold text-white mb-2">Support</h2>
              {supportItems.map((item) => (
                <div
                  key={item.label}
                  className="flex mb-2 justify-start items-center gap-3 pl-4 hover:bg-gray-800 p-2 rounded-md group cursor-pointer hover:shadow-lg m-auto"
                >
                  <item.icon className="text-lg text-gray-300 group-hover:text-white" />
                  <h3 className="text-xs sm:text-sm text-gray-300 group-hover:text-white font-semibold">
                    {item.label}
                  </h3>
                </div>
              ))}
            </div>

            {/* Other Section */}
            <div className="my-5">
              <h2 className="text-xs font-semibold text-white mb-2">Other</h2>
              {otherItems.map((item) => (
                <div
                  key={item.label}
                  className="flex mb-2 justify-start items-center gap-3 pl-4 hover:bg-gray-800 p-2 rounded-md group cursor-pointer hover:shadow-lg m-auto"
                >
                  <item.icon className="text-lg text-gray-300 group-hover:text-white" />
                  <h3 className="text-xs sm:text-sm text-gray-300 group-hover:text-white font-semibold">
                    {item.label}
                  </h3>
                </div>
              ))}
            </div>

            {/* Logout Section */}
            <div className="my-5">
              <div className="flex mb-2 justify-start items-center gap-3 pl-4 border border-gray-700 hover:bg-gray-800 p-2 rounded-md group cursor-pointer hover:shadow-lg m-auto">
                <MdOutlineLogout className="text-lg text-gray-300 group-hover:text-white" />
                <h3 className="text-sm text-gray-300 group-hover:text-white font-semibold">
                  Logout
                </h3>
              </div>
            </div>
          </div>
        </div>
      </Disclosure>
    </div>
  );
};

export default SideNavbar;

// Support Items
const supportItems = [
  { label: "Join Telegram", icon: FaTelegramPlane },
  { label: "Youtube", icon: FaYoutube },
  { label: "Facebook", icon: FaFacebook },
];

// Other Items
const otherItems = [
  { label: "AI Signal Trader🆕", icon: SiOpenai },
  { label: "Free Copy Trading", icon: RiExchangeFundsLine },
  { label: "Binary Store", icon: AiOutlineShoppingCart },
]