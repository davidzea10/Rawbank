import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  CreditCard,
  BookOpen,
  DollarSign,
  Clock,
  CheckCircle,
  Sparkles,
  X,
  TrendingUp,
  Banknote,
  Calendar,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardHeader } from '../components/Card';
import { Badge } from '../components/Badge';
import { ScoreGauge } from '../components/ScoreGauge';
import { useUser } from '../context/UserContext';
import { api } from '../config/api';
import { CreditSimulator } from '../components/CreditSimulator';

type Credit = {
  id: string;
  score?: number | null;
  amount: number;
  monthlyPayment: number;
  totalPayments: number;
  remainingDue: number;
  remainingPayments: number;
  totalArembourser?: number; // Capital + intérêts (somme des mensualités)
  tauxInteret?: number;
  dateDebut: string;
  dateFin: string;
  statut: string;
};

export function DashboardParticulier() {
  const { user, updateUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [creditsLoading, setCreditsLoading] = useState(false);

  const fetchCredits = useCallback(() => {
    if (!user?.id) {
      console.warn('[Crédits] user.id manquant');
      return;
    }
    const url = api.users.credits(user.id);
    setCreditsLoading(true);
    fetch(url)
      .then((r) => {
        if (!r.ok) console.warn('[Crédits] API erreur', r.status, url);
        return r.json();
      })
      .then((data) => {
        if (data.ok && data.credits) {
          setCredits(data.credits);
        } else {
          console.warn('[Crédits] Réponse', data);
          setCredits([]);
        }
      })
      .catch((e) => {
        console.warn('[Crédits] Erreur fetch', e);
        setCredits([]);
      })
      .finally(() => setCreditsLoading(false));
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || user.score != null) return;
    fetch(api.users.score(user.id))
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.score != null) {
          updateUser({ score: data.score, creditLimit: data.creditLimit });
        }
      })
      .catch(() => {});
  }, [user?.id, user?.score, updateUser]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits, location.pathname, (location.state as { refreshCredits?: boolean })?.refreshCredits]);

  const eligibilityLabel =
    user?.score != null
      ? user.score >= 700
        ? 'Éligible automatique'
        : user.score >= 500
        ? 'Validation manuelle'
        : 'Non éligible'
      : null;

  const eligibilityVariant =
    user?.score != null
      ? user.score >= 700
        ? 'success'
        : user.score >= 500
        ? 'info'
        : 'danger'
      : 'info';

  return (
    <div className="min-h-screen pt-20 pb-16" style={{ background: 'linear-gradient(180deg, #fffbeb 0%, #ffffff 30%, #fefce8 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header - Bandeau distinct */}
        <div className="mb-10 p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, #EAB30808 0%, #FACC1508 100%)', border: '1px solid rgba(234,179,8,0.12)' }}>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary tracking-tight">
            Bienvenue, {user?.firstName || 'Utilisateur'} 👋
          </h1>
          <p className="text-text-secondary mt-2 text-base">
            Voici un aperçu de votre situation financière
          </p>
        </div>

        {/* CTA Principal : Obtenir mon crédit */}
        <Card className="mb-8 overflow-hidden" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 50%, #fef9c3 100%)', borderLeft: '4px solid #EAB308', boxShadow: '0 4px 20px rgba(234,179,8,0.1)' }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-primary">Obtenir mon crédit</h2>
                <p className="text-text-secondary mt-1">
                  {user?.creditLimit != null ? (
                    <>Plafond jusqu'à {user.creditLimit.toLocaleString()} CDF selon votre score</>
                  ) : (
                    <>Votre plafond sera calculé après analyse de votre profil</>
                  )}
                </p>
                {eligibilityLabel && (
                  <Badge variant={eligibilityVariant} className="mt-2">
                    {eligibilityLabel}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              size="lg"
              onClick={() => setShowCreditModal(true)}
              className="shrink-0"
            >
              Obtenir mon crédit
            </Button>
          </div>
        </Card>

        {/* Top Stats */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Score Card */}
          <Card className="lg:col-span-1 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" style={{ borderTop: '3px solid #0D9488' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text-primary text-base">Score de crédit</h2>
              <Link to="/settings" className="text-sm text-primary hover:underline font-medium">
                Voir détails
              </Link>
            </div>
            <div className="flex justify-center mb-4">
              {user?.score != null ? (
                <ScoreGauge score={user.score} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-text-secondary text-sm">Non calculé</p>
                  <p className="text-xs text-text-secondary mt-1">Calculé après analyse</p>
                </div>
              )}
            </div>
          </Card>

          {/* Credit Available */}
          <Card className="lg:col-span-1 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" style={{ borderTop: '3px solid #EAB308' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text-primary">Crédit disponible</h2>
              <Button size="sm" onClick={() => setShowCreditModal(true)}>
                Obtenir
              </Button>
            </div>
            <div className="text-center py-4">
              <p className="text-sm text-text-secondary mb-1">Plafond maximal</p>
              <p className="text-4xl font-bold text-text-primary">
                {user?.creditLimit != null
                  ? `${user.creditLimit.toLocaleString()} CDF`
                  : '—'}
              </p>
              <p className="text-sm text-text-secondary mt-2">
                {user?.creditLimit != null
                  ? 'Proportionnel à votre score (0–1000)'
                  : 'Déterminé après scoring'}
              </p>
            </div>
          </Card>

          {/* Alerts */}
          <Card className="lg:col-span-1 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" style={{ borderTop: '3px solid #FFB81C' }}>
            <CardHeader title="Alertes" subtitle="Informations importantes" />
            <div className="text-center py-6">
              <p className="text-text-secondary text-sm">Aucune alerte</p>
            </div>
          </Card>
        </div>

        {/* Crédits en cours */}
        <Card className="mb-8" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Crédits en cours
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchCredits()}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 transition-colors disabled:opacity-50"
                disabled={creditsLoading}
              >
                <RefreshCw className={`w-4 h-4 ${creditsLoading ? 'animate-spin' : ''}`} />
                {creditsLoading ? 'Chargement...' : 'Actualiser'}
              </button>
              <Link
                to="/repayment"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                Voir tout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          {creditsLoading && credits.length === 0 ? (
            <div className="py-12 text-center">
              <RefreshCw className="w-10 h-10 mx-auto mb-4 text-primary animate-spin" />
              <p className="text-text-secondary font-medium">Chargement des crédits...</p>
            </div>
          ) : credits.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-text-secondary/60" />
              </div>
              <p className="text-text-secondary font-medium">Aucun crédit pour le moment</p>
              <p className="text-sm text-text-secondary mt-1">
                Vos crédits apparaîtront ici une fois accordés
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {credits.map((credit) => {
                const payees = credit.totalPayments - credit.remainingPayments;
                const progress = credit.totalPayments > 0 ? (payees / credit.totalPayments) * 100 : 0;
                return (
                  <div
                    key={credit.id}
                    className="group p-5 rounded-2xl border border-gray-100 bg-gradient-to-r from-white to-gray-50/50 hover:border-primary/20 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <TrendingUp className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-text-secondary uppercase">Score</p>
                            <p className="font-bold text-text-primary">
                              {credit.score != null ? `${credit.score}/1000` : '—'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                            <Banknote className="w-5 h-5 text-secondary" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-text-secondary uppercase">Capital</p>
                            <p className="font-bold text-text-primary">
                              {credit.amount.toLocaleString()} CDF
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5 text-accent-dark" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-text-secondary uppercase">Mensualité</p>
                            <p className="font-bold text-text-primary">
                              {credit.monthlyPayment.toLocaleString()} CDF
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                            <DollarSign className="w-5 h-5 text-text-secondary" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-text-secondary uppercase">Restant dû</p>
                            <p className="font-bold text-primary">
                              {credit.remainingDue.toLocaleString()} CDF
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:w-auto">
                        <div className="flex-1 w-full sm:w-48">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-text-secondary">Progression</span>
                            <span className="font-semibold text-text-primary">
                              {payees}/{credit.totalPayments} payées
                            </span>
                          </div>
                          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={credit.statut === 'active' ? 'info' : 'default'} className="shrink-0">
                            {credit.statut === 'active' ? 'En cours' : credit.statut}
                          </Badge>
                          <Link
                            to="/repayment"
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark shadow-md shadow-primary/20 transition-all group-hover:shadow-lg"
                          >
                            Rembourser
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
                      <span className="text-text-secondary">
                        Total à rembourser : <strong className="text-text-primary">{(credit.totalArembourser ?? credit.amount).toLocaleString()} CDF</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Simulateur & Actions */}
        <div className="grid lg:grid-cols-2 gap-6">
          <CreditSimulator
            userId={user?.id}
            creditLimit={user?.creditLimit ?? 300000}
            onRequestCredit={() => setShowCreditModal(true)}
          />

          <Card>
            <h2 className="font-semibold text-text-primary mb-5">Actions rapides</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowCreditModal(true)}
                className="p-5 bg-primary/5 rounded-xl text-center hover:bg-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer border border-transparent hover:border-primary/20"
              >
                <DollarSign className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium text-text-primary">Obtenir un crédit</p>
              </button>
              <Link to="/repayment">
                <div className="p-4 bg-secondary/5 rounded-xl text-center hover:bg-secondary/10 transition-colors cursor-pointer">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-secondary" />
                  <p className="text-sm font-medium text-text-primary">Rembourser</p>
                </div>
              </Link>
              <Link to="/settings">
                <div className="p-4 bg-accent/5 rounded-xl text-center hover:bg-accent/10 transition-colors cursor-pointer">
                  <CreditCard className="w-6 h-6 mx-auto mb-2 text-accent-dark" />
                  <p className="text-sm font-medium text-text-primary">Paramètres</p>
                </div>
              </Link>
              <Link to="/support">
                <div className="p-4 bg-gray-100 rounded-xl text-center hover:bg-gray-200 transition-colors cursor-pointer">
                  <CheckCircle className="w-6 h-6 mx-auto mb-2 text-text-secondary" />
                  <p className="text-sm font-medium text-text-primary">Support</p>
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Fenêtre Obtenir mon crédit - Mobile Money en premier */}
      {showCreditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full relative shadow-heavy">
            <button
              onClick={() => setShowCreditModal(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="pt-2 pb-6">
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Obtenir mon crédit
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                Recevez votre crédit via <strong>Mobile Money</strong> (Orange Money, M-Pesa, Airtel Money). Virement direct sur votre compte.
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setShowCreditModal(false)} fullWidth>
                  Fermer
                </Button>
                <Button
                  onClick={() => {
                    setShowCreditModal(false);
                    navigate('/credit/new');
                  }}
                  fullWidth
                >
                  Demander via Mobile Money
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
