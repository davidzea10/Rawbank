import { useState } from 'react';
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {   
  Phone, 
  Mail, 
  User, 
  Building, 
  MapPin, 
  CheckCircle,
  Camera,
  Lock
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input, Select } from '../components/Input';
import { useUser } from '../context/UserContext';
import { api } from '../config/api';

type Step = 'phone' | 'identification' | 'profile' | 'mobile-money' | 'confirmation';

export function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, updateUser } = useUser();

  const [currentStep, setCurrentStep] = useState<Step>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    profileType: searchParams.get('type') || 'particulier',
    businessName: '',
    sector: '',
    location: '',
    operator: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { id: 'phone', label: 'Téléphone' },
    { id: 'identification', label: 'Identification' },
    { id: 'profile', label: 'Profil' },
    { id: 'mobile-money', label: 'Mobile Money' },
    { id: 'confirmation', label: 'Confirmation' },
  ];

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 'phone':
        if (!formData.phone) newErrors.phone = 'Le numéro de téléphone est requis';
        else {
          // Accepter n'importe quel numéro avec au moins 10 chiffres
          const phoneWithoutSpaces = formData.phone.replace(/\s+/g, '');
          const digitsOnly = phoneWithoutSpaces.replace(/^\+/, ''); // Enlever le + au début
          
          if (!/^[0-9]{10,}$/.test(digitsOnly)) {
            newErrors.phone = 'Minimum 10 chiffres requis';
          }
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Email invalide';
        }
        break;
      case 'identification':
        if (!formData.firstName) newErrors.firstName = 'Le prénom est requis';
        if (!formData.lastName) newErrors.lastName = 'Le nom est requis';
        if (!formData.password) newErrors.password = 'Le mot de passe est requis';
        else if (formData.password.length < 8) {
          newErrors.password = 'Minimum 8 caractères';
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }
        break;
      case 'profile':
        if (formData.profileType === 'entrepreneur') {
          if (!formData.businessName) newErrors.businessName = 'Le nom de l\'entreprise est requis';
          if (!formData.sector) newErrors.sector = 'Le secteur est requis';
          if (!formData.location) newErrors.location = 'La localisation est requise';
        }
        break;
      case 'mobile-money':
        if (!formData.operator) newErrors.operator = 'Sélectionnez un opérateur';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    const stepOrder: Step[] = ['phone', 'identification', 'profile', 'mobile-money', 'confirmation'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const stepOrder: Step[] = ['phone', 'identification', 'profile', 'mobile-money', 'confirmation'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setSubmitError(null);

    try {
      // Formater le numéro de téléphone - enlever seulement les espaces
      const phoneNumber = formData.phone.replace(/\s+/g, '');

      // Préparer les données pour l'API (format exact attendu par le serveur)
      const registrationData = {
        email: formData.email,
        password: formData.password,
        numero_telephone: phoneNumber,
        prenom: formData.firstName,
        nom: formData.lastName,
        mobile_money_lie: formData.operator,
      };

      const apiUrl = api.auth.register;

      // Afficher l'URL et les données envoyées dans la console (debug)
      console.log('=== ENVOI DE LA REQUÊTE ===');
      console.log('URL:', apiUrl);
      console.log('Données envoyées:', registrationData);
      console.log('JSON:', JSON.stringify(registrationData, null, 2));

      // Envoyer la requête POST à l'API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (response.ok) {
        // Succès - afficher la réponse et rediriger
        console.log('Réponse du serveur:', data);
        alert(`Inscription réussie! ${JSON.stringify(data, null, 2)}`);
        
        // Mettre à jour le contexte utilisateur
        login(formData.phone);
        updateUser({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          type: formData.profileType as 'particulier' | 'entrepreneur',
        });
        
        navigate('/dashboard');
      } else {
        // Erreur du serveur
        setSubmitError(data.message || 'Erreur lors de l\'inscription');
        console.error('Erreur serveur:', data);
        alert(`Erreur: ${data.message || 'Une erreur est survenue'}`);
      }
    } catch (error) {
      // Erreur réseau ou autre
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion au serveur';
      setSubmitError(errorMessage);
      console.error('Erreur lors de l\'inscription:', error);
      alert(`Erreur de connexion: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'phone':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-text-primary">
                Commençons par votre téléphone
              </h2>
              <p className="text-text-secondary mt-2">
                Vous recevrez un code de vérification par SMS
              </p>
            </div>
            <Input
              label="Numéro de téléphone"
              placeholder="0812345678 ou +243812345678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              leftIcon={<Phone className="w-5 h-5" />}
              error={errors.phone}
              helperText="Minimum 10 chiffres"
            />
            <Input
              label="Email (optionnel)"
              type="email"
              placeholder="votre@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              leftIcon={<Mail className="w-5 h-5" />}
              error={errors.email}
              helperText="Pour recevoir vos relevés et notifications"
            />
          </div>
        );

      case 'identification':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-text-primary">
                Votre identité
              </h2>
              <p className="text-text-secondary mt-2">
                Informations personnelles pour vérifier votre identité
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prénom"
                placeholder="Jean"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                leftIcon={<User className="w-5 h-5" />}
                error={errors.firstName}
              />
              <Input
                label="Nom"
                placeholder="Dupont"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                leftIcon={<User className="w-5 h-5" />}
                error={errors.lastName}
              />
            </div>
            
            <Input
              label="Mot de passe"
              type="password"
              placeholder="Minimum 8 caractères"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              leftIcon={<Lock className="w-5 h-5" />}
              error={errors.password}
            />
            
            <Input
              label="Confirmer le mot de passe"
              type="password"
              placeholder="Retapez votre mot de passe"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              leftIcon={<Lock className="w-5 h-5" />}
              error={errors.confirmPassword}
            />
            
            {/* CNI Upload Simulation */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <Camera className="w-10 h-10 mx-auto text-text-secondary mb-3" />
              <p className="font-medium text-text-primary mb-1">
                Photographier votre CNI
              </p>
              <p className="text-sm text-text-secondary">
                Recto + Verso + Selfie pour vérification
              </p>
              <p className="text-xs text-text-secondary mt-2">
                (OCR automatique - étape simulée)
              </p>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-text-primary">
                Votre profil
              </h2>
              <p className="text-text-secondary mt-2">
                Dites-nous qui vous êtes pour adapter nos services
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, profileType: 'particulier' })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.profileType === 'particulier'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <User className={`w-6 h-6 mx-auto mb-2 ${
                  formData.profileType === 'particulier' ? 'text-primary' : 'text-text-secondary'
                }`} />
                <p className="font-medium text-text-primary">Particulier</p>
                <p className="text-xs text-text-secondary">Besoins personnels</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, profileType: 'entrepreneur' })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.profileType === 'entrepreneur'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Building className={`w-6 h-6 mx-auto mb-2 ${
                  formData.profileType === 'entrepreneur' ? 'text-primary' : 'text-text-secondary'
                }`} />
                <p className="font-medium text-text-primary">Entrepreneur</p>
                <p className="text-xs text-text-secondary">Besoins business</p>
              </button>
            </div>

            {formData.profileType === 'entrepreneur' && (
              <div className="space-y-4 animate-fade-in">
                <Input
                  label="Nom de l'entreprise"
                  placeholder="Nom de votre commerce"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  leftIcon={<Building className="w-5 h-5" />}
                  error={errors.businessName}
                />
                <Select
                  label="Secteur d'activité"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  options={[
                    { value: '', label: 'Sélectionner...' },
                    { value: 'commerce', label: 'Commerce' },
                    { value: 'services', label: 'Services' },
                    { value: 'artisanat', label: 'Artisanat' },
                    { value: 'agriculture', label: 'Agriculture' },
                    { value: 'transport', label: 'Transport' },
                    { value: 'autre', label: 'Autre' },
                  ]}
                  error={errors.sector}
                />
                <Input
                  label="Localisation"
                  placeholder="Ville, quartier"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  leftIcon={<MapPin className="w-5 h-5" />}
                  error={errors.location}
                />
              </div>
            )}
          </div>
        );

      case 'mobile-money':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-text-primary">
                Liez votre Mobile Money
              </h2>
              <p className="text-text-secondary mt-2">
                Pour recevoir et rembourser vos crédits
              </p>
            </div>
            
            <div className="space-y-3">
              {[
                { id: 'orange', name: 'Orange Money', color: 'orange' },
                { id: 'mpesa', name: 'M-Pesa', color: 'yellow' },
                { id: 'airtel', name: 'Airtel Money', color: 'red' },
              ].map((operator) => (
                <button
                  key={operator.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, operator: operator.id })}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center space-x-4 ${
                    formData.operator === operator.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    operator.id === 'orange' ? 'bg-orange-500' :
                    operator.id === 'mpesa' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                    <span className="text-white font-bold text-lg">
                      {operator.name[0]}
                    </span>
                  </div>
                  <span className="font-medium text-text-primary">{operator.name}</span>
                </button>
              ))}
            </div>
            {errors.operator && (
              <p className="text-sm text-danger">{errors.operator}</p>
            )}
            
            <div className="bg-surface-secondary rounded-lg p-4 text-sm text-text-secondary">
              <p>🔒 Vos données sont sécurisées et chiffrées. Nous ne stockons pas votre code PIN.</p>
            </div>
          </div>
        );

      case 'confirmation':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-secondary" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary">
                Vérifiez vos informations
              </h2>
            </div>
            
            <Card>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Téléphone</span>
                  <span className="font-medium">{formData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Nom complet</span>
                  <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Profil</span>
                  <span className="font-medium capitalize">{formData.profileType}</span>
                </div>
                {formData.profileType === 'entrepreneur' && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Entreprise</span>
                    <span className="font-medium">{formData.businessName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-text-secondary">Mobile Money</span>
                  <span className="font-medium capitalize">{formData.operator}</span>
                </div>
              </div>
            </Card>
            
            <label className="flex items-start space-x-3 cursor-pointer">
              <input type="checkbox" className="mt-1 w-4 h-4 text-primary rounded border-gray-300" />
              <span className="text-sm text-text-secondary">
                J'accepte les conditions générales et la politique de confidentialité
              </span>
            </label>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-surface-secondary pt-16 pb-12">
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const stepOrder: Step[] = ['phone', 'identification', 'profile', 'mobile-money', 'confirmation'];
              const stepIndex = stepOrder.indexOf(currentStep);
              const isActive = step.id === currentStep;
              const isCompleted = stepIndex > stepOrder.indexOf(currentStep);
              
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${isCompleted ? 'bg-secondary text-white' : ''}
                      ${isActive ? 'bg-primary text-white' : ''}
                      ${!isActive && !isCompleted ? 'bg-gray-200 text-text-secondary' : ''}
                    `}>
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                    </div>
                    <span className={`text-xs mt-1 hidden sm:block ${isActive ? 'text-primary' : 'text-text-secondary'}`}>
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      stepIndex > index ? 'bg-secondary' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <Card className="animate-fade-in">
          {submitError && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger rounded-lg text-danger text-sm">
              {submitError}
            </div>
          )}
          {renderStep()}
          
          {/* Navigation Buttons */}
          <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-100">
            {currentStep !== 'phone' && (
              <Button variant="secondary" onClick={handleBack} fullWidth>
                Retour
              </Button>
            )}
            {currentStep !== 'confirmation' ? (
              <Button onClick={handleNext} fullWidth>
                Suivant
              </Button>
            ) : (
              <Button onClick={handleSubmit} fullWidth isLoading={isLoading}>
                {isLoading ? 'Inscription en cours...' : 'Créer mon compte'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
