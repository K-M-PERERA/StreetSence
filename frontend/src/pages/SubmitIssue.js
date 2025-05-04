import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { storage, db, auth } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { provinces, districtCoordinates } from '../utils/locationData';
import { provinces2, districtCoordinates2 } from '../utils/locationDataSi';
import { calculateUrgencyScore } from '../utils/calculateUrgencyScore';
import { Link, useNavigate } from 'react-router-dom';


const SubmitIssue = () => {
  const isSinhala = localStorage.getItem('language') === '0';
  const selectedProvinces = isSinhala ? provinces2 : provinces;
  const selectedCoordinates = isSinhala ? districtCoordinates2 : districtCoordinates;
  const navigate = useNavigate();

  const txt = {
    title: isSinhala ? '📍 ගැටළුවක් වාර්තා කරන්න' : '📍 Submit an Issue',
    inputTitle: isSinhala ? 'සිරස්තලය' : 'Title',
    description: isSinhala ? 'ගැටළුව විස්තර කරන්න' : 'Describe the issue',
    category: isSinhala ? 'ප්‍රවර්ගය තෝරන්න' : 'Select category',
    province: isSinhala ? 'පළාත තෝරන්න' : 'Select Province',
    district: isSinhala ? 'දිස්ත්‍රික්කය තෝරන්න' : 'Select District',
    upload: isSinhala ? 'පින්තූරය උඩුගත කරන්න' : 'Upload Image',
    mapLoading: isSinhala ? 'සිතියම පූරණය වෙමින් පවතී...' : 'Loading Map...',
    submit: isSinhala ? 'ගැටළුව යොමු කරන්න' : 'Submit Issue',
    submitting: isSinhala ? 'යොමු වෙමින් පවතී...' : 'Submitting...',
    alertLocation: isSinhala ? 'කරුණාකර දිස්ත්‍රික්කයක් තෝරන්න සහ සිතියමේ ස්ථානයක් ලකුණු කරන්න.' : 'Please select a district and mark a location on map.',
    alertSuccess: isSinhala ? 'ගැටළුව සාර්ථකව යොමු විය!' : 'Issue submitted!',
    alertError: isSinhala ? 'ගැටළුව යොමු කිරීමේදී දෝෂයකි' : 'Error submitting issue'
  };

  const categoryMap = {
    'Broken traffic light': 'කැඩුණු රථ වාහන ආලෝකය',
    'Road Damage': 'මාර්ග හානි',
    'Accident': 'මාර්ග අනතුරු ',
    'Road Closed': 'වහන ලද මාර්ගය',
    'Sanitation': 'පිරිසිදුකිරීම'
  };

  const categoryOptions = Object.keys(categoryMap);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    image: null,
    location: null,
  });

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 6.9271, lng: 79.8612 });
  const [submitting, setSubmitting] = useState(false);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyA9ivaZ1fgd737hpRLtqMCLxNVIxZi-a_o',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleMapClick = (e) => {
    setFormData((prev) => ({
      ...prev,
      location: { lat: e.latLng.lat(), lng: e.latLng.lng() },
    }));
  };

  const handleSubmit = async () => {
    if (!selectedDistrict || !formData.location) {
      return alert(txt.alertLocation);
    }

    setSubmitting(true);
    try {
      const user = auth.currentUser;
      let imageUrl = '';

      if (formData.image) {
        const imageRef = ref(storage, `issues/${Date.now()}_${formData.image.name}`);
        await uploadBytes(imageRef, formData.image);
        imageUrl = await getDownloadURL(imageRef);
      }

      const urgencyScore = await calculateUrgencyScore({
        category: formData.category,
        location: formData.location,
        district: selectedDistrict,
      });

      const issueData = {
        title: formData.title,
        description: formData.description,
        category: formData.category, // always in English
        imageUrl,
        location: formData.location,
        province: selectedProvince,
        district: selectedDistrict,
        submittedBy: user?.uid || 'anonymous',
        reporterName: user?.displayName || 'Anonymous',
        reporterEmail: user?.email || 'Unavailable',
        status: 'Pending',
        urgencyScore,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'issues'), issueData);
      alert(txt.alertSuccess);
      setFormData({ title: '', description: '', category: '', image: null, location: null });
      setSelectedProvince('');
      setSelectedDistrict('');
      navigate('/dashboard')
    } catch (error) {
      console.error(error);
      alert(txt.alertError);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">{txt.title}</h1>

        <input
          name="title"
          type="text"
          placeholder={txt.inputTitle}
          value={formData.title}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        />

        <textarea
          name="description"
          placeholder={txt.description}
          value={formData.description}
          onChange={handleChange}
          rows="4"
          className="w-full p-3 border rounded"
        />

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        >
          <option value="">{txt.category}</option>
          {categoryOptions.map((eng) => (
            <option key={eng} value={eng}>
              {isSinhala ? categoryMap[eng] : eng}
            </option>
          ))}
        </select>

        <select
          value={selectedProvince}
          onChange={(e) => {
            setSelectedProvince(e.target.value);
            setSelectedDistrict('');
          }}
          className="w-full p-3 border rounded"
        >
          <option value="">{txt.province}</option>
          {Object.keys(selectedProvinces).map((prov) => (
            <option key={prov} value={prov}>{prov}</option>
          ))}
        </select>

        {selectedProvince && (
          <select
            value={selectedDistrict}
            onChange={(e) => {
              const district = e.target.value;
              setSelectedDistrict(district);
              if (selectedCoordinates[district]) {
                setMapCenter(selectedCoordinates[district]);
              }
            }}
            className="w-full p-3 border rounded"
          >
            <option value="">{txt.district}</option>
            {selectedProvinces[selectedProvince].map((dist) => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
          </select>
        )}

        <input
          type="file"
          onChange={handleImageUpload}
          className="w-full p-2"
        />

        <div className="w-full h-64 border rounded">
          {isLoaded ? (
            <GoogleMap
              center={mapCenter}
              zoom={12}
              mapContainerStyle={{ width: '100%', height: '100%' }}
              onClick={handleMapClick}
            >
              {formData.location && <Marker position={formData.location} />}
            </GoogleMap>
          ) : (
            <div className="text-center pt-24">{txt.mapLoading}</div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
        >
          {submitting ? txt.submitting : txt.submit}
        </button>
      </div>
    </div>
  );
};

export default SubmitIssue;
