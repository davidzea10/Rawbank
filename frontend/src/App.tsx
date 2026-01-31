import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import {
  LandingPage,
  SignupPage,
  LoginPage,
  AdminDashboard,
  DashboardParticulier,
  DashboardEntrepreneur,
  MobileMoneyPage,
  CreditRequestPage,
  RepaymentPage,
  SettingsPage,
} from './pages';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useUser();
  
  if (!isAuthenticated) {
    return <Navigate to="/signup" replace />;
  }
  
  return <>{children}</>;
}

// Dashboard Route with Type Check
function DashboardRoute() {
  const { user } = useUser();
  
  if (!user?.type || user.type === 'particulier') {
    return <DashboardParticulier />;
  }
  return <DashboardEntrepreneur />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <>
          <Header />
          <LandingPage />
          <Footer />
        </>
      } />
      
      <Route path="/signup" element={
        <>
          <SignupPage />
        </>
      } />
      
      <Route path="/login" element={
        <>
          <LoginPage />
        </>
      } />
      
      <Route path="/admin" element={
        <AdminDashboard />
      } />
      
      <Route path="/about" element={
        <>
          <Header />
          <div className="min-h-screen pt-20 pb-12 bg-surface-secondary">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-3xl font-bold text-text-primary mb-4">À propos de RawFinance Pro</h1>
              <p className="text-text-secondary">Plateforme de microcrédit intelligente pour la RDC</p>
            </div>
          </div>
          <Footer />
        </>
      } />
      
      <Route path="/contact" element={
        <>
          <Header />
          <div className="min-h-screen pt-20 pb-12 bg-surface-secondary">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-3xl font-bold text-text-primary mb-4">Contactez-nous</h1>
              <p className="text-text-secondary">support@rawfinance.cd • +243 81 234 5678</p>
            </div>
          </div>
          <Footer />
        </>
      } />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Header />
          <DashboardRoute />
        </ProtectedRoute>
      } />
      
      <Route path="/mobile-money" element={
        <ProtectedRoute>
          <Header />
          <MobileMoneyPage />
        </ProtectedRoute>
      } />
      
      <Route path="/credit/new" element={
        <ProtectedRoute>
          <Header />
          <CreditRequestPage />
        </ProtectedRoute>
      } />
      
      <Route path="/repayment" element={
        <ProtectedRoute>
          <Header />
          <RepaymentPage />
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Header />
          <SettingsPage />
        </ProtectedRoute>
      } />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
