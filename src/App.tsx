import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Plans from './pages/Plans';
import Templates from './pages/Templates';
import Users from './pages/Users';
import Videos from './pages/Videos';
import Reports from './pages/Reports';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(30, 41, 59, 0.95)',
              color: '#fff',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/plans" element={<Plans />} />
                    <Route path="/templates" element={<Templates />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/videos" element={<Videos />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
