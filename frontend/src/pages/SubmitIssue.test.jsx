import React from 'react';
import { render, screen } from '@testing-library/react';
import SubmitIssue from './SubmitIssue';
import { BrowserRouter } from 'react-router-dom';

// ✅ Mock Firebase Auth, Firestore, Storage
jest.mock('../firebase', () => ({
  auth: { currentUser: { uid: 'user123', displayName: 'Test User', email: 'test@example.com' } },
  db: {},
  storage: {},
}));

// ✅ Mock Google Maps
jest.mock('@react-google-maps/api', () => ({
  GoogleMap: ({ children }) => <div data-testid="google-map">{children}</div>,
  Marker: () => <div data-testid="marker" />,
  useLoadScript: () => ({ isLoaded: true }),
}));

// ✅ Mock urgency score util
jest.mock('../utils/calculateUrgencyScore', () => ({
  calculateUrgencyScore: jest.fn(() => Promise.resolve(5)),
}));

// ✅ Mock Firestore methods
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(() => Promise.resolve()),
  Timestamp: { now: () => 'mockTimestamp' },
}));

// ✅ Mock Firebase storage
jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(() => Promise.resolve()),
  getDownloadURL: jest.fn(() => Promise.resolve('mockImageURL')),
}));

// ✅ Mock Navbar to avoid Firestore query issues in Navbar.js
jest.mock('../components/Navbar', () => () => <div data-testid="mock-navbar">MockNavbar</div>);

test('renders SubmitIssue form inputs', () => {
  render(
    <BrowserRouter>
      <SubmitIssue />
    </BrowserRouter>
  );

  // Check for main form elements
  expect(screen.getByPlaceholderText(/Title/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Describe the issue/i)).toBeInTheDocument();
  expect(screen.getByText(/Select category/i)).toBeInTheDocument();
  expect(screen.getByText(/Select Province/i)).toBeInTheDocument();
  expect(screen.getByTestId('google-map')).toBeInTheDocument();

  // Optional UI checks
  expect(screen.getByText(/Submit Issue/i)).toBeInTheDocument();
  expect(screen.getByTestId('mock-navbar')).toBeInTheDocument();
});
