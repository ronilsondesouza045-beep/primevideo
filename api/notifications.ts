// Vercel Serverless Function for /api/notifications
const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif_netflix_live_01',
    title: '⚡ Código Netflix TV Gerado (Tempo Real)',
    message: 'Roni Souza acabou de puxar um código de 4 dígitos para Smart TV na Netflix em tempo real.',
    read: false,
    type: 'success',
    link: '/catalog',
    category: 'netflix',
    userName: 'Roni Souza',
    service: 'netflix',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
  },
  {
    id: 'notif_netflix_live_02',
    title: '⚡ Código Netflix TV Gerado (Tempo Real)',
    message: 'Lucas Santos acabou de puxar um código de 4 dígitos para Smart TV na Netflix em tempo real.',
    read: false,
    type: 'success',
    link: '/catalog',
    category: 'netflix',
    userName: 'Lucas Santos',
    service: 'netflix',
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString()
  },
  {
    id: 'notif_paramount_01',
    title: '🍿 Paramount+ VIP Liberado',
    message: 'Mateus Oliveira resgatou acesso imediato ao catálogo Paramount+ com tela exclusiva.',
    read: false,
    type: 'info',
    link: '/catalog',
    category: 'streaming',
    userName: 'Mateus Oliveira',
    service: 'paramount',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  },
  {
    id: 'notif_system_01',
    title: '💎 StreamHub VIP 2.5 Ativo',
    message: 'Sistema de sincronização de códigos Netflix e catálogo de streamings 100% online.',
    read: true,
    type: 'info',
    link: '/catalog',
    category: 'system',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  }
];

// Global in-memory storage for serverless warm instances
let memoryNotifications = [...DEFAULT_NOTIFICATIONS];

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-user-email, x-user-name'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const newNotif = {
        id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        title: body.title || '⚡ Atividade em Tempo Real',
        message: body.message || 'Código ou streaming ativado com sucesso.',
        read: false,
        type: body.type || 'success',
        link: body.link || '/catalog',
        category: body.category || 'netflix',
        userName: body.userName || 'Membro VIP',
        service: body.service || 'netflix',
        createdAt: new Date().toISOString()
      };
      memoryNotifications.unshift(newNotif);
      if (memoryNotifications.length > 50) memoryNotifications = memoryNotifications.slice(0, 50);
      return res.status(200).json({ success: true, notification: newNotif, notifications: memoryNotifications });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // GET
  return res.status(200).json({
    success: true,
    notifications: memoryNotifications
  });
}
