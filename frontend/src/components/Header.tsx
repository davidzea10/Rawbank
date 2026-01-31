import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Menu, X, User, LayoutDashboard, Wallet, CreditCard, Settings, LogOut } from 'lucide-react';

export function Header() {
  const { user, isAuthenticated, logout } = useUser();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Accueil' },
    { path: '/about', label: 'À propos' },
    { path: '/contact', label: 'Contact' },
  ];

  const userLinks = [
    { path: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { path: '/mobile-money', label: 'Mobile Money', icon: Wallet },
    { path: '/repayment', label: 'Remboursement', icon: CreditCard },
    { path: '/settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-lg border-b border-gray-200/80" style={{ boxShadow: '0 1px 20px rgba(234,179,8,0.06)' }}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md shadow-primary/20 group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <span className="text-xl font-bold text-text-primary hidden sm:block">RawFinance Pro</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                {userLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  );
                })}
                <div className="ml-4 pl-4 border-l border-gray-200 flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-text-primary">{user?.firstName}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-text-secondary hover:bg-gray-100 hover:text-text-primary transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </div>
              </>
            ) : (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-medium transition-colors ${
                      isActive(link.path)
                        ? 'text-primary'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link to="/signup" className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark shadow-md shadow-primary/20 transition-all">
                  Commencer
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-text-secondary hover:text-text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-1">
              {isAuthenticated ? (
                <>
                  {userLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ${
                          isActive(link.path) ? 'bg-primary/10 text-primary' : 'text-text-secondary'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon className="w-5 h-5" />
                        {link.label}
                      </Link>
                    );
                  })}
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-left text-base text-text-secondary hover:bg-gray-100"
                  >
                    <LogOut className="w-5 h-5" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`text-base font-medium ${
                        isActive(link.path)
                          ? 'text-primary'
                          : 'text-text-secondary'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    to="/signup"
                    className="btn-primary text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Commencer
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
