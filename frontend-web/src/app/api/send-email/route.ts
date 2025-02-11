import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend('re_VFoA3MVi_DukqhDixggSaWnGZp1yuKpcz');

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json();

    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: to || 'damien.invst@outlook.com',
      subject: subject || 'Hello World',
      html: html || '<p>Congrats on sending your <strong>first email</strong>!</p>'
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erreur d\'envoi:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    );
  }
} 