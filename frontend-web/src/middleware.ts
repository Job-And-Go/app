// Import des modules nécessaires pour le middleware d'authentification
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

// Fonction middleware qui vérifie l'authentification de l'utilisateur
export async function middleware(req: NextRequest) {
  try {
    // Création de la réponse Next.js
    const res = NextResponse.next();
    // Initialisation du client Supabase pour le middleware
    const supabase = createMiddlewareClient({ req, res });
    // Récupération de la session utilisateur
    const { data: { session }, error } = await supabase.auth.getSession();

    // En cas d'erreur d'authentification, redirection vers la page de login
    if (error) {
      console.error('Auth error:', error);
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Si pas de session active, redirection vers la page de login
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Si tout est OK, on continue la requête
    return res;
  } catch (err) {
    // En cas d'erreur générale, log et redirection vers login
    console.error('Middleware error:', err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// Configuration des routes où le middleware doit s'appliquer
// Exclut les routes API, les ressources statiques et la page de login
export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico|login).*)",
};
