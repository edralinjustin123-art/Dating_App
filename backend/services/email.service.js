const nodemailer = require('nodemailer');
const { unavailable } = require('../utils/errors');

function createEmailService(config) {
  let transport;
  function createTransport() {
    if (!config.SMTP_HOST || !config.SMTP_USER || !config.SMTP_PASSWORD) {
      throw unavailable('Password-reset email is unavailable until SMTP credentials are configured.');
    }
    if (transport) return transport;
    transport = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.smtpSecure,
      auth: { user: config.SMTP_USER, pass: config.SMTP_PASSWORD },
      pool: true,
      maxConnections: 3,
      connectionTimeout: 10_000,
      socketTimeout: 15_000,
    });
    return transport;
  }

  return {
    isConfigured: Boolean(config.SMTP_HOST && config.SMTP_USER && config.SMTP_PASSWORD),
    async sendPasswordReset(email, token) {
      if (!config.PASSWORD_RESET_URL) throw unavailable('PASSWORD_RESET_URL must be configured to send reset links.');
      const url = new URL(config.PASSWORD_RESET_URL);
      url.searchParams.set('token', token);
      await createTransport().sendMail({
        from: config.SMTP_FROM,
        to: email,
        subject: 'Reset your DateMate password',
        text: `Use this one-time link to reset your DateMate password. It expires in ${config.PASSWORD_RESET_TTL_MINUTES} minutes.\n\n${url.toString()}\n\nIf you did not request this, you can ignore this message.`,
      });
    },
    async close() { transport?.close(); },
  };
}

module.exports = { createEmailService };
