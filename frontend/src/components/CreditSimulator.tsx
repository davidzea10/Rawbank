import { useState, useEffect, useCallback } from 'react';
import { Calculator, TrendingUp, Calendar, Banknote, Info } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { api } from '../config/api';

type SimResult = {
  capital: number;
  tauxBase: number;
  reductionFidelite: number;
  tauxFinal: number;
  dureeMois: number;
  mensualite: number;
  totalArembourser: number;
  interets: number;
};

type Props = {
  userId: string | undefined;
  creditLimit: number;
  onRequestCredit?: () => void;
};

const DURATION_OPTIONS = [
  { value: 1, label: '1 mois' },
  { value: 3, label: '3 mois' },
  { value: 6, label: '6 mois' },
];

export function CreditSimulator({ userId, creditLimit, onRequestCredit }: Props) {
  const [amount, setAmount] = useState(50000);
  const [duration, setDuration] = useState(3);
  const [result, setResult] = useState<SimResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxAmount = Math.min(creditLimit || 300000, 300000);
  const minAmount = 10000;

  const fetchSimulate = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(api.users.creditSimulate(userId, amount, duration));
      const data = await res.json();
      if (data.ok) {
        setResult({
          capital: data.capital,
          tauxBase: data.tauxBase,
          reductionFidelite: data.reductionFidelite,
          tauxFinal: data.tauxFinal,
          dureeMois: data.dureeMois,
          mensualite: data.mensualite,
          totalArembourser: data.totalArembourser,
          interets: data.interets,
        });
      } else {
        setError(data.message || 'Simulation indisponible');
        setResult(null);
      }
    } catch {
      setError('Erreur de connexion');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [userId, amount, duration]);

  useEffect(() => {
    if (userId && amount >= minAmount && amount <= maxAmount) {
      fetchSimulate();
    } else {
      setResult(null);
    }
  }, [userId, amount, duration, maxAmount, fetchSimulate]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value) || 0;
    setAmount(Math.max(minAmount, Math.min(v, maxAmount)));
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-cardHover">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Calculator className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-text-primary">Simulateur de crédit</h2>
          <p className="text-sm text-text-secondary">
            Estimez vos mensualités avant de demander
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Montant */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Capital à emprunter (CDF)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={minAmount}
              max={maxAmount}
              step={5000}
              value={amount}
              onChange={handleAmountChange}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              min={minAmount}
              max={maxAmount}
              step={5000}
              className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-text-primary"
            />
          </div>
          <p className="text-xs text-text-secondary mt-1">
            {minAmount.toLocaleString()} – {maxAmount.toLocaleString()} CDF
          </p>
        </div>

        {/* Durée */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Durée
          </label>
          <div className="flex gap-2">
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDuration(opt.value)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                  duration === opt.value
                    ? 'bg-primary text-white shadow-md shadow-primary/25'
                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Résultats animés */}
        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-600 py-4">{error}</p>
        ) : result ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 animate-fade-in">
              <p className="text-xs text-text-secondary flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5" />
                Capital
              </p>
              <p className="text-lg font-bold text-text-primary mt-1">
                {result.capital.toLocaleString()} CDF
              </p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/10 animate-fade-in" style={{ animationDelay: '50ms' }}>
              <p className="text-xs text-text-secondary flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Taux appliqué
              </p>
              <p className="text-lg font-bold text-text-primary mt-1">
                {result.tauxFinal} %/mois
                {result.reductionFidelite > 0 && (
                  <span className="text-green-600 text-sm ml-1">
                    (-{result.reductionFidelite} % fidélité)
                  </span>
                )}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <p className="text-xs text-text-secondary flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Mensualité
              </p>
              <p className="text-lg font-bold text-text-primary mt-1">
                {result.mensualite.toLocaleString()} CDF
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 animate-fade-in" style={{ animationDelay: '150ms' }}>
              <p className="text-xs text-text-secondary">Total à rembourser</p>
              <p className="text-lg font-bold text-text-primary mt-1">
                {result.totalArembourser.toLocaleString()} CDF
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Explications */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-start gap-2 text-sm text-text-secondary">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p>
              <strong>Capital</strong> : montant que RawBank vous verse. <strong>Total à rembourser</strong> : capital + intérêts (calculés sur le capital à chaque mois).
            </p>
            <p>
              <strong>Taux</strong> : 3 % (score ≥ 900), 3,5 % (≥ 800), 4 % (≥ 700). Réduction jusqu’à -1 % si vous remboursez vos crédits à temps.
            </p>
            <p>
              <strong>Pénalités retard</strong> : &lt; 7 j = +1 %, 7–30 j = +2 % + 5 000 CDF, &gt; 30 j = +3 % + 10 000 CDF.
            </p>
          </div>
        </div>
      </div>

      {onRequestCredit && (
        <Button
          className="w-full mt-4"
          onClick={onRequestCredit}
        >
          Demander ce crédit
        </Button>
      )}
    </Card>
  );
}
