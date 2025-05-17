
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChartBar, Users, Package, FileText, Truck } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-bold text-2xl text-primary">Bizzmax</span>
          </div>
          <nav>
            <ul className="flex space-x-8">
              <li><a href="#fonctionnalites" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">Fonctionnalités</a></li>
              <li><a href="#avantages" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">Avantages</a></li>
              <li><a href="#contact" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </nav>
          <Link to="/login">
            <Button variant="default">
              Connexion
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold">Gérez votre commerce en toute simplicité</h1>
              <p className="text-xl text-gray-600">
                Bizzmax est une solution complète pour les commerçants qui souhaitent optimiser leur gestion au quotidien.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login">
                  <Button size="lg" className="group">
                    Commencer maintenant
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <a href="#fonctionnalites">
                  <Button size="lg" variant="outline">
                    Découvrir les fonctionnalités
                  </Button>
                </a>
              </div>
            </div>
            <div className="relative animate-fade-in">
              <div className="aspect-video rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 shadow-xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-medium">
                  Dashboard Bizzmax
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fonctionnalites" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Toutes les fonctionnalités dont vous avez besoin</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Bizzmax centralise tous les outils nécessaires pour gérer efficacement votre activité commerciale
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="feature-card animate-slide-up" style={{animationDelay: '0.1s'}}>
              <ChartBar className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Tableau de bord</h3>
              <p className="text-gray-600">Visualisez en un coup d'œil les indicateurs clés de performance de votre commerce.</p>
            </div>
            
            <div className="feature-card animate-slide-up" style={{animationDelay: '0.2s'}}>
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Gestion clients</h3>
              <p className="text-gray-600">Gérez vos clients, leur historique d'achat et leurs préférences.</p>
            </div>

            <div className="feature-card animate-slide-up" style={{animationDelay: '0.3s'}}>
              <Package className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Gestion de stock</h3>
              <p className="text-gray-600">Suivez votre inventaire en temps réel et recevez des alertes de réapprovisionnement.</p>
            </div>

            <div className="feature-card animate-slide-up" style={{animationDelay: '0.4s'}}>
              <Truck className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Livraisons</h3>
              <p className="text-gray-600">Organisez et suivez vos livraisons pour assurer la satisfaction de vos clients.</p>
            </div>

            <div className="feature-card animate-slide-up" style={{animationDelay: '0.5s'}}>
              <FileText className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Facturation</h3>
              <p className="text-gray-600">Créez et gérez vos factures professionnelles en quelques clics.</p>
            </div>

            <div className="feature-card animate-slide-up" style={{animationDelay: '0.6s'}}>
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Fournisseurs</h3>
              <p className="text-gray-600">Gérez vos relations avec vos fournisseurs et optimisez vos approvisionnements.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="avantages" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Pourquoi choisir Bizzmax ?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Notre solution vous offre de nombreux avantages pour optimiser la gestion de votre commerce
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 space-y-8">
              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 p-3 rounded-full">
                  <div className="h-6 w-6 text-primary">✓</div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Interface intuitive</h3>
                  <p className="text-gray-600">Une prise en main rapide sans formation complexe</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 p-3 rounded-full">
                  <div className="h-6 w-6 text-primary">✓</div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Solution tout-en-un</h3>
                  <p className="text-gray-600">Toutes les fonctionnalités dont vous avez besoin dans un seul outil</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 p-3 rounded-full">
                  <div className="h-6 w-6 text-primary">✓</div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Gain de temps</h3>
                  <p className="text-gray-600">Automatisez les tâches répétitives pour vous concentrer sur votre cœur de métier</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 p-3 rounded-full">
                  <div className="h-6 w-6 text-primary">✓</div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Support dédié</h3>
                  <p className="text-gray-600">Notre équipe vous accompagne tout au long de votre utilisation</p>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="aspect-square md:aspect-[4/3] rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 shadow-xl p-8 flex items-center justify-center">
                <div className="text-white text-center">
                  <h3 className="text-2xl font-bold mb-4">Prêt à optimiser votre commerce ?</h3>
                  <p className="mb-6">Rejoignez les commerçants qui font confiance à Bizzmax</p>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                      Commencer maintenant
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Une question ?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Contactez-nous pour en savoir plus sur comment Bizzmax peut aider votre commerce
          </p>
          <div className="flex justify-center">
            <Button size="lg" variant="default">
              Nous contacter
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Bizzmax</h3>
              <p className="text-gray-400">
                La solution complète pour la gestion de votre commerce.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Liens rapides</h3>
              <ul className="space-y-2">
                <li><a href="#fonctionnalites" className="text-gray-400 hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#avantages" className="text-gray-400 hover:text-white transition-colors">Avantages</a></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Connexion</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <address className="not-italic text-gray-400">
                <p>Email: contact@bizzmax.com</p>
                <p>Téléphone: +33 1 23 45 67 89</p>
              </address>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Bizzmax. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
