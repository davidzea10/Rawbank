import { Link } from 'react-router-dom';
import { 
  Clock, 
  FileCheck, 
  Smartphone, 
  Brain, 
  Star, 
  ArrowRight,
  Shield,
  Wallet,
  Store
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export function LandingPage() {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-surface to-secondary/5 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-text-primary leading-tight text-balance">
                Crédit intelligent pour tous
              </h1>
              <p className="mt-6 text-lg text-text-secondary max-w-xl mx-auto lg:mx-0">
                Pas de compte bancaire ? Pas de problème. RawFinance Pro utilise la technologie 
                AI pour évaluer votre solvabilité et vous offrir des crédits adaptés à votre profil.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/signup">
                  <Button size="lg" fullWidth>
                    Ouvrir mon compte
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" size="lg" fullWidth>
                    Connexion
                  </Button>
                </Link>
              </div>
              <p className="mt-6 text-sm text-text-secondary">
                Appelé aussi <span className="font-medium">*123#</span> sur Mobile Money
              </p>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative w-full max-w-md mx-auto">
                <div className="bg-surface rounded-3xl shadow-heavy p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <p className="text-sm opacity-80">Crédit disponible</p>
                        <p className="text-3xl font-bold">250,000 CDF</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Wallet className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Score de crédit</span>
                        <span className="font-semibold">720/1000</span>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-secondary rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Selection */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary">Vous êtes ?</h2>
            <p className="mt-4 text-text-secondary">
              Choisissez le profil qui correspond à votre situation
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Link to="/signup?type=particulier">
              <Card hover className="h-full text-center py-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Particulier
                </h3>
                <p className="text-text-secondary">
                  Besoin personnel ? Crédito urgent, éducation, santé ou logement. 
                  Notre scoring alternatif évalue votre fiabilité basée sur vos données mobiles.
                </p>
              </Card>
            </Link>
            <Link to="/signup?type=entrepreneur">
              <Card hover className="h-full text-center py-8">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Store className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Entrepreneur
                </h3>
                <p className="text-text-secondary">
                  Besoin business ? Trésorerie, stock ou équipement. 
                  Analysez vos transactions commerciales pour obtenir un crédit adapté à votre activité.
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-16 lg:py-24 bg-surface-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary">
              Pourquoi choisir RawFinance Pro ?
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">Scoring intelligent</h3>
              <p className="text-sm text-text-secondary">
                Notre AI analyse vos données mobiles et sociales pour évaluer votre solvabilité
              </p>
            </Card>
            <Card className="text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">Approuvé en minutes</h3>
              <p className="text-sm text-text-secondary">
                Decisions de crédit rapides et automatiques. Fonds reçus en 2-5 minutes
              </p>
            </Card>
            <Card className="text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileCheck className="w-6 h-6 text-accent-dark" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">Pas de documents complexes</h3>
              <p className="text-sm text-text-secondary">
                Fini les paperwork interminables. Juste votre téléphone et quelques informations
              </p>
            </Card>
            <Card className="text-center">
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">Mobile Money accepté</h3>
              <p className="text-sm text-text-secondary">
                Orange Money, M-Pesa, Airtel Money. Tous les opérateurs sont les bienvenus
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary">
              Ce que disent nos clients
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <div className="flex items-center space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-text-secondary mb-4">
                "J'ai pu obtenir un crédit pour mon commerce en seulement 10 minutes. 
                Le processus était tellement simple!"
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-medium">MK</span>
                </div>
                <div>
                  <p className="font-medium text-text-primary">Marie K.</p>
                  <p className="text-sm text-text-secondary">Commerçante, Kinshasa</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-text-secondary mb-4">
                "Pas de compte bancaire ne m'a jamais empêché d'accéder à un crédit. 
                RawFinance a cru en moi quand personne d'autre ne l'a fait."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                  <span className="text-secondary font-medium">PD</span>
                </div>
                <div>
                  <p className="font-medium text-text-primary">Pierre D.</p>
                  <p className="text-sm text-text-secondary">Artisan, Lubumbashi</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-text-secondary mb-4">
                "L'éducation financière incluse m'a beaucoup aidée à mieux gérer 
                mes dépenses et à améliorer mon score de crédit."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <span className="text-accent-dark font-medium">AJ</span>
                </div>
                <div>
                  <p className="font-medium text-text-primary">Annie J.</p>
                  <p className="text-sm text-text-secondary">Micro-entrepreneure, Goma</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Prêt à transformer votre vie financière ?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Rejoignez plus de 50,000 utilisateurs qui nous font confiance chaque jour
          </p>
          <Link to="/signup">
            <Button variant="light" size="lg">
              Commencer maintenant
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-surface-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-secondary" />
              <span className="text-text-secondary">Données sécurisées et chiffrées</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-secondary" />
              <span className="text-text-secondary"> Agréé par la FEC</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-secondary" />
              <span className="text-text-secondary">Support disponible 7j/7</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
