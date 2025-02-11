import nodemailer from 'nodemailer';

// Créer une fonction pour envoyer un email de confirmation
export async function sendConfirmationEmail(userEmail: string, userToken: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,  // Utilisation de la variable d'environnement
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true',  // converti en booléen
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Job&Go" <${process.env.SMTP_USER}>`,  // Utilisation de l'email SMTP configuré
    to: userEmail,
    subject: 'Confirmation d\'inscription',
    text: `Bienvenue sur Job&Go! Confirmez votre inscription en cliquant sur ce lien: ${process.env.CONFIRMATION_URL}?token=${userToken}`,
    html: `<p>Bienvenue sur <strong>Job&Go</strong>! Confirmez votre inscription en cliquant sur ce <a href="${process.env.CONFIRMATION_URL}?token=${userToken}">lien</a>.</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé:', info.response);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
  }
}
