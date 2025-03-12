/**
 * Fund Dashboard Application Entry Point
 * 
 * This is the main entry file for the React Fund Dashboard application.
 * It renders the root App component into the DOM and sets up React StrictMode
 * for development best practices.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

/**
 * Create a React root and render the application
 * 
 * Uses the modern React 18+ createRoot API instead of the legacy ReactDOM.render
 * Wrapped in StrictMode to highlight potential problems during development
 */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

