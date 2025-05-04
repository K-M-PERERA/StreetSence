import React, { useEffect, useState } from 'react';
import AdminNav from '../components/adminNav';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyA9ivaZ1fgd737hpRLtqMCLxNVIxZi-a_o',
  });

  const isSinhala = localStorage.getItem('language') === '0';

  const txt = {
    welcome: isSinhala ? "ආයුබෝවන් පරිපාලකවරයාණෙනි" : "Welcome Admin",
    note: isSinhala ? "ඔබට සියලු වාර්තා සහ පද්ධති සැකසුම් වල ප්‍රවේශය ඇත." : "You have access to all reported issues and system settings.",
    loadingMap: isSinhala ? "සිතියම පූරණය වෙමින් පවතී..." : "Loading map...",
    viewMap: isSinhala ? "🗺️ වාර්තා කරන ලද ගැටළු සිතියම බලන්න" : "🗺️ View Reported Issues Map",
    manageReceived: isSinhala ? "📝 ලැබුණු සියලු වාර්තා කළමනාකරණය කරන්න" : "📝 Manage All Received Reports",
    manageReceivedDesc: isSinhala ? "යාවත්කාලීන කිරීම් සහ තත්ත්වය වෙනස් කරන්න." : "View, filter, and update status of all submitted reports.",
    manageAccepted: isSinhala ? "📝 පිළිගත් වාර්තා කළමනාකරණය කරන්න" : "📝 Manage Accepted Reports",
    manageAcceptedDesc: isSinhala ? "පිළිගත් වාර්තා සහ ඒවායේ ක්‍රියාකාරකම් බලන්න." : "View all accepted reports & their activity."
  };

  useEffect(() => {
    const fetchPendingCount = async () => {
      const q = query(collection(db, 'issues'), where('status', '==', 'Pending'));
      const snapshot = await getDocs(q);
      setPendingCount(snapshot.size);
    };

    fetchPendingCount();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 font-inter">
      <AdminNav />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 animate-fadeIn">{txt.welcome}</h1>
        <p className="text-gray-600 mb-8">{txt.note}</p>

        {/* 📍 Map Preview */}
        <div className="col-span-2 mb-6 cursor-pointer" onClick={() => navigate('/issues-map')}>
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
                {txt.loadingMap}
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-10 hover:bg-opacity-20 transition flex justify-center items-center text-white font-bold text-lg">
              {txt.viewMap}
            </div>
          </div>
        </div>

        {/* Admin Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition hover:-translate-y-1 duration-300 cursor-pointer relative"
            onClick={() => navigate('/admin-reports')}
          >
            {pendingCount > 0 && (
              <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {pendingCount}
              </span>
            )}
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{txt.manageReceived}</h2>
            <p className="text-gray-500">{txt.manageReceivedDesc}</p>
          </div>

          <div
            className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition hover:-translate-y-1 duration-300 cursor-pointer"
            onClick={() => navigate('/reportinfo')}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{txt.manageAccepted}</h2>
            <p className="text-gray-500">{txt.manageAcceptedDesc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
