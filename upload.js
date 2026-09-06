const { put } = require('@vercel/blob');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { name, type, data } = req.body || {};
    if (!name || !data) return res.status(400).json({ error: 'Missing image data' });
    if (!type || !type.startsWith('image/')) return res.status(400).json({ error: 'Only image files are allowed' });
    const raw = String(data).replace(/^data:[^;]+;base64,/, '');
    const bytes = Buffer.from(raw, 'base64');
    if (bytes.length > 4 * 1024 * 1024) return res.status(400).json({ error: 'Image must be 4MB or smaller' });
    const ext = (name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const pathname = `products/${Date.now()}-${Math.random().toString(36).slice(2,9)}.${ext}`;
    const blob = await put(pathname, bytes, { access: 'public', addRandomSuffix: false, contentType: type });
    return res.status(200).json({ url: blob.url, pathname: blob.pathname });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Upload failed' });
  }
};
