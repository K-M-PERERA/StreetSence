import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    address: '',
    mobile: '',
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const isSinhala = localStorage.getItem('language') === '0';
  const txt = {
    title: isSinhala ? '👤 මගේ පැතිකඩ' : '👤 My Profile',
    addField: (field) => isSinhala
      ? `අලුත් ${field === 'name' ? 'නම' : field === 'address' ? 'ලිපිනය' : 'දුරකථන අංකය'} එක් කරන්න`
      : `Add ${field}`,
    cancel: isSinhala ? 'අවලංගු කරන්න' : 'Cancel',
    edit: isSinhala ? 'සංස්කරණය කරන්න' : 'Edit',
    save: isSinhala ? 'සුරකින්න' : 'Save',
    logout: isSinhala ? 'ඉවත් වන්න' : 'Logout',
    loading: isSinhala ? 'පැතිකඩ පූරණය වෙමින් පවතී...' : 'Loading...'
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        setUserId(user.uid);
        const docRef = doc(db, 'users', user.uid);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          setProfile(snap.data());
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleEdit = () => setEditing(!editing);

  const handleSave = async () => {
    if (userId) {
      await setDoc(doc(db, 'users', userId), profile, { merge: true });
      console.log('Profile updated:', profile);
    }
    setEditing(false);
  };
  
  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return <div className="text-center mt-10">{txt.loading}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{txt.title}</h1>

        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
          {['name', 'address', 'mobile'].map((field) => (
            <div key={field}>
              <label className="block text-gray-600 font-medium mb-1 capitalize">
                {isSinhala
                  ? field === 'name'
                    ? 'නම'
                    : field === 'address'
                      ? 'ලිපිනය'
                      : 'දුරකථන අංකය'
                  : field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type="text"
                name={field}
                placeholder={txt.addField(field)}
                value={profile[field] || ''}
                onChange={handleChange}
                readOnly={!editing}
                className={`w-full p-3 rounded border ${
                  editing ? 'border-blue-400' : 'border-gray-300'
                } focus:outline-none`}
              />
            </div>
          ))}
          
          <div className="flex justify-end gap-4">
            <button
              onClick={toggleEdit}
              className="px-5 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              {editing ? txt.cancel : txt.edit}
            </button>

            {editing && (
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {txt.save}
              </button>
            )}

            <button
              onClick={handleLogout}
              className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              {txt.logout}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
