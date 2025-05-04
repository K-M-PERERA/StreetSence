import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Register from './Register';
import { BrowserRouter } from 'react-router-dom';

// Mocks
jest.mock('../firebase', () => ({
  auth: {},
  db: {},
}));

test('renders register form with inputs', () => {
  render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  );

  // Check input fields are rendered
  expect(screen.getByPlaceholderText(/Full Name/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Address/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Mobile Number/i)).toBeInTheDocument();

  // Check register button
  expect(screen.getByText(/Register/i)).toBeInTheDocument();
});

test('fills register form and submits', () => {
  render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  );

  fireEvent.change(screen.getByPlaceholderText(/Full Name/i), {
    target: { value: 'Lahiru Dev' },
  });
  fireEvent.change(screen.getByPlaceholderText(/Email/i), {
    target: { value: 'test@email.com' },
  });
  fireEvent.change(screen.getByPlaceholderText(/Password/i), {
    target: { value: '123456' },
  });
  fireEvent.change(screen.getByPlaceholderText(/Address/i), {
    target: { value: 'Colombo' },
  });
  fireEvent.change(screen.getByPlaceholderText(/Mobile Number/i), {
    target: { value: '0771234567' },
  });

  fireEvent.click(screen.getByText(/Register/i));
});
