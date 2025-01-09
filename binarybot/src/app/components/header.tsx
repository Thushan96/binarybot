
import React from 'react';
import { AiOutlineMenu } from 'react-icons/ai';

const Header: React.FC = () => {
  return (
    <header className="bg-blue-900 text-white p-4 flex items-center justify-between">
      {/* Logo Section */}
      <div className="flex items-center space-x-2">
        <AiOutlineMenu size={24} className="cursor-pointer" />
        <h1 className="text-xl font-bold">BinaryBot</h1>
      </div>

      {/* User Info Section */}
      <div className="flex items-center space-x-4">
        <div className="hidden sm:block">
          <p className="text-sm">VRTC1238349</p>
          <p className="text-sm font-bold">$10,091.23 USD</p>
        </div>
        <div className="text-sm">meadowmystic4@gmail.com</div>
      </div>
    </header>
  );
};

export default Header;
