// Vercel Serverless Function for /api/status

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    services: {
      netflix: 'operational',
      notifications: 'operational',
      database: 'operational'
    }
  });
}
