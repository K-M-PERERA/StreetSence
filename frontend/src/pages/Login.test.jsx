// Login.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from './Login';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../firebase', () => ({
  auth: {},
}));

test('renders login component and shows inputs', () => {
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );

  // Check welcome message
  expect(screen.getByText(/Welcome to StreetSense/i)).toBeInTheDocument();

  // Check email and password inputs
  expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();

  // Check login button
  expect(screen.getByText(/Login/i)).toBeInTheDocument();
});

test('fills form and clicks login', () => {
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );

  fireEvent.change(screen.getByPlaceholderText(/Email/i), {
    target: { value: 'test@email.com' },
  });
  fireEvent.change(screen.getByPlaceholderText(/Password/i), {
    target: { value: '123456' },
  });

  fireEvent.click(screen.getByText(/Login/i));

  // You can expect some side effect here if mocking signInWithEmailAndPassword
});
