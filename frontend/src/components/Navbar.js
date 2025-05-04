import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaBell } from 'react-icons/fa';
import { auth, db } from '../firebase';
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc
} from 'firebase/firestore';

const Navbar = () => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUnseenNotifications = async () => {
      if (!user) return;
      const q = query(collection(db, 'notifications'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const unseen = all.filter(n => n.status === 'unseen');
      setNotifications(all);
      setNotificationCount(unseen.length);
    };

    fetchUnseenNotifications();
  }, [user]);
  
  const handleClearNotifications = async () => {
    const unseen = notifications.filter(n => n.status === 'unseen');
    for (let n of unseen) {
      const ref = doc(db, 'notifications', n.id);
      await updateDoc(ref, { status: 'seen' });
    }
    setNotifications(prev =>
      prev.map(n => ({ ...n, status: 'seen' }))
    );
    setNotificationCount(0);
  };

  return (
    <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center relative">
      {/* Left: Logo */}
     
      
      {/* Center: Logo */}
  <div className="w-1/3 text-center">
    <Link to="/" className="text-2xl font-bold text-blue-700 ">
      StreetSense
    </Link>
  </div>
      {/* Right: Notifications + Profile */}
      <div className="flex items-center space-x-4 relative">
        {/* Notifications */}
        <button
          onClick={() => setShowDropdown(prev => !prev)}
          className="relative text-2xl text-blue-600 hover:text-blue-800"
        >
          <FaBell />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute right-12 top-12 bg-white border shadow-lg rounded-md w-72 z-50">
            <div className="p-3 border-b font-semibold flex justify-between items-center">
              Notifications
              <button
                onClick={handleClearNotifications}
                className="text-xs text-blue-500 hover:underline"
              >
                Mark all as read
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-gray-500">No notifications</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-2 text-sm ${
                      n.status === 'unseen' ? 'bg-gray-100' : ''
                    }`}
                  >
                    {n.message}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Profile */}
        <Link to="/profile">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <FaUserCircle className="text-3xl text-blue-600 hover:text-blue-800" />
          )}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
