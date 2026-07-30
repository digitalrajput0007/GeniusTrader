import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// --- Import Your Page Components ---
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage'; 
import PaperTradePage from './pages/PaperTradePage';
import PositionSizerPage from './pages/PositionSizerPage';
import CurrencyConverterPage from './pages/CurrencyConverterPage';
import RiskManagementPage from './pages/RiskManagementPage';
import AdminPage from './pages/AdminPage';
import ActionHandlerPage from './pages/ActionHandlerPage';
import ProfilePage from './pages/ProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import RankingPage from './pages/RankingPage';
import PerformancePage from './pages/PerformancePage';
import DashboardPage from './pages/DashboardPage';
import Homepage from './pages/Homepage';
import About from './pages/About';
import Pricing from './pages/Pricing';
import UserManagement from './pages/UserManagement';

function App() {
  return (
    <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/home" element={<Homepage />} />
          <Route path="/landing" element={<Homepage />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          
          {/* Action Handler Routes */}
          <Route path="/action" element={<ActionHandlerPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Private User Routes */}
          <Route path="/" element={<Navigate to="/performance" replace />} />
          <Route path="/position-sizer" element={<ProtectedRoute><PositionSizerPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/paper-trades" element={<ProtectedRoute><PaperTradePage /></ProtectedRoute>} />
          <Route path="/journal" element={<Navigate to="/paper-trades" replace />} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
          <Route path="/currency-converter" element={<ProtectedRoute><CurrencyConverterPage /></ProtectedRoute>} />
          <Route path="/risk-management" element={<ProtectedRoute><RiskManagementPage /></ProtectedRoute>} />
          <Route path="/performance" element={<ProtectedRoute><PerformancePage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<Navigate to="/performance" replace />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/ranking" element={<AdminRoute><RankingPage /></AdminRoute>} />
          <Route path="/user-management" element={<AdminRoute><UserManagement /></AdminRoute>} />

        </Routes>
    </Router>
  );
}

export default App;