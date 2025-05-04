import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    mobile: '',
  });
  const [error, setError] = useState('');

  const isSinhala = localStorage.getItem('language') === '0';
  const txt = {
    title: isSinhala ? "StreetSense ගිණුමක් සාදන්න 🚀" : "Create your StreetSense account 🚀",
    name: isSinhala ? "සම්පුර්ණ නම" : "Full Name",
    email: isSinhala ? "ඊමේල්" : "Email",
    password: isSinhala ? "මුරපදය" : "Password",
    address: isSinhala ? "ලිපිනය" : "Address",
    mobile: isSinhala ? "දුරකථන අංකය" : "Mobile Number",
    register: isSinhala ? "ලියාපදිංචි වන්න" : "Register",
    already: isSinhala ? "දැනටමත් ගිණුමක් තිබේද?" : "Already have an account?",
    login: isSinhala ? "ඇතුල් වන්න" : "Login"
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await setDoc(doc(db, 'users', userCred.user.uid), {
        name: formData.name,
        address: formData.address,
        mobile: formData.mobile,
        email: formData.email,
      });

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex items-center justify-center animate-fadeIn">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 font-dancing text-blue-700">
          {txt.title}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder={txt.name}
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md"
          />

          <input
            type="email"
            name="email"
            placeholder={txt.email}
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md"
          />

          <input
            type="password"
            name="password"
            placeholder={txt.password}
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md"
          />

          <input
            type="text"
            name="address"
            placeholder={txt.address}
            value={formData.address}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md"
          />

          <input
            type="text"
            name="mobile"
            placeholder={txt.mobile}
            value={formData.mobile}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
          >
            {txt.register}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          {txt.already}{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            {txt.login}
          </Link>
        </div>

        {error && (
          <p className="text-red-500 mt-4 text-sm text-center animate-fadeIn">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
