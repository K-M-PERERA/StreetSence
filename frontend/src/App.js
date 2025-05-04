import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import SubmitIssue from './pages/SubmitIssue';
import ReportedIssuesMap from './pages/ReportedIssuesMap';
import MyReports from './pages/MyReports';
import AdminDashboard from './pages/AdminDashboard'; 
import ReceivedReports from './pages/ReceivedReports';
import ManageReportsTabs from './pages/ManageReportsTabs';
import Home from './pages/Home';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/submit" element={<SubmitIssue />} />
        <Route path="/issues-map" element={<ReportedIssuesMap />} />
        <Route path="/my-reports" element={<MyReports />} />


        <Route path="/admin-reports" element={<ReceivedReports />} />
        <Route path="/reportinfo" element={<ManageReportsTabs />} />
        <Route path="/admin" element={<AdminDashboard />} />
  
      </Routes>
    </Router>
  );
}

export default App;
