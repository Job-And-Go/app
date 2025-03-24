import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Page non trouvée</h2>
        <p className="text-gray-600 mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link 
          href="/"
          className="inline-block bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white py-3 px-6 rounded-lg hover:opacity-90 transition-all duration-200 font-medium text-lg shadow-md hover:shadow-lg"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
} 