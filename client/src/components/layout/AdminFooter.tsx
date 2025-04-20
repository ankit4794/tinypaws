export default function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 py-3 text-center text-xs border-t border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center space-x-3">
          <span>&copy; {currentYear} TinyPaws Admin</span>
          <span>•</span>
          <span>Version 1.0.0</span>
        </div>
      </div>
    </footer>
  );
}