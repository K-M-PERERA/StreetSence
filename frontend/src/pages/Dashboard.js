import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const language = localStorage.getItem('language'); // '0' for Sinhala

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyA9ivaZ1fgd737hpRLtqMCLxNVIxZi-a_o',
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <p>{language === '0' ? 'පැටවීම සිදුවෙමින් පවතී...' : 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-inter">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 animate-fadeIn">
          👋 {language === '0' ? ' සාදරයෙන් පිළිගනිමු' : 'Welcome back'}, {user.displayName || user.email}
        </h1>

        {/* Map Preview Card */}
        <div
          className="col-span-2 mb-6 cursor-pointer"
          onClick={() => navigate('/issues-map')}
        >
          <div className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition w-full h-64 relative">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={{ lat: 6.9271, lng: 79.8612 }}
                zoom={11}
                options={{
                  disableDefaultUI: true,
                  gestureHandling: 'none',
                  zoomControl: false,
                }}
              />
            ) : (
              <div className="w-full h-full flex justify-center items-center">
                {language === '0' ? 'සිතියම පූරණය වෙමින් පවතී...' : 'Loading map...'}
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-10 hover:bg-opacity-20 transition flex justify-center items-center text-white font-bold text-lg">
              🗺️ {language === '0' ? 'සියලු පැමිණීම් බලන්න' : 'Click to view all issues'}
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Submit Issue */}
          <Link to="/submit">
            <div className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition hover:-translate-y-1 duration-300">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">📍 {language === '0' ? 'නව පැමිණිල්ලක් යවන්න' : 'Submit New Issue'}</h2>
              <p className="text-gray-500">
                {language === '0'
                  ? 'ඔබගේ අවට පවතින ගැටළු පිළිබඳව වාර්තා කරන්න.'
                  : 'Report a new problem you’ve noticed around your area.'}
              </p>
            </div>
          </Link>

          {/* My Reports */}
          <Link to="/my-reports">
            <div className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition hover:-translate-y-1 duration-300">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">📝 {language === '0' ? 'මගේ පැමිණිලි' : 'My Reports'}</h2>
              <p className="text-gray-500">
                {language === '0'
                  ? 'ඔබ යවා ඇති පැමිණිලි පරික්ෂා කර සකස් කරන්න.'
                  : 'View and manage issues you’ve submitted.'}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
