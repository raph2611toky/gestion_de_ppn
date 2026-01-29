const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function sendOtpEmail(email, code, nom) {
    const mailOptions = {
        from: `"Gestion PPN" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Votre code de vérification - Gestion PPN',
        html: `
            <h2>Bonjour ${nom},</h2>
            <p>Votre code de vérification est :</p>
            <h1 style="letter-spacing: 8px; text-align:center;">${code}</h1>
            <p>Ce code expire dans 10 minutes.</p>
            <p style="color:#777;">Ne partagez jamais ce code.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (err) {
        console.error("Erreur envoi email OTP:", err);
        return false;
    }
}

async function sendValidationEmail(email, nom) {
    const mailOptions = {
        from: `"Gestion PPN" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Votre compte a été validé - Gestion PPN',
        html: `
            <h2>Bonjour ${nom},</h2>
            <p>Votre compte modérateur a été validé par un administrateur.</p>
            <p>Vous pouvez maintenant vous connecter et commencer à utiliser la plateforme.</p>
            <p>Si vous n'avez pas initié cette action, contactez le support immédiatement.</p>
            <p style="color:#777;">Cordialement, l'équipe Gestion PPN.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (err) {
        console.error("Erreur envoi email validation:", err);
        return false;
    }
}

module.exports = { sendOtpEmail, sendValidationEmail };