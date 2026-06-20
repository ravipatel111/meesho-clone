import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

const UserLayout = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem('user-dark-mode') === 'true'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const onToggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('user-dark-mode', String(next));
      return next;
    });
  };

  return (
    <div className={`min-h-screen bg-gray-55 ${isDarkMode ? 'dark' : ''}`}>
      <main className="w-full">
        <Outlet context={{ isDarkMode, onToggleDarkMode }} />
      </main>
    </div>
  );
};

export default UserLayout;
