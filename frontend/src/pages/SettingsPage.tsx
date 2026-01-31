import { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  Lock,
  Bell,
  FileText,
  Shield,
  HelpCircle,
  Camera,
  ChevronRight,
  Check,
  Globe,
  Smartphone
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { useUser } from '../context/UserContext';
import { api } from '../config/api';

export function SettingsPage() {
  const { user, updateUser } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  const [notifications, setNotifications] = useState({
    sms: true,
    email: true,
    push: false,
    marketing: false,
  });

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'consent', label: 'Consentements', icon: Shield },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ];

  // Mettre à jour profileData quand user change
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user?.id) {
      setMessage({ type: 'error', text: 'Utilisateur non connecté' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Récupérer le token depuis localStorage
      const token = localStorage.getItem('rawfinance_access_token');

      // Préparer les données modifiées (id + champs modifiés uniquement)
      const updatedData = {
        id: user.id,
        prenom: profileData.firstName,
        nom: profileData.lastName,
      };

      const apiUrl = api.users.updateProfile;

      console.log('=== MODIFICATION DU PROFIL ===');
      console.log('URL:', apiUrl);
      console.log('Données envoyées:', updatedData);

      // Envoyer la requête PUT
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();

      console.log('=== RÉPONSE DU SERVEUR ===');
      console.log('Réponse:', data);

      if (response.ok && data.status === 'ok') {
        // Succès - mettre à jour le contexte local
        updateUser({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
        });

        setMessage({ type: 'success', text: 'Profil mis à jour avec succès!' });
        console.log('✅ Profil mis à jour avec succès');
      } else {
        // Erreur
        const errorMessage = data.message || 'Erreur lors de la mise à jour du profil';
        setMessage({ type: 'error', text: errorMessage });
        console.error('❌ Erreur:', data);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion au serveur';
      setMessage({ type: 'error', text: errorMessage });
      console.error('❌ Erreur lors de la mise à jour:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            {/* Success/Error Message */}
            {message && (
              <div className={`p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-success/10 border border-success text-success' 
                  : 'bg-danger/10 border border-danger text-danger'
              }`}>
                {message.text}
              </div>
            )}

            {/* Profile Photo */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-sm text-text-secondary">Membre depuis janvier 2024</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Prénom"
                value={profileData.firstName}
                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                leftIcon={<User className="w-5 h-5" />}
              />
              <Input
                label="Nom"
                value={profileData.lastName}
                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                leftIcon={<User className="w-5 h-5" />}
              />
            </div>

            <Input
              label="Téléphone"
              value={user?.phone || ''}
              leftIcon={<Phone className="w-5 h-5" />}
              disabled
              helperText="Contactez le support pour modifier votre numéro"
            />

            <Input
              label="Email"
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              leftIcon={<Mail className="w-5 h-5" />}
            />

            <div className="pt-4 border-t border-gray-100">
              <Button onClick={handleSaveProfile} isLoading={isLoading}>
                {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <Card hover>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">Code PIN</h4>
                    <p className="text-sm text-text-secondary">Modifier votre code PIN à 4 chiffres</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm">Modifier</Button>
              </div>
            </Card>

            <Card hover>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">Authentification à deux facteurs</h4>
                    <p className="text-sm text-text-secondary">Protection renforcée de votre compte</p>
                  </div>
                </div>
                <Badge variant="warning">Non activé</Badge>
              </div>
            </Card>

            <Card hover>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">Appareils connectés</h4>
                    <p className="text-sm text-text-secondary">Gérez vos sessions actives</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-text-secondary" />
              </div>
            </Card>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {[
                { key: 'sms', label: 'Notifications SMS', desc: 'Alertes de paiement, rappels, confirmations' },
                { key: 'email', label: 'Emails', desc: 'Relevés mensuels, rappels, conseils financiers' },
                { key: 'push', label: 'Notifications push', desc: 'Alertes en temps réel sur l\'app' },
                { key: 'marketing', label: 'Communications marketing', desc: 'Offres spéciales et promotions' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <h4 className="font-medium text-text-primary">{item.label}</h4>
                    <p className="text-sm text-text-secondary">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notifications[item.key as keyof typeof notifications] ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-text-primary">Pièce d'identité (CNI)</h4>
                <Badge variant="success">Vérifié</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Uploadé le 15/01/2024</span>
                <button className="text-primary hover:underline">Voir</button>
              </div>
            </Card>

            {user?.type === 'entrepreneur' && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-text-primary">Justificatif de revenus</h4>
                  <Badge variant="default">Non uploadé</Badge>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileText className="w-8 h-8 mx-auto text-text-secondary mb-2" />
                  <p className="text-sm text-text-secondary mb-2">
                    Uploadez un justificatif de revenus (optionnel)
                  </p>
                  <Button variant="secondary" size="sm">Choisir un fichier</Button>
                </div>
              </Card>
            )}
          </div>
        );

      case 'consent':
        return (
          <div className="space-y-6">
            <Card>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-text-primary">Données personnelles</h4>
                  <p className="text-sm text-text-secondary mt-1">
                    Vous consentez au traitement de vos données personnelles pour l'évaluation de crédit
                  </p>
                  <div className="flex items-center mt-3 space-x-2">
                    <Badge variant="success">Accepté</Badge>
                    <button className="text-sm text-primary hover:underline">Gérer</button>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center mt-1">
                  <Globe className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-text-primary">Partage de données</h4>
                  <p className="text-sm text-text-secondary mt-1">
                    Autorisez le partage de vos données avec nos partenaires
                  </p>
                  <div className="flex items-center mt-3 space-x-2">
                    <Badge variant="warning">En attente</Badge>
                    <button className="text-sm text-primary hover:underline">Gérer</button>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h4 className="font-medium text-text-primary mb-4">Données collectées</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-secondary" />
                  <span>Données Mobile Money (appels, SMS, solde)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-secondary" />
                  <span>Données de votre téléphone</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-secondary" />
                  <span>Données sociales (si autorisé)</span>
                </li>
              </ul>
            </Card>
          </div>
        );

      case 'support':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Card hover className="text-center py-6">
                <HelpCircle className="w-10 h-10 mx-auto mb-3 text-primary" />
                <h4 className="font-medium text-text-primary">Centre d'aide</h4>
                <p className="text-sm text-text-secondary">Parcourir la FAQ</p>
              </Card>
              <Card hover className="text-center py-6">
                <Mail className="w-10 h-10 mx-auto mb-3 text-primary" />
                <h4 className="font-medium text-text-primary">Email</h4>
                <p className="text-sm text-text-secondary">support@rawfinance.cd</p>
              </Card>
            </div>

            <Card>
              <h4 className="font-medium text-text-primary mb-4">Nous contacter</h4>
              <form className="space-y-4">
                <Input label="Sujet" placeholder="Sujet de votre demande" />
                <div>
                  <label className="label">Message</label>
                  <textarea
                    className="input min-h-[120px] resize-none"
                    placeholder="Décrivez votre problème..."
                  />
                </div>
                <Button>Envoyer</Button>
              </form>
            </Card>

            <Card className="bg-surface-secondary">
              <h4 className="font-medium text-text-primary mb-2">Hotline</h4>
              <p className="text-2xl font-bold text-primary">+243 81 234 5678</p>
              <p className="text-sm text-text-secondary">Disponible 7j/7 de 8h à 20h</p>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-surface-secondary pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">
            Paramètres
          </h1>
          <p className="text-text-secondary mt-1">
            Gérez votre compte et vos préférences
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                      activeTab === tab.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-secondary hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <Card>
              <h2 className="text-xl font-semibold text-text-primary mb-6">
                {tabs.find((t) => t.id === activeTab)?.label}
              </h2>
              {renderTabContent()}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
