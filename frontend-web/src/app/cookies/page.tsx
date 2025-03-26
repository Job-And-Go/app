'use client';

import Link from 'next/link';

export default function CookiesPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Politique de Cookies
          </h1>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Qu'est-ce qu'un cookie ?
              </h2>
              <p className="text-gray-600 mb-4">
                Un cookie est un petit fichier texte stocké sur votre ordinateur ou appareil mobile lorsque vous visitez un site web. Les cookies sont largement utilisés pour faire fonctionner les sites web ou les rendre plus efficaces, ainsi que pour fournir des informations aux propriétaires du site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Comment utilisons-nous les cookies ?
              </h2>
              <p className="text-gray-600 mb-4">
                Nous utilisons différents types de cookies pour diverses raisons :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>
                  <strong>Cookies essentiels :</strong> Nécessaires au fonctionnement du site. Ils vous permettent de naviguer sur le site et d'utiliser ses fonctionnalités.
                </li>
                <li>
                  <strong>Cookies de performance :</strong> Nous aident à comprendre comment les visiteurs interagissent avec notre site en collectant et rapportant des informations de manière anonyme.
                </li>
                <li>
                  <strong>Cookies de fonctionnalité :</strong> Permettent au site de se souvenir des choix que vous faites (comme votre nom d'utilisateur, votre langue ou la région où vous vous trouvez) et fournissent des fonctionnalités améliorées et plus personnelles.
                </li>
                <li>
                  <strong>Cookies de ciblage :</strong> Peuvent être mis en place par nos partenaires publicitaires. Ils peuvent être utilisés par ces sociétés pour établir un profil de vos intérêts et vous montrer des publicités pertinentes sur d'autres sites.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Vos choix concernant les cookies
              </h2>
              <p className="text-gray-600 mb-4">
                Vous pouvez modifier vos préférences concernant les cookies à tout moment. Voici les différentes options qui s'offrent à vous :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>
                  <strong>Accepter tous les cookies :</strong> Pour une expérience optimale du site avec toutes les fonctionnalités.
                </li>
                <li>
                  <strong>Cookies fonctionnels uniquement :</strong> Seuls les cookies essentiels au fonctionnement du site seront activés.
                </li>
                <li>
                  <strong>Paramétrer vos préférences :</strong> Choisissez précisément quels types de cookies vous souhaitez autoriser.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Comment gérer les cookies ?
              </h2>
              <p className="text-gray-600 mb-4">
                En plus des options que nous proposons, vous pouvez refuser l'utilisation des cookies en modifiant les paramètres de votre navigateur. Consultez la fonction d'aide de votre navigateur pour savoir comment procéder.
              </p>
              <p className="text-gray-600">
                Notez que la désactivation de certains cookies peut affecter votre expérience sur notre site et limiter l'accès à certaines fonctionnalités.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Mise à jour de notre politique
              </h2>
              <p className="text-gray-600 mb-4">
                Nous nous réservons le droit de modifier cette politique de cookies à tout moment. Tout changement sera publié sur cette page et entrera en vigueur dès sa publication.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Nous contacter
              </h2>
              <p className="text-gray-600 mb-4">
                Si vous avez des questions concernant notre utilisation des cookies, n'hésitez pas à nous contacter :
              </p>
              <Link 
                href="/contact"
                className="text-theme-primary hover:text-theme-hover transition-colors"
              >
                Page de contact
              </Link>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
} 