import { fetchLatestNetflixCode } from '../../src/server/netflixCodeService';

export default async function handler(req: any, res: any) {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-user-email'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const user = process.env.NETFLIX_GMAIL_USER || 'prine1070@gmail.com';
    const password = process.env.NETFLIX_GMAIL_APP_PASSWORD || 'ofigpfwbruhpwqpl';

    console.log('[Vercel Serverless Bot] Tentando puxar código do Gmail:', user);

    const pullResult = await fetchLatestNetflixCode({
      user,
      password
    });

    if (pullResult.success && pullResult.code) {
      const now = Date.now();
      const expiresInSec = 900; // 15 minutos
      return res.status(200).json({
        success: true,
        code: pullResult.code,
        link: pullResult.link || 'https://www.netflix.com/browse',
        email: user,
        expiresIn: expiresInSec,
        generatedAt: new Date(now).toISOString(),
        expiresAt: new Date(now + expiresInSec * 1000).toISOString(),
        source: pullResult.source || 'email_imap',
        message: 'Código REAL capturado diretamente do seu e-mail com sucesso!'
      });
    }

    return res.status(200).json({
      success: false,
      message: pullResult.message || 'Nenhum código da Netflix encontrado nos últimos e-mails recebidos. Peça para enviar o código na TV/App e clique novamente.',
      source: 'not_found'
    });
  } catch (error: any) {
    console.error('[Vercel Serverless Bot Error]:', error);
    return res.status(200).json({
      success: false,
      message: error?.message || 'Erro ao conectar à caixa de entrada do Gmail. Tente novamente em alguns segundos.',
      source: 'error'
    });
  }
}
