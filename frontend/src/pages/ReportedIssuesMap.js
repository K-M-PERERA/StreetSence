import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { GoogleMap, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api';
import brokeimage from '../images/broke.jpg';
import closed from '../images/closed.jpg';
import accident from '../images/accident.png';
import trafficlight from '../images/trafficlight.jpg';
import garbage from '../images/garbage.avif';

const mapContainerStyle = {
  width: '100%',
  height: '80vh',
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    {
      featureType: 'poi',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'road',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'transit',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

const categoryIcons = {
  'Broken traffic light': trafficlight,
  'Accident': accident,
  'Road Damage': brokeimage,
  'Road Closed': closed,
  'Sanitation': garbage,
};

const getBorderColor = (status) => {
  if (status === 'Pending') return '2px solid red';
  if (status === 'In Progress') return '2px solid orange';
  return 'none';
};

const ReportedIssuesMap = () => {
  const isSinhala = localStorage.getItem('language') === '0';

  const txt = {
    title: isSinhala ? '🗺️ වාර්තා කළ ගැටළු සිතියම' : '🗺️ Reported Issues Map',
    loading: isSinhala ? 'සිතියම පූරණය වෙමින් පවතී...' : 'Loading Map...',
    category: isSinhala ? 'ප්‍රවර්ගය' : 'Category',
    status: isSinhala ? 'තත්ත්වය' : 'Status'
  };

  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const mapRef = useRef(null);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyA9ivaZ1fgd737hpRLtqMCLxNVIxZi-a_o',
  });

  useEffect(() => {
    const fetchIssues = async () => {
      const snapshot = await getDocs(collection(db, 'issues'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIssues(data);
    };
    fetchIssues();
  }, []);

  useEffect(() => {
    if (!mapRef.current || issues.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();
    issues.forEach((issue) => {
      if (issue.location) {
        bounds.extend(issue.location);
      }
    });

    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds);
    }
  }, [issues]);

  if (!isLoaded) return <div className="text-center mt-10">{txt.loading}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{txt.title}</h1>

        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={{ lat: 6.9271, lng: 79.8612 }}
          zoom={10}
          options={mapOptions}
          onLoad={(map) => (mapRef.current = map)}
        >
          {issues.map((issue) => (
            issue.location && (
              <div key={issue.id}>
                <Marker
                  position={issue.location}
                  onClick={() => setSelectedIssue(issue)}
                  icon={{
                    url: categoryIcons[issue.category] || undefined,
                    scaledSize: new window.google.maps.Size(40, 40),
                    anchor: new window.google.maps.Point(20, 20),
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    width: '42px',
                    height: '42px',
                    transform: 'translate(-50%, -50%)',
                    border: getBorderColor(issue.status),
                    borderRadius: '50%',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            )
          ))}

          {selectedIssue && (
            <InfoWindow
              position={selectedIssue.location}
              onCloseClick={() => setSelectedIssue(null)}
            >
              <div className="text-sm">
                <h2 className="font-bold text-blue-600">{selectedIssue.title}</h2>
                <p className="text-gray-700">{selectedIssue.description}</p>
                <p className="text-gray-500 text-xs">📌 {txt.category}: {selectedIssue.category}</p>
                <p className="text-gray-500 text-xs">🧩 {txt.status}: {selectedIssue.status}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
};

export default ReportedIssuesMap;
