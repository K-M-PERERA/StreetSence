import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const isSinhala = localStorage.getItem('language') === '0';

  const txt = {
    welcome: isSinhala ? "StreetSense වෙත සාදරයෙන් පිළිගනිමු 💡" : "Welcome to StreetSense 💡",
    email: isSinhala ? "ඊමේල්" : "Email",
    password: isSinhala ? "මුරපදය" : "Password",
    login: isSinhala ? "ඇතුල් වන්න" : "Login",
    or: isSinhala ? "හෝ" : "or",
    google: isSinhala ? "Google මඟින් පිවිසෙන්න" : "Sign in with Google",
    register: isSinhala ? "ගිණුමක් නොමැතිද? ලියාපදිංචි වන්න" : "Don’t have an account? Register"
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const redirectUser = (email, password) => {
    if (email === 'admin' && password === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    if (formData.email === 'admin@gmail.com' && formData.password === 'admin') {
      navigate('/admin');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCred = await signInWithPopup(auth, provider);
      redirectUser(userCred.user.email, '');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex items-center justify-center animate-fadeIn'>
      <div className='bg-white p-10 rounded-2xl shadow-xl w-full max-w-md'>
        <h2 className='text-3xl font-bold text-center mb-6 font-dancing text-blue-700'>
          {txt.welcome}
        </h2>

        <form onSubmit={handleEmailLogin} className='space-y-4'>
          <input
            type='email'
            name='email'
            placeholder={txt.email}
            value={formData.email}
            onChange={handleChange}
            required
            className='w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
          />
          <input
            type='password'
            name='password'
            placeholder={txt.password}
            value={formData.password}
            onChange={handleChange}
            required
            className='w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
          />
          <button
            type='submit'
            className='w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-all'
          >
            {txt.login}
          </button>
        </form>

        <div className='my-4 text-center text-gray-500'>{txt.or}</div>

        <button
          onClick={handleGoogleLogin}
          className='w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition-all'
        >
          {txt.google}
        </button>

        <div className='mt-4 text-center text-sm text-gray-600'>
          {txt.register} <Link to="/register" className='text-blue-600 hover:underline'>{isSinhala ? "ලියාපදිංචි වන්න" : "Register"}</Link>
        </div>

        {error && (
          <p className='text-red-500 mt-4 text-sm text-center animate-fadeIn'>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
