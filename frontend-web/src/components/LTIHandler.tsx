import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Provider } from '@supabase/supabase-js';

interface LTIHandlerProps {
  platformId: string;
  targetLinkUri: string;
  loginHint?: string;
  ltiMessageHint?: string;
}

export default function LTIHandler({
  platformId,
  targetLinkUri,
  loginHint,
  ltiMessageHint
}: LTIHandlerProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleLTILogin = async () => {
      try {
        // Vérifier si nous avons déjà une session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Si nous avons une session, vérifier si elle est valide pour cette plateforme
          const { data: platformData, error: platformError } = await supabase
            .from('lti_platforms')
            .select('*')
            .eq('platform_id', platformId)
            .single();

          if (platformError) throw platformError;

          // Rediriger vers l'URL cible avec les paramètres LTI
          const targetUrl = new URL(targetLinkUri);
          if (loginHint) targetUrl.searchParams.append('login_hint', loginHint);
          if (ltiMessageHint) targetUrl.searchParams.append('lti_message_hint', ltiMessageHint);
          
          router.push(targetUrl.toString());
        } else {
          // Si pas de session, initier le flux LTI
          const { data: platformData, error: platformError } = await supabase
            .from('lti_platforms')
            .select('*')
            .eq('platform_id', platformId)
            .single();

          if (platformError) throw platformError;

          const { error: authError } = await supabase.auth.signInWithOAuth({
            provider: platformData.provider as Provider,
            options: {
              redirectTo: targetLinkUri,
              scopes: 'openid profile email',
              queryParams: {
                login_hint: loginHint || '',
                lti_message_hint: ltiMessageHint || '',
                platform_id: platformId
              }
            }
          });

          if (authError) throw authError;
        }
      } catch (err: any) {
        console.error('Erreur LTI:', err);
        setError(err.message);
      }
    };

    handleLTILogin();
  }, [platformId, targetLinkUri, loginHint, ltiMessageHint, router]);

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        Erreur de connexion LTI: {error}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      <p className="mt-2 text-gray-600">Connexion en cours...</p>
    </div>
  );
}