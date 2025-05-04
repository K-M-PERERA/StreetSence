import React, { useEffect, useState } from 'react';
import {
  collection, deleteDoc, doc, getDocs, query, updateDoc, where
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import Navbar from '../components/Navbar';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [editingReport, setEditingReport] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', location: null
  });

  const user = auth.currentUser;
  const isSinhala = localStorage.getItem('language') === '0';

  const txt = {
    title: isSinhala ? '📋 මගේ වාර්තා' : '📋 My Reports',
    noReports: isSinhala ? 'ඔබ තවමත් කිසිදු ගැටලුවක් වාර්තා කර නැත.' : 'You haven’t submitted any issues yet.',
    category: isSinhala ? 'ප්‍රවර්ගය' : 'Category',
    status: isSinhala ? 'තත්ත්වය' : 'Status',
    edit: isSinhala ? 'සංස්කරණය කරන්න' : 'Edit',
    delete: isSinhala ? 'මකන්න' : 'Delete',
    editTitle: isSinhala ? '🛠️ වාර්තාව සංස්කරණය කරන්න' : '🛠️ Edit Report',
    inputTitle: isSinhala ? 'සිරස්තලය' : 'Title',
    inputDesc: isSinhala ? 'විස්තරය' : 'Description',
    inputCat: isSinhala ? 'ප්‍රවර්ගය තෝරන්න' : 'Select category',
    cat1: isSinhala ? 'Streetlight' : 'Streetlight',
    cat2: isSinhala ? 'Garbage' : 'Garbage',
    cat3: isSinhala ? 'Road Damage' : 'Road Damage',
    cat4: isSinhala ? 'Sanitation' : 'Sanitation',
    cat5: isSinhala ? 'Vandalism' : 'Vandalism',
    cancel: isSinhala ? 'අවලංගු කරන්න' : 'Cancel',
    save: isSinhala ? 'වෙනස්කම් සුරකින්න' : 'Save Changes',
    confirmDelete: isSinhala ? 'මෙම වාර්තාව මැකීමට අවශ්‍යද?' : 'Delete this report?'
  };

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyA9ivaZ1fgd737hpRLtqMCLxNVIxZi-a_o',
  });

  useEffect(() => {
    if (!user) return;
    const fetchReports = async () => {
      const q = query(collection(db, 'issues'), where('submittedBy', '==', user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(data);
    };
    fetchReports();
  }, [user]);

  const handleDelete = async (id) => {
    if (window.confirm(txt.confirmDelete)) {
      await deleteDoc(doc(db, 'issues', id));
      setReports(prev => prev.filter((r) => r.id !== id));
    }
  };

  const openEdit = (report) => {
    setEditingReport(report);
    setFormData({
      title: report.title,
      description: report.description,
      category: report.category,
      location: report.location || null
    });
  };

  const handleUpdate = async () => {
    if (!editingReport) return;
    await updateDoc(doc(db, 'issues', editingReport.id), {
      ...formData,
      updatedAt: new Date()
    });
    setEditingReport(null);
    const refreshed = await getDocs(query(collection(db, 'issues'), where('submittedBy', '==', user.uid)));
    setReports(refreshed.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{txt.title}</h1>

        {reports.length === 0 ? (
          <p className="text-gray-600">{txt.noReports}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.map((report) => (
              <div key={report.id} className="bg-white p-6 rounded-xl shadow space-y-3">
                <h2 className="text-xl font-semibold text-blue-700">{report.title}</h2>
                <p className="text-gray-700">{report.description}</p>
                <p className="text-sm text-gray-500">{txt.category}: {report.category}</p>
                <p className="text-sm text-gray-500">{txt.status}: {report.status}</p>
                <div className="flex justify-end gap-4 pt-2">
                  {(report.status === 'Pending') && (
                    <button
                      onClick={() => openEdit(report)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                    >
                      {txt.edit}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    {txt.delete}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingReport && isLoaded && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl space-y-4 relative">
            <h2 className="text-2xl font-bold text-gray-800">{txt.editTitle}</h2>

            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-3 border rounded"
              placeholder={txt.inputTitle}
            />

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 border rounded"
              placeholder={txt.inputDesc}
              rows="4"
            />

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 border rounded"
            >
              <option value="">{txt.inputCat}</option>
              <option value="Streetlight">{txt.cat1}</option>
              <option value="Garbage">{txt.cat2}</option>
              <option value="Road Damage">{txt.cat3}</option>
              <option value="Sanitation">{txt.cat4}</option>
              <option value="Vandalism">{txt.cat5}</option>
            </select>

            <div className="h-64 w-full border rounded">
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={formData.location || { lat: 6.9271, lng: 79.8612 }}
                zoom={13}
                onClick={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    location: { lat: e.latLng.lat(), lng: e.latLng.lng() },
                  }))
                }
                options={{
                  disableDefaultUI: true,
                  zoomControl: true,
                }}
              >
                {formData.location && <Marker position={formData.location} />}
              </GoogleMap>
            </div>

            <div className="flex justify-end gap-4 pt-2">
              <button
                onClick={() => setEditingReport(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                {txt.cancel}
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {txt.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReports;
