// This file provides a polyfill for process.env in the browser
// Since Vite doesn't include Node.js globals by default

// Extend the Window interface to include process
declare global {
    interface Window {
      process: {
        env: Record<string, string | undefined>;
      };
    }
  }
  
  // Define empty process.env object if it doesn't exist
  window.process = window.process || {};
  window.process.env = window.process.env || {};
  
  export {};