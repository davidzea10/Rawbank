import { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Smartphone,
  RefreshCw,
  Loader2,
  CreditCard,
} from 'lucide-react';
import { Card, CardHeader } from '../components/Card';
import { useUser } from '../context/UserContext';
import { api } from '../config/api';

interface Transaction {
  id: string;
  type_transaction: 'entree' | 'sortie';
  montant: number;
  date: string;
  libelle?: string;
  contrepartie?: string;
}

interface Recharge {
  id: string;
  montant: number;
  date_recharge: string;
  operateur: string;
  numero_telephone: string;
}

interface Compte {
  id: string;
  operateur: string;
  numero_compte: string;
  est_principal: boolean;
  est_verifie: boolean;
}

interface DonneesOperateur {
  numero_telephone?: string;
  avg_transaction_amount?: number;
  avg_balance?: number;
  transaction_regularity?: number;
  recharge_frequency?: number;
  fee_ratio?: number;
  total_calls?: number;
  total_data_mb?: number;
  total_sms?: number;
  phone_activity_score?: number;
  [key: string]: unknown;
}

export function MobileMoneyPage() {
  const { user } = useUser();
  const [data, setData] = useState<{
    solde: number;
    stats: Record<string, unknown>;
    comptes: Compte[];
    transactions: Transaction[];
    recharges: Recharge[];
    donnees_operateur: DonneesOperateur | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    const userId = user?.id;
    if (!userId) {
      setError('Utilisateur non connecté');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let json: Record<string, unknown> = {};
      let res = await fetch(api.mobileMoney.all(userId));

      if (res.status === 404) {
        res = await fetch(api.operateurs.donneesByUser(userId));
        const opJson = await res.json();
        if (res.ok && opJson.donnees_operateur) {
          const op = opJson.donnees_operateur as DonneesOperateur;
          json = {
            solde: op.avg_balance ?? 0,
            stats: {},
            comptes: [],
            transactions: [],
            recharges: [],
            donnees_operateur: op,
          };
        }
      } else {
        json = await res.json();
      }

      if (!res.ok) {
        throw new Error((json as { message?: string }).message || 'Erreur lors du chargement');
      }

      const j = json as {
        solde?: number;
        stats?: Record<string, unknown>;
        comptes?: Compte[];
        transactions?: Transaction[];
        recharges?: Recharge[];
        donnees_operateur?: DonneesOperateur | null;
      };

      const solde = j.solde ?? j.donnees_operateur?.avg_balance ?? 0;

      setData({
        solde,
        stats: j.stats ?? {},
        comptes: j.comptes ?? [],
        transactions: j.transactions ?? [],
        recharges: j.recharges ?? [],
        donnees_operateur: j.donnees_operateur ?? null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pt-20 pb-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-text-secondary">Chargement des données Mobile Money...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl p-6 text-center">
            <p className="font-medium">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 flex items-center gap-2 mx-auto text-sm font-medium hover:underline"
            >
              <RefreshCw className="w-4 h-4" /> Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = (data?.stats ?? {}) as Record<string, number | string | null>;
  const comptes = data?.comptes ?? [];
  const transactions = data?.transactions ?? [];
  const recharges = data?.recharges ?? [];
  const donneesOperateur = data?.donnees_operateur ?? null;
  const solde = data?.solde ?? donneesOperateur?.avg_balance ?? 0;

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return d;
    }
  };

  const formatMontant = (m: number) =>
    new Intl.NumberFormat('fr-FR').format(m) + ' CDF';

  return (
    <div className="min-h-screen pt-20 pb-16" style={{ background: 'linear-gradient(180deg, #fffbeb 0%, #ffffff 30%, #fefce8 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, #EAB30808 0%, #FACC1508 100%)', border: '1px solid rgba(234,179,8,0.12)' }}>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary tracking-tight flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              Mobile Money & Recharges
            </h1>
            <p className="text-text-secondary mt-2 text-base">
              Solde, transactions et historique des recharges
            </p>
          </div>
          <button
            onClick={fetchData}
            className="p-3 rounded-xl bg-white border border-gray-100 hover:border-primary/20 hover:shadow-card transition-all"
            title="Actualiser"
          >
            <RefreshCw className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Données opérateur (table donnees_operateurs) */}
        {donneesOperateur && (
          <Card className="mb-8">
            <CardHeader
              title="Données opérateur"
              subtitle="Informations issues de la base opérateurs (donnees_operateurs)"
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/10 transition-colors">
                <p className="text-xs text-text-secondary">Revenu moyen transactions</p>
                <p className="font-semibold text-text-primary">
                  {formatMontant(donneesOperateur.avg_transaction_amount ?? 0)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/10 transition-colors">
                <p className="text-xs text-text-secondary">Solde moyen</p>
                <p className="font-semibold text-text-primary">
                  {formatMontant(donneesOperateur.avg_balance ?? 0)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/10 transition-colors">
                <p className="text-xs text-text-secondary">Régularité transactions</p>
                <p className="font-semibold text-text-primary">
                  {((donneesOperateur.transaction_regularity ?? 0) * 100).toFixed(2)}%
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/10 transition-colors">
                <p className="text-xs text-text-secondary">Fréquence recharges/mois</p>
                <p className="font-semibold text-text-primary">
                  {donneesOperateur.recharge_frequency ?? 0}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/10 transition-colors">
                <p className="text-xs text-text-secondary">Appels totaux</p>
                <p className="font-semibold text-text-primary">
                  {donneesOperateur.total_calls ?? 0}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/10 transition-colors">
                <p className="text-xs text-text-secondary">Données (MB)</p>
                <p className="font-semibold text-text-primary">
                  {donneesOperateur.total_data_mb ?? 0} MB
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/10 transition-colors">
                <p className="text-xs text-text-secondary">SMS</p>
                <p className="font-semibold text-text-primary">
                  {donneesOperateur.total_sms ?? 0}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/10 transition-colors">
                <p className="text-xs text-text-secondary">Score activité téléphone</p>
                <p className="font-semibold text-text-primary">
                  {((donneesOperateur.phone_activity_score ?? 0) * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Stats cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" style={{ borderTop: '3px solid #EAB308' }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Solde actuel</p>
                <p className="text-xl font-bold text-text-primary">
                  {formatMontant(solde)}
                </p>
              </div>
            </div>
          </Card>
          <Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" style={{ borderTop: '3px solid #0D9488' }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <ArrowDownLeft className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Transactions ce mois</p>
                <p className="text-xl font-bold text-text-primary">
                  {stats.transactions_ce_mois ?? 0}
                </p>
              </div>
            </div>
          </Card>
          <Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" style={{ borderTop: '3px solid #FFB81C' }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Recharges ce mois</p>
                <p className="text-xl font-bold text-text-primary">
                  {stats.recharges_ce_mois ?? 0}
                </p>
              </div>
            </div>
          </Card>
          <Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" style={{ borderTop: '3px solid #EAB308' }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Comptes liés</p>
                <p className="text-xl font-bold text-text-primary">
                  {comptes.length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Comptes Mobile Money */}
        {comptes.length > 0 && (
          <Card className="mb-8">
            <CardHeader title="Comptes Mobile Money" subtitle="Vos comptes connectés" />
            <div className="space-y-3">
              {comptes.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        c.operateur?.toLowerCase().includes('orange')
                          ? 'bg-orange-500'
                          : c.operateur?.toLowerCase().includes('airtel')
                          ? 'bg-red-500'
                          : 'bg-yellow-500'
                      }`}
                    >
                      {c.operateur?.[0] ?? 'M'}
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{c.operateur}</p>
                      <p className="text-sm text-text-secondary">{c.numero_compte}</p>
                    </div>
                    {c.est_principal && (
                      <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded">
                        Principal
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Transactions */}
          <Card>
            <CardHeader
              title="Dernières transactions"
              subtitle={`${transactions.length} transaction(s)`}
            />
            {transactions.length === 0 ? (
              <p className="text-text-secondary text-center py-8">
                Aucune transaction pour le moment
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {t.type_transaction === 'entree' ? (
                        <ArrowDownLeft className="w-5 h-5 text-secondary" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-danger" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {t.libelle || t.contrepartie || t.type_transaction}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {formatDate(t.date)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-semibold ${
                        t.type_transaction === 'entree'
                          ? 'text-secondary'
                          : 'text-danger'
                      }`}
                    >
                      {t.type_transaction === 'entree' ? '+' : '-'}
                      {formatMontant(t.montant)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recharges */}
          <Card>
            <CardHeader
              title="Historique des recharges"
              subtitle={`${recharges.length} recharge(s)`}
            />
            {recharges.length === 0 ? (
              <p className="text-text-secondary text-center py-8">
                Aucune recharge pour le moment
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recharges.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/5 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        Recharge {r.operateur} - {r.numero_telephone}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {formatDate(r.date_recharge)}
                      </p>
                    </div>
                    <span className="font-semibold text-text-primary">
                      {formatMontant(r.montant)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {!donneesOperateur && comptes.length === 0 && transactions.length === 0 && recharges.length === 0 && (
          <Card className="mt-8 text-center py-12">
            <Wallet className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Aucune donnée Mobile Money
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              Vos données opérateur ou transactions apparaîtront ici. Assurez-vous que votre numéro est dans la table donnees_operateurs.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
