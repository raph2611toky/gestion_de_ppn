function toPublicUrl(req, filePath) {
  if (!filePath) return null;

  const baseUrl = `${req.protocol}://${req.get('host')}`;

  const normalized = filePath.replaceAll('\\', '/');

  if (normalized.startsWith('uploads/')) return `${baseUrl}/${normalized}`;

  if (normalized.startsWith('/uploads/')) return `${baseUrl}${normalized}`;

  return `${baseUrl}/uploads/${normalized.split('/').pop()}`;
}

module.exports = {
  toPublicUrl
};