import { useEffect } from 'react';
import { Router, Route, Switch } from 'wouter';
import './index.css';

// This is a wrapper component that redirects to the Next.js server
function NextJsRedirect() {
  useEffect(() => {
    console.log("TinyPaws is now using Next.js - please visit the Next.js server at port 3000");
    // For development in Replit, we can't directly redirect
    // In a production environment, this would be a window.location.href redirect
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-4">TinyPaws Pet Store</h1>
        <p className="text-center mb-6">
          This application is now using Next.js for the frontend.
        </p>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
          <p className="text-yellow-700">
            <strong>Important:</strong> Please access the Next.js server at:
          </p>
          <p className="text-blue-600 block mt-2 text-center">
            Visit the Next.js server on port 3000
          </p>
        </div>
        <p className="text-sm text-gray-600 text-center">
          If using Replit, please use the webview controls to navigate to port 3000 where the Next.js application is running.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="*" component={NextJsRedirect} />
      </Switch>
    </Router>
  );
}