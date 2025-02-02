import Image from "next/image";
import { supabase } from "@/lib/supabase";


export default function Home() {

  const setNewView = async () => {
    const { data, error } = await supabase
      .from("views")
      .insert({
        name: "random name"
      })

    console.log(error || data);
  }



  setNewView();

  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2C2C2C] to-gray-100">
      <nav className="bg-[#2C2C2C] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Image 
                src="/logo.svg"
                alt="Job&Go Logo"
                width={120}
                height={40}
                priority
              />
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="/login"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Se connecter
              </a>
              <a
                href="/register" 
                className="bg-[#FF7043] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#FF5722] transition-colors"
              >
                S'inscrire
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
            <span className="block">Trouvez votre prochain emploi</span>
            <span className="block text-[#FF7043]">avec Job&Go</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            La plateforme qui connecte les talents avec les meilleures opportunités professionnelles.
          </p>
          
          <div className="mt-10">
            <div className="bg-[#2C2C2C] p-4 shadow-lg rounded-lg max-w-2xl mx-auto border border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Poste, compétence ou entreprise"
                  className="flex-1 p-3 bg-gray-800 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-[#FF7043] focus:border-transparent placeholder-gray-400"
                />
                <input
                  type="text"
                  placeholder="Ville ou région"
                  className="flex-1 p-3 bg-gray-800 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-[#FF7043] focus:border-transparent placeholder-gray-400"
                />
                <button className="bg-[#FF7043] text-white px-6 py-3 rounded-md hover:bg-[#FF5722] transition-colors">
                  Rechercher
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-[#2C2C2C] p-6 rounded-lg shadow-lg border border-gray-700">
              <div className="text-[#FF7043] text-2xl mb-4">✨</div>
              <h3 className="text-lg font-medium text-white">Offres Pertinentes</h3>
              <p className="mt-2 text-gray-300">Des opportunités professionnelles adaptées à votre profil et vos aspirations.</p>
            </div>
            
            <div className="bg-[#2C2C2C] p-6 rounded-lg shadow-lg border border-gray-700">
              <div className="text-[#FF7043] text-2xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-white">Recherche Simplifiée</h3>
              <p className="mt-2 text-gray-300">Une interface intuitive pour trouver rapidement les offres qui vous correspondent.</p>
            </div>

            <div className="bg-[#2C2C2C] p-6 rounded-lg shadow-lg border border-gray-700">
              <div className="text-[#FF7043] text-2xl mb-4">🚀</div>
              <h3 className="text-lg font-medium text-white">Carrière Accélérée</h3>
              <p className="mt-2 text-gray-300">Des outils et conseils pour booster votre parcours professionnel.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#2C2C2C] text-white mt-20 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-sm font-semibold mb-4 text-[#FF7043]">À propos</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-[#FF7043] text-sm transition-colors">Qui sommes-nous</a></li>
                <li><a href="#" className="text-gray-300 hover:text-[#FF7043] text-sm transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-[#FF7043]">Ressources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-[#FF7043] text-sm transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-300 hover:text-[#FF7043] text-sm transition-colors">Guide carrière</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-[#FF7043]">Légal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-[#FF7043] text-sm transition-colors">Confidentialité</a></li>
                <li><a href="#" className="text-gray-300 hover:text-[#FF7043] text-sm transition-colors">CGU</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-[#FF7043]">Suivez-nous</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-[#FF7043] text-sm transition-colors">LinkedIn</a></li>
                <li><a href="#" className="text-gray-300 hover:text-[#FF7043] text-sm transition-colors">Twitter</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
