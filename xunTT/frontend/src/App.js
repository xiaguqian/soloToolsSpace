import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';
import AuthPage from './components/AuthPage';
import MainWindow from './components/MainWindow';

const App = () => {
  const { user, token } = useStore();
  const isAuthenticated = !!user && !!token;

  return (
    <Routes>
      {!isAuthenticated ? (
        <>
          <Route path="/login" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<MainWindow />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
};

export default App;
