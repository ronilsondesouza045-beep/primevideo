// Vercel Serverless Function for /api/notifications/log-activity

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-user-email, x-user-name'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const userName = body.userName || req.headers['x-user-name'] || 'Membro VIP';
    const category = body.category || 'netflix';
    const service = body.service || (category === 'netflix' ? 'netflix' : 'streaming');
    const serviceLabel = service === 'netflix' ? 'Netflix' : service.toUpperCase();

    const title = category === 'netflix'
      ? '⚡ Código Netflix TV Gerado (Tempo Real)'
      : `🍿 Acesso ${serviceLabel} Ativado (Tempo Real)`;

    const message = category === 'netflix'
      ? `${userName} acabou de puxar um código de 4 dígitos para Smart TV na Netflix em tempo real.`
      : `${userName} resgatou acesso VIP ao catálogo de ${serviceLabel}.`;

    const newNotification = {
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title,
      message,
      read: false,
      type: 'success',
      link: '/catalog',
      category: category === 'netflix' ? 'netflix' : 'streaming',
      userName,
      service,
      createdAt: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      notification: newNotification
    });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
}
