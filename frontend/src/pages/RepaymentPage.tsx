import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Calendar,
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Smartphone,
  X
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Input } from '../components/Input';
import { useUser } from '../context/UserContext';
import { api } from '../config/api';

type Credit = {
  id: string;
  amount: number;
  monthlyPayment: number;
  remainingPayments: number;
  totalPayments: number;
  nextDueDate: string;
  statut: string;
  remainingDue: number;
};

type PaymentRecord = { id: number; date: string; amount: number; method: string; status: string };

export function RepaymentPage() {
  const { user, updateUser } = useUser();
  const [activeCredits, setActiveCredits] = useState<Credit[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [repayModal, setRepayModal] = useState<{ credit: Credit } | null>(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [repayStep, setRepayStep] = useState<'amount' | 'sent' | 'confirm'>('amount');
  const [repayLoading, setRepayLoading] = useState(false);

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

  useEffect(() => {
    if (!user?.id) return;
    fetch(api.users.credits(user.id))
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.credits) {
          setActiveCredits(data.credits);
        }
      })
      .catch(() => {});
  }, [user?.id]);

  const totalDue = activeCredits.reduce((s, c) => s + c.remainingDue, 0);
  const totalOverdue = 0;
  const upcomingPayments = activeCredits
    .filter((c) => c.remainingDue > 0)
    .map((c) => ({
      id: c.id,
      creditId: c.id,
      amount: c.monthlyPayment,
      dueDate: c.nextDueDate || new Date().toISOString().slice(0, 10),
      daysUntil: 0,
    }));

  const openRepayModal = (credit: Credit) => {
    setRepayModal({ credit });
    setRepayAmount(String(credit.monthlyPayment));
    setRepayStep('amount');
  };

  const closeRepayModal = () => {
    setRepayModal(null);
    setRepayAmount('');
    setRepayStep('amount');
  };

  const amountNum = parseInt(repayAmount) || 0;
  const maxRepay = repayModal?.credit.remainingDue ?? 0;
  const isAmountValid = amountNum > 0 && amountNum <= maxRepay;

  const handleSendCollect = () => {
    if (!isAmountValid || !repayModal) return;
    setRepayLoading(true);
    setTimeout(() => {
      setRepayLoading(false);
      setRepayStep('sent');
    }, 1200);
  };

  const handleConfirmAccepted = () => {
    if (!repayModal) return;
    setRepayLoading(true);
    setTimeout(() => {
      const credit = repayModal.credit;
      const paid = amountNum;
      setPaymentHistory((prev) => [
        ...prev,
        {
          id: Date.now(),
          date: new Date().toLocaleDateString('fr-FR'),
          amount: paid,
          method: 'Mobile Money (simulé)',
          status: 'Confirmé',
        },
      ]);
      setActiveCredits((prev) =>
        prev.map((c) => {
          if (c.id !== credit.id) return c;
          const newRemaining = c.remainingDue - paid;
          const newPayments = newRemaining <= 0 ? 0 : Math.ceil(newRemaining / c.monthlyPayment);
          return {
            ...c,
            remainingDue: Math.max(0, newRemaining),
            remainingPayments: newPayments,
            statut: newRemaining <= 0 ? 'completed' : c.statut,
          };
        })
      );
      setRepayLoading(false);
      closeRepayModal();
    }, 800);
  };

  const activeCreditsFiltered = activeCredits.filter((c) => c.remainingDue > 0);

  return (
    <div className="min-h-screen pt-20 pb-16" style={{ background: 'linear-gradient(180deg, #fffbeb 0%, #ffffff 30%, #fefce8 100%)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, #EAB30808 0%, #FACC1508 100%)', border: '1px solid rgba(234,179,8,0.12)' }}>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary tracking-tight">
            Remboursements
          </h1>
          <p className="text-text-secondary mt-2 text-base">
            Gérez vos échéances et suivez vos remboursements
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-5 mb-8">
          <Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" style={{ borderTop: '3px solid #EAB308' }}>
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Crédit disponible</p>
                <p className="text-xl font-bold text-text-primary">
                  {user?.creditLimit != null
                    ? `${user.creditLimit.toLocaleString()} CDF`
                    : '—'}
                </p>
                <p className="text-xs text-text-secondary">Plafond selon score</p>
              </div>
            </div>
          </Card>

          <Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" style={{ borderTop: '3px solid #0D9488' }}>
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Montant dû</p>
                <p className="text-xl font-bold text-text-primary">
                  {totalDue.toLocaleString()} CDF
                </p>
              </div>
            </div>
          </Card>

          <Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" style={{ borderTop: '3px solid #718096' }}>
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-text-secondary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Prochaine échéance</p>
                <p className="text-xl font-bold text-text-primary">
                  {upcomingPayments[0]?.dueDate ?? '—'}
                </p>
              </div>
            </div>
          </Card>

          <Card className={totalOverdue > 0 ? 'bg-danger/5' : ''} style={{ borderTop: '3px solid ' + (totalOverdue > 0 ? '#E53E3E' : '#0D9488') }}>
            <div className="flex items-center space-x-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  totalOverdue > 0 ? 'bg-danger/10' : 'bg-gray-100'
                }`}
              >
                {totalOverdue > 0 ? (
                  <AlertTriangle className="w-6 h-6 text-danger" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-success" />
                )}
              </div>
              <div>
                <p className="text-sm text-text-secondary">Retard</p>
                <p
                  className={`text-xl font-bold ${
                    totalOverdue > 0 ? 'text-danger' : 'text-success'
                  }`}
                >
                  {totalOverdue > 0 ? `${totalOverdue.toLocaleString()} CDF` : 'Aucun'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Active Credits */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-primary">Crédits en cours</h2>
            <Badge variant="info">{activeCreditsFiltered.length} actif(s)</Badge>
          </div>

          {activeCreditsFiltered.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-text-secondary/60" />
              </div>
              <p className="text-text-secondary font-medium">Aucun crédit en cours</p>
              <p className="text-sm text-text-secondary mt-1">Demandez un crédit depuis le tableau de bord</p>
            </div>
          ) : (
            activeCreditsFiltered.map((credit) => (
              <div
                key={credit.id}
                className="border border-gray-100 rounded-2xl p-6 mb-5 last:mb-0 hover:border-primary/10 transition-colors bg-gray-50/30"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      Crédit - {credit.amount.toLocaleString()} CDF
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {credit.remainingPayments}/{credit.totalPayments} échéances restantes
                    </p>
                  </div>
                  <Badge variant="success">{credit.statut === 'active' ? 'En cours' : credit.statut}</Badge>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">Progression</span>
                    <span className="font-medium text-text-primary">
                      {Math.round(
                        (1 - credit.remainingPayments / credit.totalPayments) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary rounded-full transition-all"
                      style={{
                        width: `${(1 - credit.remainingPayments / credit.totalPayments) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-text-secondary">Mensualité</p>
                    <p className="font-semibold text-text-primary">
                      {credit.monthlyPayment.toLocaleString()} CDF
                    </p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Prochaine date</p>
                    <p className="font-semibold text-text-primary">{credit.nextDueDate}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Restant dû</p>
                    <p className="font-semibold text-text-primary">
                      {credit.remainingDue.toLocaleString()} CDF
                    </p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Échéances</p>
                    <p className="font-semibold text-text-primary">
                      {credit.remainingPayments} sur {credit.totalPayments}
                    </p>
                  </div>
                </div>

                <Button onClick={() => openRepayModal(credit)} fullWidth>
                  <CreditCard className="mr-2 w-4 h-4" />
                  Rembourser maintenant
                </Button>
              </div>
            ))
          )}
        </Card>

        {/* Upcoming Payments Alert */}
        {upcomingPayments.length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-accent/5 to-accent/10 border-accent/20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-accent-dark" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary">
                  Échéance - {upcomingPayments[0].amount.toLocaleString()} CDF
                </h3>
                <p className="text-sm text-text-secondary">
                  Due le {upcomingPayments[0].dueDate}
                </p>
              </div>
              <Button onClick={() => activeCreditsFiltered[0] && openRepayModal(activeCreditsFiltered[0])}>
                Payer maintenant
              </Button>
            </div>
          </Card>
        )}

        {/* Payment History */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-primary">
              Historique des paiements
            </h2>
          </div>

          <div className="overflow-x-auto -mx-1">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider border-b-2 border-gray-100">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Montant</th>
                  <th className="pb-3 font-medium">Méthode</th>
                  <th className="pb-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paymentHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-100 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-text-secondary/60" />
                      </div>
                      <p className="text-text-secondary text-sm">Aucun paiement enregistré</p>
                    </td>
                  </tr>
                ) : (
                  paymentHistory.map((payment) => (
                    <tr key={payment.id} className="text-sm hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 text-text-primary">{payment.date}</td>
                      <td className="py-3 font-medium text-text-primary">
                        {payment.amount.toLocaleString()} CDF
                      </td>
                      <td className="py-3 text-text-secondary">{payment.method}</td>
                      <td className="py-3">
                        <Badge variant="success">{payment.status}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Obtenir un crédit */}
        <Card className="mt-8 bg-gradient-to-br from-primary/5 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Obtenir un crédit</h3>
                <p className="text-sm text-text-secondary">
                  Retournez au tableau de bord pour faire une demande
                </p>
              </div>
            </div>
            <Link to="/dashboard">
              <Button variant="secondary">Tableau de bord</Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Modal Remboursement - Flux Mobile Money simulé */}
      {repayModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full relative shadow-heavy">
            <button
              onClick={closeRepayModal}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </button>

            {repayStep === 'amount' && (
              <>
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Rembourser via Mobile Money
                </h3>
                <p className="text-sm text-text-secondary mb-2">
                  Restant dû : <strong>{repayModal.credit.remainingDue.toLocaleString()} CDF</strong>
                </p>
                <Input
                  label="Montant à rembourser"
                  type="number"
                  placeholder="Ex: 55000"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  error={
                    amountNum > maxRepay
                      ? `Le montant ne peut pas dépasser ${maxRepay.toLocaleString()} CDF`
                      : amountNum <= 0 && repayAmount !== ''
                      ? 'Montant invalide'
                      : undefined
                  }
                  helperText={`Entre 1 et ${maxRepay.toLocaleString()} CDF`}
                />
                <div className="mt-6 flex gap-3">
                  <Button variant="secondary" onClick={closeRepayModal} fullWidth>
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSendCollect}
                    fullWidth
                    disabled={!isAmountValid || repayLoading}
                  >
                    {repayLoading ? 'Envoi...' : 'Lancer le paiement'}
                  </Button>
                </div>
              </>
            )}

            {repayStep === 'sent' && (
              <>
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Demande de collecte envoyée
                  </h3>
                  <p className="text-sm text-text-secondary mb-4">
                    Une notification a été envoyée à votre Mobile Money. Acceptez le paiement de{' '}
                    <strong>{amountNum.toLocaleString()} CDF</strong> sur votre téléphone.
                  </p>
                  <p className="text-xs text-text-secondary mb-6">
                    (Simulation — API Mobile Money à intégrer)
                  </p>
                  <Button onClick={handleConfirmAccepted} fullWidth disabled={repayLoading}>
                    {repayLoading ? 'Traitement...' : "J'ai accepté sur mon téléphone"}
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
