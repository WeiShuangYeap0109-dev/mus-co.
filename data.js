const { get, put } = require('@vercel/blob');

const DEFAULT = {
  products: [
    { id:'glue1', name:'Mus&Co. 韩国 1 秒速干胶水', size:'5ml', price:98, stock:20, image:'', active:true },
    { id:'glue05', name:'Mus&Co. Super Plus 0.5 秒速干胶水', size:'5ml', price:98, stock:20, image:'', active:true },
    { id:'remover', name:'Mus&Co. 日本植物卸膏', size:'', price:68, stock:20, image:'', active:true },
    { id:'cleanser', name:'Mus&Co. Cleanser', size:'', price:38, stock:20, image:'', active:true }
  ],
  settings: { threshold:300, discount:80, whatsapp:'' },
  orders: []
};

async function readData() {
  try {
    const r = await get('data/musco.json', { access: 'public', useCache: false });
    if (!r) return DEFAULT;
    const text = await new Response(r.stream).text();
    return JSON.parse(text);
  } catch (_) {
    return DEFAULT;
  }
}

async function writeData(data) {
  await put('data/musco.json', JSON.stringify(data), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json'
  });
}

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') return res.status(200).json(await readData());
    if (req.method !== 'PUT' && req.method !== 'POST') return res.status(405).json({ error:'Method not allowed' });

    const incoming = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!incoming || typeof incoming !== 'object') return res.status(400).json({ error:'Invalid data' });
    const current = await readData();
    const next = {
      products: Array.isArray(incoming.products) ? incoming.products : current.products,
      settings: incoming.settings && typeof incoming.settings === 'object' ? incoming.settings : current.settings,
      orders: Array.isArray(incoming.orders) ? incoming.orders : current.orders
    };
    await writeData(next);
    return res.status(200).json(next);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error:e.message || 'Data operation failed' });
  }
};
