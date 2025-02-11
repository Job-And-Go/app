"use client";

import { useState } from 'react';
import { registerUserWithEmail } from './signup'; // Assure-toi du bon chemin d'import

const sendEmail = async (emailData: { to: string, subject: string, html: string }) => {
  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData),
  });
  
  return response.json();
};

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await registerUserWithEmail(email, password);
      await sendEmail({
        to: email,
        subject: "Inscription réussie",
        html: "<h1>Inscription réussie</h1><p>Un email de confirmation a été envoyé.</p>"
      });
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'inscription.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email:
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label>
        Mot de passe:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      <button type="submit">S'inscrire</button>
    </form>
  );
}
