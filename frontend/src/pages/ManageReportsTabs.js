import React, { useEffect, useState } from 'react';
import AdminNav from '../components/adminNav';
import {
  collection, getDocs, updateDoc, doc, query, where,addDoc
} from 'firebase/firestore';
import { db } from '../firebase';

const getUrgencyColor = (score) => {
  if (score >= 8) return 'border-red-600';
  if (score >= 5) return 'border-orange-400';
  return 'border-green-500';
};

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

const ManageReportsTabs = () => {
  const lang = localStorage.getItem('language') === '0'; // 0 = Sinhala
  const txt = {
    title: lang ? 'වාර්තා කළ තොරතුරු කළමනාකරණය කරන්න' : 'Manage Reports',
    inProgress: lang ? 'අලූත් වාර්තා' : 'In Progress',
    completed: lang ? 'අවසන් වාර්තා' : 'Completed',
    noInProgress: lang ? 'ඉදිරියට පවත්නා වාර්තා නැත.' : 'No reports in progress.',
    noCompleted: lang ? 'අවසන් වාර්තා නොමැත.' : 'No completed reports.',
    markDone: lang ? 'අවසන් ලෙස සලකන්න' : 'Mark as Done',
    sortPriority: lang ? '🔥 ප්‍රමුඛතාව අනුව සිරස්තල' : '🔥 Sort by Priority',
    sortTime: lang ? '⏱️ කාලය අනුව සිරස්තල' : '⏱️ Sort by Time',
    category: lang ? 'ප්‍රවර්ගය' : 'Category',
    location: lang ? 'ස්ථානය' : 'Location',
    urgency: lang ? 'ඉවසිලිමත් ලකුණු' : 'Urgency Score',
    reporter: lang ? 'වාර්තාකරු' : 'Reporter',
    submitted: lang ? 'ඇතුළත් කල දිනය' : 'Submitted'
  };

  const [tab, setTab] = useState('inProgress');
  const [inProgress, setInProgress] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [sortBy, setSortBy] = useState('priority');

  useEffect(() => {
    const enhanceWithDistrict = async (list) => {
      return await Promise.all(list.map(async (r) => {
        if (r.location?.lat && r.location?.lng) {
          const district = await getDistrictFromLatLng(r.location.lat, r.location.lng);
          return { ...r, district };
        }
        return { ...r, district: 'Unknown' };
      }));
    };
      const addNotification = async (userId, message) => {
        await addDoc(collection(db, 'notifications'), {
          userId,
          message,
          status: 'unseen',
          createdAt: new Date(),
        });
      };

    const fetchReports = async () => {
      const inProgQ = query(collection(db, 'issues'), where('status', '==', 'In Progress'));
      const compQ = query(collection(db, 'issues'), where('status', '==', 'Completed'));

      const [inProgSnap, compSnap] = await Promise.all([
        getDocs(inProgQ),
        getDocs(compQ)
      ]);

      const inProgressData = inProgSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const completedData = compSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      setInProgress(await enhanceWithDistrict(inProgressData));
      setCompleted(await enhanceWithDistrict(completedData));
    };

    fetchReports();
  }, []);

  const handleMarkDone = async (reportId) => {
    const report = inProgress.find(r => r.id === reportId);
    if (!report) return;
  
    await updateDoc(doc(db, 'issues', reportId), { status: 'Completed' });
  
    // Send notification to the reporter
    if (report.submittedBy) {
      const message = lang
        ? `ඔබේ "${report.title}" වාර්තාව අවසන් වී ඇත.`
        : `Your report "${report.title}" has been marked as completed.`;
  
      await addDoc(collection(db, 'notifications'), {
        userId: report.submittedBy,
        message,
        status: 'unseen',
        createdAt: new Date(),
      });
    }
  
    setInProgress(prev => prev.filter(r => r.id !== reportId));
  };
  const sortReports = (list) => {
    return [...list].sort((a, b) => {
      if (sortBy === 'time') {
        return b.createdAt?.seconds - a.createdAt?.seconds;
      } else {
        if (b.urgencyScore === a.urgencyScore) {
          return b.createdAt?.seconds - a.createdAt?.seconds;
        }
        return b.urgencyScore - a.urgencyScore;
      }
    });
  };

  const renderCard = (report, showDoneButton = false) => (
    <div
      key={report.id}
      className={`bg-white rounded-xl p-6 shadow space-y-3 border-l-4 ${getUrgencyColor(report.urgencyScore)}`}
    >
      <h2 className="text-xl font-semibold text-gray-800">{report.title}</h2>
      <p className="text-gray-700">{report.description}</p>
      <div className="text-sm text-gray-500 space-y-1">
        <p>📌 {txt.category}: {report.category}</p>
        <p>📍 {txt.location}: {report.district || 'Loading...'}</p>
        <p>🔥 {txt.urgency}: <span className="font-bold">{report.urgencyScore}</span></p>
        <p>📧 {txt.reporter}: {report.reporterEmail || 'N/A'}</p>
        <p>📅 {txt.submitted}: {new Date(report.createdAt?.seconds * 1000).toLocaleString()}</p>
      </div>
      {showDoneButton && (
        <div className="flex justify-end">
          <button
            onClick={() => handleMarkDone(report.id)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {txt.markDone}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">📂 {txt.title}</h1>

        {/* Tabs + Sort */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div className="flex gap-4">
            <button
              className={`px-4 py-2 rounded ${tab === 'inProgress' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border'}`}
              onClick={() => setTab('inProgress')}
            >
              {txt.inProgress}
            </button>
            <button
              className={`px-4 py-2 rounded ${tab === 'completed' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border'}`}
              onClick={() => setTab('completed')}
            >
              {txt.completed}
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border rounded text-sm"
          >
            <option value="priority">{txt.sortPriority}</option>
            <option value="time">{txt.sortTime}</option>
          </select>
        </div>

        <div className="space-y-6">
          {tab === 'inProgress' &&
            (inProgress.length === 0 ? (
              <p className="text-gray-500">{txt.noInProgress}</p>
            ) : (
              sortReports(inProgress).map(r => renderCard(r, true))
            ))}

          {tab === 'completed' &&
            (completed.length === 0 ? (
              <p className="text-gray-500">{txt.noCompleted}</p>
            ) : (
              sortReports(completed).map(r => renderCard(r, false))
            ))}
        </div>
      </div>
    </div>
  );
};

export default ManageReportsTabs;
