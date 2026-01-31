import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

const monthlyData: { name: string; credits: number; repayments: number }[] = [];
const portfolioData: { name: string; value: number; color: string }[] = [];
const riskDistribution: { name: string; value: number; color: string }[] = [];
const recentActivity: { id: number; user: string; action: string; amount: string; time: string; type: string }[] = [];
const users: { id: number; name: string; email: string; status: string; credit: string; score: number; date: string }[] = [];

export function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount, setNotificationCount] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Actif': return 'bg-success/10 text-success';
      case 'En attente': return 'bg-warning/10 text-warning';
      case 'Refusé': return 'bg-error/10 text-error';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sidebarItems = [
    { icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Dashboard', active: true },
    { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', label: 'Utilisateurs', badge: '124' },
    { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', label: 'Demandes de crédit', badge: '8' },
    { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Transactions', badge: '156' },
    { icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', label: 'Rapports', badge: '3' },
    { icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', label: 'Paramètres', badge: null },
  ];

  return (
    <div className="min-h-screen bg-surface-secondary flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-surface border-r border-gray-100 transition-all duration-300 flex flex-col fixed h-full z-20`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            {sidebarOpen && (
              <div className="animate-fade-in">
                <span className="text-lg font-bold text-text-primary">RawFinance</span>
                <p className="text-xs text-text-secondary">Admin Dashboard</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item, index) => (
            <a
              key={index}
              href="#"
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                item.active 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg className={`w-5 h-5 ${item.active ? 'text-primary' : 'text-gray-400 group-hover:text-text-primary'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {sidebarOpen && (
                  <span className="font-medium text-sm animate-fade-in">{item.label}</span>
                )}
              </div>
              {sidebarOpen && item.badge && (
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  item.active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
              A
            </div>
            {sidebarOpen && (
              <div className="animate-fade-in flex-1">
                <p className="text-sm font-medium text-text-primary">Admin User</p>
                <p className="text-xs text-text-secondary">admin@rawfinance.fr</p>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-surface border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-text-primary hover:bg-gray-50 transition-colors shadow-sm"
        >
          <svg className={`w-4 h-4 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-surface border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-text-primary">Dashboard Administrateur</h1>
              <p className="text-sm text-text-secondary">Vue d'ensemble de votre plateforme</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Input 
                  placeholder="Rechercher..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-text-primary hover:bg-gray-50 rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notificationCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-error text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {notificationCount}
                  </span>
                )}
              </button>

              {/* Date & Time */}
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-text-primary">{currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                <p className="text-xs text-text-secondary">{currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>

              {/* Quick Actions */}
              <Button variant="primary" className="hidden sm:flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nouvelle demande
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Total prêté', value: '—', change: '—', trend: 'up' as const, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'primary' },
              { title: 'Taux de remboursement', value: '—', change: '—', trend: 'up' as const, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'success' },
              { title: 'Utilisateurs actifs', value: '—', change: '—', trend: 'up' as const, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'info' },
              { title: 'Crédits en cours', value: '—', change: '—', trend: 'up' as const, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'warning' },
            ].map((kpi, index) => (
              <Card key={index} className="hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">{kpi.title}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-text-primary mt-1">{kpi.value}</p>
                    <div className="flex items-center mt-2">
                      <span className={`text-xs font-medium flex items-center ${kpi.trend === 'up' ? 'text-success' : 'text-error'}`}>
                        <svg className={`w-3 h-3 mr-1 ${kpi.trend === 'down' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        {kpi.change}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">vs mois dernier</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl bg-${kpi.color}/10 group-hover:scale-110 transition-transform duration-300`}>
                    <svg className={`w-6 h-6 text-${kpi.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={kpi.icon} />
                    </svg>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chart */}
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Évolution des crédits</h3>
                  <p className="text-sm text-text-secondary">Credits accordés vs remboursements mensuels</p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-lg font-medium">2024</button>
                  <button className="px-3 py-1 text-sm text-text-secondary hover:bg-gray-50 rounded-lg font-medium transition-colors">2023</button>
                </div>
              </div>
              {monthlyData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-text-secondary text-sm">
                  Aucune donnée — Graphique après intégration
                </div>
              ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRepayments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)' 
                    }}
                  />
                  <Area type="monotone" dataKey="credits" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCredits)" />
                  <Area type="monotone" dataKey="repayments" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRepayments)" />
                </AreaChart>
              </ResponsiveContainer>
              )}
              <div className="flex justify-center space-x-6 mt-4">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-primary rounded-full mr-2" />
                  <span className="text-sm text-text-secondary">Crédits accordés</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-success rounded-full mr-2" />
                  <span className="text-sm text-text-secondary">Remboursements</span>
                </div>
              </div>
            </Card>

            {/* Pie Chart */}
            <Card>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-primary">Répartition du portefeuille</h3>
                <p className="text-sm text-text-secondary">Distribution par type de crédit</p>
              </div>
              {portfolioData.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-text-secondary text-sm">
                  Aucune donnée
                </div>
              ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              )}
              <div className="space-y-2 mt-4">
                {portfolioData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-text-secondary">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-text-primary">{item.value}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Activité récente</h3>
                  <p className="text-sm text-text-secondary">Dernières actions sur la plateforme</p>
                </div>
                <button className="text-sm text-primary hover:text-primary-dark font-medium transition-colors">
                  Voir tout
                </button>
              </div>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <p className="text-text-secondary text-sm text-center py-8">Aucune activité récente</p>
                ) : recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'success' ? 'bg-success/10' :
                      activity.type === 'error' ? 'bg-error/10' :
                      activity.type === 'warning' ? 'bg-warning/10' : 'bg-info/10'
                    }`}>
                      {activity.type === 'success' && (
                        <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {activity.type === 'error' && (
                        <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      {activity.type === 'warning' && (
                        <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      )}
                      {activity.type === 'info' && (
                        <svg className="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{activity.user}</p>
                      <p className="text-sm text-text-secondary">{activity.action}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-text-primary">{activity.amount}</p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Users Table */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Gestion des utilisateurs</h3>
                  <p className="text-sm text-text-secondary">{filteredUsers.length} utilisateurs trouvés</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="secondary" size="sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filtre
                  </Button>
                  <Button variant="secondary" size="sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Statut</th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Crédit</th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Score</th>
                      <th className="text-right py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-text-secondary text-sm">
                          Aucun utilisateur
                        </td>
                      </tr>
                    ) : filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="py-3 px-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-xs font-semibold text-gray-600">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-text-primary truncate">{user.name}</p>
                              <p className="text-xs text-text-secondary truncate hidden sm:block">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 hidden md:table-cell">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 hidden lg:table-cell">
                          <span className="text-sm font-medium text-text-primary">{user.credit}</span>
                        </td>
                        <td className="py-3 px-2 hidden sm:table-cell">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-16">
                              <div 
                                className={`h-full rounded-full ${
                                  user.score >= 80 ? 'bg-success' :
                                  user.score >= 60 ? 'bg-warning' : 'bg-error'
                                }`}
                                style={{ width: `${user.score}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-text-secondary">{user.score}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-text-secondary">
                  Affichage de <span className="font-medium">{filteredUsers.length}</span> sur <span className="font-medium">{users.length}</span> utilisateurs
                </p>
                <div className="flex space-x-1">
                  <button className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-text-secondary">Précédent</button>
                  <button className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-text-secondary">Suivant</button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
