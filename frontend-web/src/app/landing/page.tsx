'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        router.push('/');
        return;
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white student-theme">
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-md shadow-sm fixed w-full z-50"
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center"
            >
              <img src="/images/logo.PNG" alt="Logo StuJob - Plateforme de jobs étudiants" className="h-8 w-auto" />
              <span className="ml-2 text-xl font-bold text-gray-900">StuJob</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center space-x-4"
            >
              <Link 
                href="/login"
                className="text-gray-600 hover:text-[#FF751F] px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="bg-[#FF751F] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#E66A1C] transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Inscription
              </Link>
            </motion.div>
          </div>
        </nav>
      </motion.header>

      <main className="pt-20">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="block"
              >
                La plateforme qui connecte
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="block text-[#FF751F]"
              >
                étudiants, particuliers et entreprises
              </motion.span>
            </h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-3 max-w-md mx-auto text-base text-gray-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
            >
              Que vous soyez étudiant à la recherche de jobs flexibles, particulier en quête de services, ou entreprise à la recherche de talents, StuJob est la solution adaptée à vos besoins.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-10 flex justify-center gap-4"
            >
              <Link
                href="/register"
                className="bg-[#FF751F] text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-[#E66A1C] transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Commencer maintenant
              </Link>
              <Link
                href="/about"
                className="bg-white text-[#FF751F] border-2 border-[#FF751F] px-8 py-4 rounded-md text-lg font-medium hover:bg-orange-50 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                En savoir plus
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-3xl font-extrabold text-gray-900">
                Pourquoi choisir StuJob ?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Une plateforme adaptée à vos besoins
              </p>
            </motion.div>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: "🎓",
                  title: "Pour les étudiants",
                  description: "Trouvez des jobs adaptés à votre emploi du temps. Babysitting, jardinage, déménagement... Des opportunités locales et rémunérées qui s'adaptent à vos études."
                },
                {
                  icon: "🏠",
                  title: "Pour les particuliers",
                  description: "Publiez vos offres de services et trouvez rapidement des étudiants motivés pour vos petits jobs. Une solution simple et efficace pour vos besoins quotidiens."
                },
                {
                  icon: "🏢",
                  title: "Pour les entreprises",
                  description: "Recrutez les meilleurs talents étudiants. Stages, alternances, jobs étudiants... Développez votre équipe avec des profils adaptés à vos besoins."
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="bg-orange-50 p-6 rounded-lg hover:bg-orange-100 transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <div className="text-[#FF751F] text-2xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-orange-50 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Prêt à rejoindre StuJob ?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Que vous soyez étudiant, particulier ou entreprise, créez votre compte et commencez à profiter de nos services dès aujourd'hui.
              </p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="mt-8"
              >
                <Link
                  href="/register"
                  className="bg-[#FF751F] text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-[#E66A1C] transition-all duration-300 hover:scale-105 hover:shadow-lg inline-block"
                >
                  Créer un compte gratuitement
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-white border-t border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                title: "À propos",
                links: [
                  { href: "/about", text: "Qui sommes-nous" },
                  { href: "/contact", text: "Contact" }
                ]
              },
              {
                title: "Ressources",
                links: [
                  { href: "/blog", text: "Blog" },
                  { href: "/guides", text: "Guides" }
                ]
              },
              {
                title: "Légal",
                links: [
                  { href: "/privacy", text: "Confidentialité" },
                  { href: "/terms", text: "CGU" },
                  { href: "/cookies", text: "Politique de cookies" }
                ]
              },
              {
                title: "Suivez-nous",
                links: [
                  { href: "#", text: "LinkedIn" },
                  { href: "#", text: "Twitter" }
                ]
              }
            ].map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h4 className="text-sm font-semibold mb-4 text-[#FF751F]">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.text}>
                      <Link 
                        href={link.href} 
                        className="text-gray-600 hover:text-[#FF751F] text-sm transition-all duration-300 hover:translate-x-1 inline-block"
                      >
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.footer>
    </div>
  );
} 