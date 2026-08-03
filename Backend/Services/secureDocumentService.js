const crypto = require('crypto');

const getKey = () => {
  const raw = process.env.DOCUMENT_ENCRYPTION_KEY;
  if (!raw) throw new Error('DOCUMENT_ENCRYPTION_KEY is required for secure document uploads');
  return crypto.createHash('sha256').update(raw).digest();
};

const encryptBuffer = buffer => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return {
    iv: iv.toString('hex'),
    authTag: cipher.getAuthTag().toString('hex'),
    ciphertext,
    sha256: crypto.createHash('sha256').update(buffer).digest('hex')
  };
};

const decryptBuffer = document => {
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), Buffer.from(document.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(document.authTag, 'hex'));
  return Buffer.concat([decipher.update(document.ciphertext), decipher.final()]);
};

module.exports = { encryptBuffer, decryptBuffer };