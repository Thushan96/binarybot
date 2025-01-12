"use client";

import React from "react";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiBankLine,
} from "react-icons/ri";
import { MdOutlineLogout } from "react-icons/md";
import {
  FaTelegramPlane,
  FaYoutube,
  FaFacebook,
} from "react-icons/fa";
import { SiOpenai } from "react-icons/si";
import { RiExchangeFundsLine } from "react-icons/ri";
import { AiOutlineShoppingCart } from "react-icons/ai";
import Image from "next/image";
import binarybot from "../binarybot.png";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { clearSelectedAccount, setSelectedAccount } from "../redux/slices/selectedAccountSlice";
import { useWebSocket } from "../contexts/WebSocketContext";
import { clearAccounts } from "../redux/slices/accountsSlice";
import { clearAuthStates } from "../redux/slices/authSlice";
import { clearUser } from "../redux/slices/userSlice";
import { useRouter } from "next/navigation";

interface SideNavbarProps {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
}

const SideNavbar: React.FC<SideNavbarProps> = ({
  isExpanded,
  setIsExpanded,
}) => {
  const toggleSidebar = () => setIsExpanded(!isExpanded);
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const { sendMessage,isConnected, reconnect } = useWebSocket();
  const router = useRouter();

  const supportItems = [
    { label: "Join Telegram", icon: FaTelegramPlane },
    { label: "Youtube", icon: FaYoutube },
    { label: "Facebook", icon: FaFacebook },
  ];

  const otherItems = [
    { label: "AI Signal Trader🆕", icon: SiOpenai },
    { label: "Free Copy Trading", icon: RiExchangeFundsLine },
    { label: "Binary Store", icon: AiOutlineShoppingCart },
  ];

  const logout = async () =>{
    dispatch(clearAccounts());
    dispatch(clearAuthStates());
    dispatch(clearSelectedAccount());
    dispatch(clearUser());
    router.push("/login");
  }

  const selectAccount = async (loginid: string) => {
    const selectedState = auth.authStates.find((state) => state.loginid === loginid);
    if (selectedState) {
      if(!isConnected) {
       await reconnect();
      }
      sendMessage({ authorize: selectedState.token });
      console.log("on click", selectedState);
      
      dispatch(
        setSelectedAccount({
          loginid: selectedState.loginid,
          currency: selectedState.currency,
          balance: selectedState.balance,
          token: selectedState.token,
          is_virtual: selectedState.is_virtual,
          userEmail: selectedState.userEmail,
        })
      );
    }
  };

  return (
    <div
      className={`fixed top-0 h-screen bg-blue-900 z-20 transition-all duration-300 ${
        isExpanded ? "w-60" : "w-16"
      }`}
    >
      <div className="flex flex-col justify-between h-full p-4">
        {/* Top Section */}
        <div>
          {/* Collapse/Expand Button */}
          <div
            className="flex items-center justify-end mb-6 cursor-pointer text-white"
            onClick={toggleSidebar}
          >
            {isExpanded ? (
              <RiArrowLeftSLine className="text-2xl" />
            ) : (
              <RiArrowRightSLine className="text-2xl" />
            )}
          </div>

          <div className="mb-6 flex items-center justify-center cursor-pointer">
            <Image width="80" height="30" src={binarybot} alt="/" />
          </div>

          {/* Select Account Section */}
          <div className="my-5 border-b border-gray-100 pb-3">
            <h2
              className={`text-xs font-semibold text-white mb-2 ${
                isExpanded ? "block" : "hidden"
              }`}
            >
              Select Account
            </h2>
            {auth.authStates.length > 0 &&
              auth.authStates.map((state, index) => (
                <div
                  onClick={() => selectAccount(state.loginid)}
                  key={index}
                  className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-md group cursor-pointer hover:shadow-lg"
                >
                  <RiBankLine className="text-lg text-gray-300 group-hover:text-white" />
                  {isExpanded && (
                    <h3 className="text-xs sm:text-sm text-gray-300 group-hover:text-white font-semibold">
                      {state.loginid} - {state.currency}
                    </h3>
                  )}
                </div>
              ))}
          </div>

          {/* Support Section */}
          <div className="my-5 border-b border-gray-100 pb-3">
            <h2
              className={`text-xs font-semibold text-white mb-2 ${
                isExpanded ? "block" : "hidden"
              }`}
            >
              Support
            </h2>
            {supportItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-md group cursor-pointer hover:shadow-lg"
              >
                <item.icon className="text-lg text-gray-300 group-hover:text-white" />
                {isExpanded && (
                  <h3 className="text-xs sm:text-sm text-gray-300 group-hover:text-white font-semibold">
                    {item.label}
                  </h3>
                )}
              </div>
            ))}
          </div>

          {/* Other Section */}
          <div className="my-5">
            <h2
              className={`text-xs font-semibold text-white mb-2 ${
                isExpanded ? "block" : "hidden"
              }`}
            >
              Other
            </h2>
            {otherItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-md group cursor-pointer hover:shadow-lg"
              >
                <item.icon className="text-lg text-gray-300 group-hover:text-white" />
                {isExpanded && (
                  <h3 className="text-xs sm:text-sm text-gray-300 group-hover:text-white font-semibold">
                    {item.label}
                  </h3>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="my-5">
          <div onClick={logout} className="flex items-center gap-3 p-2 border border-gray-700 hover:bg-gray-800 rounded-md group cursor-pointer hover:shadow-lg">
            <MdOutlineLogout className="text-lg text-gray-300 group-hover:text-white" />
            {isExpanded && (
              <h3 className="text-sm text-gray-300 group-hover:text-white font-semibold">
                Logout
              </h3>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideNavbar;
