import React from 'react';
import { Link } from 'react-router-dom';
import homeimage from '../images/home.png';

const Home = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col justify-center items-center text-white"
      style={{
        backgroundImage: `url(${homeimage})`
      }}
      
    >
      <h1 className="text-5xl font-bold font-dancing mb-6 drop-shadow-lg">StreetSense</h1>

      <Link to="/login">
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-semibold shadow-lg transition">
          Get Started
        </button>
      </Link>
    </div>
  );
};

export default Home;
