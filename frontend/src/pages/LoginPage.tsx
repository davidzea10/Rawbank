import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { api } from '../config/api';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { useUser } from '../context/UserContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login: loginUser, updateUser } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Veuillez entrer un email valide';
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setSubmitError(null);

    try {
      const loginData = {
        email: formData.email,
        password: formData.password,
      };

      const apiUrl = api.auth.login;

      // Afficher l'URL et les données envoyées dans la console
      console.log('=== CONNEXION - ENVOI DE LA REQUÊTE ===');
      console.log('URL:', apiUrl);
      console.log('Données envoyées:', loginData);

      // Envoyer la requête POST à l'API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      console.log('=== RÉPONSE DU SERVEUR ===');
      console.log('Réponse complète:', data);

      if (response.ok && data.ok) {
        // Succès - extraire les données utilisateur
        const userData = data.user;
        const session = data.session;

        console.log('Profil utilisateur (login):', userData.profil);
        console.log('Token:', session?.access_token);

        // Stocker le token dans localStorage
        if (session?.access_token) {
          localStorage.setItem('rawfinance_access_token', session.access_token);
          localStorage.setItem('rawfinance_refresh_token', session.refresh_token);
        }

        // Récupérer le profil complet de l'utilisateur
        try {
          const profileUrl = api.users.profile(userData.id);
          console.log('=== RÉCUPÉRATION DU PROFIL ===');
          console.log('URL:', profileUrl);
          console.log('User ID:', userData.id);

          const profileResponse = await fetch(profileUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`,
            },
          });

          const profileData = await profileResponse.json();
          console.log('=== RÉPONSE DU PROFIL ===');
          console.log('Réponse complète:', profileData);

          if (profileResponse.ok && profileData.ok) {
            const userProfile = profileData.user;
            
            console.log('Informations utilisateur:');
            console.log('- ID:', userProfile.id);
            console.log('- Email:', userProfile.email);
            console.log('- Téléphone:', userProfile.numero_telephone);
            console.log('- Prénom:', userProfile.profil?.prenom);
            console.log('- Nom:', userProfile.profil?.nom);
            console.log('- Type profil:', userProfile.profil?.type_profil);
            console.log('- Comptes Mobile Money:', userProfile.comptes_mobile_money);
            console.log('- Détails entrepreneur:', userProfile.details_entrepreneur);

            // Mettre à jour le contexte utilisateur avec le profil complet
            loginUser(userProfile.numero_telephone);
            updateUser({
              id: userProfile.id,
              email: userProfile.email,
              phone: userProfile.numero_telephone,
              firstName: userProfile.profil?.prenom || '',
              lastName: userProfile.profil?.nom || '',
              type: userProfile.profil?.type_profil || null,
            });

            // Afficher un message de succès avec les informations
            alert(`Bienvenue ${userProfile.profil?.prenom} ${userProfile.profil?.nom}!\n\nEmail: ${userProfile.email}\nTéléphone: ${userProfile.numero_telephone}\nType: ${userProfile.profil?.type_profil}\n\nVoir la console pour plus de détails.`);
          } else {
            console.error('Erreur lors de la récupération du profil:', profileData);
            // Utiliser les données du login en cas d'échec
            loginUser(userData.numero_telephone);
            updateUser({
              id: userData.id,
              email: userData.email,
              phone: userData.numero_telephone,
              firstName: userData.profil?.prenom || '',
              lastName: userData.profil?.nom || '',
              type: userData.profil?.type_profil || null,
            });
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du profil:', error);
          // Utiliser les données du login en cas d'erreur
          loginUser(userData.numero_telephone);
          updateUser({
            id: userData.id,
            email: userData.email,
            phone: userData.numero_telephone,
            firstName: userData.profil?.prenom || '',
            lastName: userData.profil?.nom || '',
            type: userData.profil?.type_profil || null,
          });
        }

        // Afficher succès
        setIsSuccess(true);

        // Rediriger selon le type de profil
        setTimeout(() => {
          if (userData.email === 'admin@gmail.com') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }, 800);

      } else {
        // Erreur du serveur
        setSubmitError(data.message || 'Email ou mot de passe incorrect');
        console.error('Erreur serveur:', data);
        setIsLoading(false);
      }
    } catch (error) {
      // Erreur réseau ou autre
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion au serveur';
      setSubmitError(errorMessage);
      console.error('Erreur lors de la connexion:', error);
      setIsLoading(false);
    }
  };

  const features = [
    { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', text: 'Validation instantanée' },
    { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', text: 'Sécurité renforcée' },
    { icon: 'M13 10V3L4 14h7v7l9-11h-7z', text: 'Rapide et simple' },
  ];

  return (
    <div className="min-h-screen bg-surface-secondary flex">
      {/* Left Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className={`max-w-md w-full relative z-10 transition-all duration-700 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-3 group">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-left">
                <span className="text-2xl font-bold text-text-primary">RawFinance</span>
                <p className="text-xs text-text-secondary -mt-1">Gestion de crédit intelligente</p>
              </div>
            </Link>
          </div>

          <Card className="shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            {/* Success Overlay */}
            {isSuccess && (
              <div className="absolute inset-0 bg-surface flex items-center justify-center z-20 animate-fade-in">
                <div className="text-center">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
                    <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-text-primary font-medium">Connexion réussie...</p>
                </div>
              </div>
            )}
            
            <div className="p-6 sm:p-8">
              <div className="text-center mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Bienvenue !</h1>
                <p className="text-text-secondary mt-1">Connectez-vous pour accéder à votre espace</p>
              </div>

              {submitError && (
                <div className="mb-4 p-3 bg-danger/10 border border-danger rounded-lg text-danger text-sm">
                  {submitError}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Adresse email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={errors.email}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  }
                />

                <Input
                  label="Mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  error={errors.password}
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="hover:text-primary transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  }
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center cursor-pointer">
                      <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="ml-2 text-sm text-text-secondary group-hover:text-text-primary transition-colors">Se souvenir de moi</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-dark transition-colors font-medium">
                    Mot de passe oublié ?
                  </Link>
                </div>

                <Button type="submit" fullWidth isLoading={isLoading} className="shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Connexion en cours...
                    </span>
                  ) : (
                    'Se connecter'
                  )}
                </Button>

                <div className="text-center pt-4">
                  <span className="text-text-secondary">Pas encore de compte ? </span>
                  <Link to="/signup" className="text-primary font-medium hover:text-primary-dark transition-colors">
                    S'inscrire gratuitement
                  </Link>
                </div>
              </form>
            </div>
          </Card>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-text-secondary">
            En vous connectant, vous acceptez nos{' '}
            <Link to="/terms" className="text-primary hover:underline">Conditions d'utilisation</Link>
            {' '}et notre{' '}
            <Link to="/privacy" className="text-primary hover:underline">Politique de confidentialité</Link>
          </p>

          {/* Demo credentials hint */}
          <div className="mt-4 p-4 bg-surface rounded-lg border border-gray-100">
            <p className="text-xs text-text-secondary text-center">
              <strong>Comptes de démonstration :</strong><br />
              Admin: admin@gmail.com / admin123<br />
              Particulier: user@demo.com / demo123
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Info & Features */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary to-primary-dark relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          <h2 className="text-3xl font-bold mb-4">Gérez vos finances intelligemment</h2>
          <p className="text-white/80 text-lg mb-8">
            RawFinance vous accompagne dans votre parcours financier avec un scoring alternatif adapté à votre réalité.
          </p>
          
          {/* Features List */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <span className="text-white/90">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-white/60 text-sm mb-4">Confiance de nos utilisateurs</p>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-2xl font-bold">10K+</p>
                <p className="text-white/60 text-xs">Utilisateurs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">50M+</p>
                <p className="text-white/60 text-xs">CDF octroyés</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">94%</p>
                <p className="text-white/60 text-xs">Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
