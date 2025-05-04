import React, { useEffect, useState } from 'react';
import AdminNav from '../components/adminNav';
import {
  collection, getDocs, doc, updateDoc, query, where, addDoc
} from 'firebase/firestore';
import { db } from '../firebase';

const getDistrictFromLatLng = async (lat, lng) => {
  const apiKey = 'AIzaSyA9ivaZ1fgd737hpRLtqMCLxNVIxZi-a_o';
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const components = data.results[0]?.address_components;

    if (components) {
      const district = components.find(c =>
        c.types.includes('administrative_area_level_2') ||
        c.types.includes('locality') ||
        c.types.includes('administrative_area_level_1')
      );
      return district?.long_name || 'Unknown';
    }
    return 'Unknown';
  } catch (err) {
    console.error('Reverse Geocode Error:', err);
    return 'Unknown';
  }
};

const ReceivedReports = () => {
  const [reports, setReports] = useState([]);
  const isSinhala = localStorage.getItem('language') === '0';

  const txt = {
    title: isSinhala ? '📥 ලැබුණු වාර්තා' : '📥 Received Reports',
    noReports: isSinhala ? 'පැමිණිලි නොමැත.' : 'No pending reports.',
    category: isSinhala ? 'ප්‍රවර්ගය' : 'Category',
    location: isSinhala ? 'ස්ථානය' : 'Location',
    urgency: isSinhala ? 'ඉවසිලිමත් ලකුණු' : 'Urgency Score',
    reporter: isSinhala ? 'වාර්තාකරු' : 'Reporter',
    submitted: isSinhala ? 'ඇතුළත් කළ දිනය' : 'Submitted',
    accept: isSinhala ? 'පිළිගන්න' : 'Accept',
    reject: isSinhala ? 'ප්‍රතික්ෂේප කරන්න' : 'Reject',
    notifyAccept: (title) => isSinhala
      ? `ඔබේ "${title}" වාර්තාව පිළිගත් අතර ක්‍රියාත්මක වෙමින් පවතී.`
      : `Your report "${title}" has been accepted and is being taken care of.`,
    notifyReject: (title) => isSinhala
      ? `ඔබේ "${title}" වාර්තාව ප්‍රතික්ෂේප කර ඇත. වාර්තා කිරීම සඳහා ස්තුතියි.`
      : `Your report "${title}" has been rejected. Thank you for reporting.`
  };

  useEffect(() => {
    const fetchReports = async () => {
      const q = query(collection(db, 'issues'), where('status', '==', 'Pending'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const enriched = await Promise.all(
        data.map(async (report) => {
          if (report.location?.lat && report.location?.lng) {
            const district = await getDistrictFromLatLng(report.location.lat, report.location.lng);
            return { ...report, district };
          }
          return { ...report, district: 'Unknown' };
        })
      );

      const sorted = enriched.sort((a, b) => b.urgencyScore - a.urgencyScore);
      setReports(sorted);
    };

    fetchReports();
  }, []);

  const addNotification = async (userId, message) => {
    await addDoc(collection(db, 'notifications'), {
      userId,
      message,
      status: 'unseen',
      createdAt: new Date(),
    });
  };

  const handleAccept = async (report) => {
    await updateDoc(doc(db, 'issues', report.id), { status: 'In Progress' });

    if (report.submittedBy) {
      await addNotification(report.submittedBy, txt.notifyAccept(report.title));
    }

    setReports(prev => prev.filter(r => r.id !== report.id));
  };

  const handleReject = async (report) => {
    await updateDoc(doc(db, 'issues', report.id), { status: 'Rejected' });

    if (report.submittedBy) {
      await addNotification(report.submittedBy, txt.notifyReject(report.title));
    }

    setReports(prev => prev.filter(r => r.id !== report.id));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{txt.title}</h1>

        {reports.length === 0 ? (
          <p className="text-gray-500">{txt.noReports}</p>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-xl p-6 shadow space-y-3 border-l-4 border-blue-600"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {report.imageUrl && (
                    <img
                      src={report.imageUrl}
                      alt="Report"
                      className="w-full md:w-48 h-32 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <h2 className="text-xl font-semibold text-blue-800">{report.title}</h2>
                    <p className="text-gray-700">{report.description}</p>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>📌 {txt.category}: {report.category}</p>
                      <p>📍 {txt.location}: {report.district}</p>
                      <p>🔥 {txt.urgency}: <span className="font-bold text-red-600">{report.urgencyScore}</span></p>
                      <p>📧 {txt.reporter}: {report.reporterEmail || 'Not available'}</p>
                      <p>📅 {txt.submitted}: {new Date(report.createdAt?.seconds * 1000).toLocaleString()}</p>
                    </div>

                    <div className="flex justify-end gap-4 pt-3">
                      <button
                        onClick={() => handleAccept(report)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        {txt.accept}
                      </button>
                      <button
                        onClick={() => handleReject(report)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        {txt.reject}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceivedReports;
