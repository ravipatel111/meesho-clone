import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './header';
import Sidebar from './sidebar';

const Icons = {
  CheckCircle: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  AlertCircle: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem('admin-dark-mode') === 'true'
  );

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const toggleDark = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('admin-dark-mode', String(next));
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header
        onToggleSidebar={() => setSidebarOpen((p) => !p)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDark}
      />
      <Sidebar isOpen={sidebarOpen} />
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
        />
      )}
      <main
        className={`transition-all duration-300 pt-[70px] h-screen overflow-hidden flex flex-col ${
          sidebarOpen ? 'lg:ml-[270px] ml-0' : 'ml-0'
        }`}
      >
        <div className="p-6 flex-1 flex flex-col min-h-0 overflow-auto relative">
          <Outlet context={{ isDarkMode, onToggleDarkMode: toggleDark, showToast }} />
          
          {/* Global Admin Toast */}
          {toast.show && (
            <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up max-w-sm w-full">
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border ${
                  toast.type === "success"
                    ? "bg-[#0466c8] text-white border-[#0353a4]"
                    : "bg-rose-600 text-white border-rose-700"
                }`}
              >
                {toast.type === "success" ? (
                  <Icons.CheckCircle className="w-5 h-5 shrink-0" />
                ) : (
                  <Icons.AlertCircle className="w-5 h-5 shrink-0" />
                )}
                <p className="text-sm font-bold">{toast.message}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
