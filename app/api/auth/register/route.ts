import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// On initialise Supabase côté serveur
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Utilise la clé Service Role pour contourner les RLS si besoin
);

export async function POST(request: Request) {
  try {
    const { name, email, phone, password } = await request.json();

    // 1. Création dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

    if (authData.user) {
      // 2. Insertion dans ta table public.profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ // On utilise update ou insert selon ta config trigger
          full_name: name,
          phone_number: phone,
          email: email
        })
        .eq('id', authData.user.id);

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ message: "Utilisateur créé avec succès" }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}