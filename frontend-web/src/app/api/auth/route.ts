import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { email, password, action } = requestData;

    const supabase = createRouteHandlerClient({ cookies });

    let result;
    if (action === 'signup') {
      result = await supabase.auth.signUp({
        email,
        password,
      });
    } else if (action === 'signin') {
      result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
    } else {
      return NextResponse.json({ error: 'Action non valide' }, { status: 400 });
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de l\'authentification' },
      { status: 500 }
    );
  }
} 