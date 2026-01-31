import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Calendar,
  FileText,
  CheckCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';

import { useUser } from '../context/UserContext';
import { api } from '../config/api';

type Step = 'amount' | 'purpose' | 'review' | 'result';

export function CreditRequestPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();

  useEffect(() => {
    if (!user?.id || user.creditLimit != null) return;
    fetch(api.users.score(user.id))
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.score != null) {
          updateUser({ score: data.score, creditLimit: data.creditLimit });
        }
      })
      .catch(() => {});
  }, [user?.id, user?.creditLimit, updateUser]);

  const minAmount = 10000;
  const maxAmount = user?.creditLimit ?? 300000;
  const interestRatePreview = 4; // Taux max pour prévisualisation (réel = 3–4 % selon score)

  const [currentStep, setCurrentStep] = useState<Step>('amount');
  const [formData, setFormData] = useState({
    amount: minAmount,
    duration: 3,
    purpose: '',
    purposeOther: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [pin, setPin] = useState(['', '', '', '']);
  const [submitResult, setSubmitResult] = useState<{
    ok: boolean;
    message: string;
    approved?: boolean;
  } | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Validation functions
  const isAmountValid = formData.amount >= minAmount && formData.amount <= maxAmount;
  const isPurposeValid = formData.purpose !== '';
  const isReviewValid = termsAccepted && pin.join('').length === 4;
  
  const calculateMonthlyPayment = () => {
    const principal = formData.amount;
    const rate = interestRatePreview / 100;
    const months = formData.duration;
    if (months === 1) return Math.round(principal * (1 + rate));
    return Math.round(principal * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1));
  };

  const durationOptions = [
    { value: 1, label: '1 mois' },
    { value: 3, label: '3 mois' },
    { value: 6, label: '6 mois' },
  ];

  const purposes = {
    particulier: [
      { value: 'personnel', label: 'Besoins personnels' },
      { value: 'urgence', label: 'Urgence médicale' },
      { value: 'education', label: 'Éducation' },
      { value: 'sante', label: 'Santé' },
      { value: 'logement', label: 'Logement' },
      { value: 'autre', label: 'Autre' },
    ],
    entrepreneur: [
      { value: 'tresorerie', label: 'Trésorerie' },
      { value: 'stock', label: 'Achat de stock' },
      { value: 'equipement', label: 'Équipement' },
      { value: 'investissement', label: 'Investissement' },
      { value: 'autre', label: 'Autre' },
    ],
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      const res = await fetch(api.users.creditRequest(user.id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: formData.amount,
          duration: formData.duration,
          purpose: formData.purpose || formData.purposeOther,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.message || 'Erreur serveur');
        return;
      }
      setSubmitResult({ ok: data.ok, message: data.message, approved: data.approved });
      setCurrentStep('result');
    } catch (e) {
      setSubmitError('Erreur de connexion');
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'amount':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-text-primary">
                Montant et durée
              </h2>
              <p className="text-text-secondary mt-2">
                Choisissez le montant que vous souhaitez emprunter
              </p>
            </div>

            {/* Amount Input */}
            <div>
              <Input
                label="Montant du crédit"
                type="number"
                placeholder={`Entrez un montant entre ${minAmount.toLocaleString()} et ${maxAmount.toLocaleString()} CDF`}
                value={formData.amount || ''}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setFormData({ ...formData, amount: value });
                }}
                onBlur={() => {
                  // Validate and clamp the amount when user leaves the field
                  const clampedValue = Math.max(minAmount, Math.min(formData.amount || 0, maxAmount));
                  setFormData({ ...formData, amount: clampedValue });
                }}
                error={formData.amount < minAmount ? `Le montant minimum est ${minAmount.toLocaleString()} CDF` : formData.amount > maxAmount ? `Le montant maximum est ${maxAmount.toLocaleString()} CDF` : undefined}
                helperText={`Montant entre ${minAmount.toLocaleString()} et ${maxAmount.toLocaleString()} CDF`}
              />
              <div className="flex justify-between mt-2 text-sm text-text-secondary">
                <span>Min: {minAmount.toLocaleString()} CDF</span>
                <span>Max: {maxAmount.toLocaleString()} CDF</span>
              </div>
            </div>

            {/* Duration Selection */}
            <div>
              <label className="label">Durée de remboursement</label>
              <div className="grid grid-cols-3 gap-3">
                {durationOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, duration: option.value })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.duration === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Calendar className={`w-6 h-6 mx-auto mb-2 ${
                      formData.duration === option.value ? 'text-primary' : 'text-text-secondary'
                    }`} />
                    <p className="font-medium text-text-primary">{option.label}</p>
                    <p className="text-xs text-text-secondary">
                      {(formData.amount / option.value / 30).toFixed(0)}K/jour
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Estimate */}
            <Card className="bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Mensualité estimée</p>
                  <p className="text-3xl font-bold text-text-primary">
                    {calculateMonthlyPayment().toLocaleString()} CDF
                  </p>
                  <p className="text-sm text-text-secondary">
                    Taux {interestRatePreview}%/mois (indicatif) • Total: {(calculateMonthlyPayment() * formData.duration).toLocaleString()} CDF
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-primary/20" />
              </div>
            </Card>
          </div>
        );

      case 'purpose':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-text-primary">
                Motif du crédit
              </h2>
              <p className="text-text-secondary mt-2">
                Pour quoi allez-vous utiliser cet argent ?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(purposes[user?.type === 'entrepreneur' ? 'entrepreneur' : 'particulier'] as typeof purposes.particulier).map((purpose) => (
                <button
                  key={purpose.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, purpose: purpose.value })}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    formData.purpose === purpose.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className={`w-6 h-6 mb-2 ${
                    formData.purpose === purpose.value ? 'text-primary' : 'text-text-secondary'
                  }`} />
                  <p className="font-medium text-text-primary">{purpose.label}</p>
                </button>
              ))}
            </div>

            {formData.purpose === 'autre' && (
              <div className="animate-fade-in">
                <Input
                  label="Précisez le motif"
                  placeholder="Décrivez votre besoin..."
                  value={formData.purposeOther}
                  onChange={(e) => setFormData({ ...formData, purposeOther: e.target.value })}
                />
              </div>
            )}
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-text-primary">
                Vérifiez votre demande
              </h2>
              <p className="text-text-secondary mt-2">
                Vérifiez les informations avant de soumettre
              </p>
            </div>

            <Card>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-text-secondary">Montant demandé</span>
                  <span className="font-semibold text-text-primary">
                    {formData.amount.toLocaleString()} CDF
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-text-secondary">Durée</span>
                  <span className="font-semibold text-text-primary">
                    {formData.duration} mois
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-text-secondary">Mensualité</span>
                  <span className="font-semibold text-text-primary">
                    {calculateMonthlyPayment().toLocaleString()} CDF
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-text-secondary">Taux d'intérêt</span>
                  <span className="font-semibold text-text-primary">{interestRatePreview}%/mois</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-text-secondary">Total à rembourser</span>
                  <span className="font-bold text-primary text-lg">
                    {(calculateMonthlyPayment() * formData.duration).toLocaleString()} CDF
                  </span>
                </div>
              </div>
            </Card>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 text-primary rounded border-gray-300" 
              />
              <span className="text-sm text-text-secondary">
                J'accepte les conditions générales de prêt et m'engage à rembourser selon les échéances prévues
              </span>
            </label>

            {/* Signature/PIN Input */}
            <div>
              <label className="label">Entrez votre code PIN pour signer</label>
              <div className="flex space-x-2">
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    type="password"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const newPin = [...pin];
                      newPin[index] = e.target.value;
                      setPin(newPin);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !digit && index > 0) {
                        const newPin = [...pin];
                        newPin[index - 1] = '';
                        setPin(newPin);
                      }
                    }}
                    className="w-14 h-14 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="•"
                  />
                ))}
              </div>
              {!isReviewValid && pin.join('').length > 0 && pin.join('').length < 4 && (
                <p className="mt-1 text-sm text-danger">Le PIN doit contenir 4 chiffres</p>
              )}
            </div>
          </div>
        );

      case 'result':
        const approved = submitResult?.approved;
        const rejected = submitResult?.ok === true && approved === false;
        return (
          <div className="text-center py-8">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              approved ? 'bg-success/20' : rejected ? 'bg-danger/20' : 'bg-primary/10'
            }`}>
              <CheckCircle className={`w-10 h-10 ${approved ? 'text-success' : rejected ? 'text-danger' : 'text-primary'}`} />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              {approved ? 'Crédit accordé' : rejected ? 'Demande refusée' : 'Demande envoyée'}
            </h2>
            <p className="text-text-secondary mb-6">
              {submitResult?.message || 'Votre demande a été traitée.'}
              {approved && ' Consultez votre tableau de bord pour voir le crédit en cours.'}
            </p>
            <Card className="bg-surface-secondary mb-6">
              <div className="text-center py-4">
                <p className="text-sm text-text-secondary mb-1">Montant demandé</p>
                <p className="text-2xl font-bold text-text-primary">
                  {formData.amount.toLocaleString()} CDF
                </p>
                <p className="text-sm text-text-secondary mt-2">
                  Durée : {formData.duration} mois
                </p>
              </div>
            </Card>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/dashboard', { state: { refreshCredits: true }, replace: true })}>
                Retour au tableau de bord
              </Button>
              <Button variant="secondary" onClick={() => setCurrentStep('amount')}>
                Nouvelle demande
              </Button>
            </div>
          </div>
        );
    }
  };

  const stepLabels = ['Montant', 'Motif', 'Vérification', 'Résultat'];

  return (
    <div className="min-h-screen pt-20 pb-16" style={{ background: 'linear-gradient(180deg, #fffbeb 0%, #ffffff 30%, #fefce8 100%)' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {stepLabels.map((label, index) => {
              const stepOrder: Step[] = ['amount', 'purpose', 'review', 'result'];
              const stepIndex = stepOrder.indexOf(currentStep);
              const isActive = index === stepIndex;
              const isCompleted = index < stepIndex;

              return (
                <React.Fragment key={label}>
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
                      {label}
                    </span>
                  </div>
                  {index < stepLabels.length - 1 && (
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
        <Card>
          {renderStep()}

          {/* Navigation Buttons */}
          {currentStep !== 'result' && (
            <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-100">
              {currentStep !== 'amount' && currentStep !== 'purpose' && (
                <Button variant="secondary" onClick={() => {
                  const stepOrder: Step[] = ['amount', 'purpose', 'review', 'result'];
                  const currentIndex = stepOrder.indexOf(currentStep);
                  setCurrentStep(stepOrder[currentIndex - 1]);
                }} fullWidth>
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Retour
                </Button>
              )}
              {currentStep === 'purpose' ? (
                <Button onClick={() => setCurrentStep('review')} fullWidth disabled={!isPurposeValid}>
                  Suivant
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              ) : currentStep === 'review' ? (
                <div className="flex-1 space-y-2">
                  {submitError && (
                    <p className="text-danger text-sm">{submitError}</p>
                  )}
                  <Button onClick={handleSubmit} fullWidth disabled={!isReviewValid || submitLoading}>
                    {submitLoading ? 'Envoi...' : 'Soumettre ma demande'}
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setCurrentStep('purpose')} fullWidth disabled={!isAmountValid}>
                  Suivant
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
