import React from 'react';
import { Link } from 'react-router-dom';

const AdminNav = () => {
  return (
    <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center relative">
      {/* Left Spacer */}
      <div className="w-1/3" />

      {/* Center: Logo */}
      <div className="w-1/3 text-center">
        <Link to="/" className="text-2xl font-bold text-blue-700 font-dancing">
          StreetSense
        </Link>
      </div>

      {/* Right Spacer (optional or add profile/logout if needed later) */}
      <div className="w-1/3" />
    </nav>
  );
};

export default AdminNav;
