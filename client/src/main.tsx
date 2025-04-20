// This is a minimal file to satisfy the Vite server
// In our new architecture, we're using Next.js instead of Vite for the frontend
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);