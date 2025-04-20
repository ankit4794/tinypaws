export default function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm">
            &copy; {currentYear} TinyPaws Admin Panel. All rights reserved.
          </div>
          <div className="text-sm mt-2 md:mt-0">
            Version 1.0.0
          </div>
        </div>
      </div>
    </footer>
  );
}