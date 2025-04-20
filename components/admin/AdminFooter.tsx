import React from 'react';

const AdminFooter = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 p-4 text-center text-sm text-gray-500">
      <p>© {currentYear} TinyPaws Admin. All rights reserved.</p>
    </footer>
  );
};

export default AdminFooter;