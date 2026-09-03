import { ImapSimple, connect, ImapSimpleOptions } from 'imap-simple';
import { simpleParser, ParsedMail } from 'mailparser';

export default async function handler(req: any, res: any) {
  // CORS
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

  const user = (process.env.NETFLIX_GMAIL_USER || 'prine1070@gmail.com').trim();
  const candidatePasswords = [
    'ofigpfwbruhpwqpl',
    process.env.NETFLIX_GMAIL_APP_PASSWORD,
    'roni1418rr',
    'roni141821'
  ].filter((p): p is string => Boolean(p && p.trim().length > 0))
   .map(p => p.replace(/\s+/g, ''));

  let lastErrorMsg = '';

  for (const password of candidatePasswords) {
    let connection: ImapSimple | null = null;
    try {
      const config: ImapSimpleOptions = {
        imap: {
          user,
          password,
          host: 'imap.gmail.com',
          port: 993,
          tls: true,
          authTimeout: 10000,
          tlsOptions: { rejectUnauthorized: false }
        }
      };

      connection = await connect(config);
      await connection.openBox('INBOX');

      const messages = await connection.search(['ALL'], { bodies: [''], markSeen: false });

      if (messages && messages.length > 0) {
        const recentMessages = messages.slice(-10).reverse();

        for (const msg of recentMessages) {
          const allParts = msg.parts || [];
          const fullBodyPart = allParts.find((part) => part.which === '') || allParts[0];

          if (!fullBodyPart || !fullBodyPart.body) continue;

          const parsed: ParsedMail = await simpleParser(fullBodyPart.body);
          const subject = parsed.subject || '';
          const from = parsed.from?.text || '';
          const text = parsed.text || '';
          const html = (parsed.html as string) || '';
          const combinedContent = `${subject}\n${from}\n${text}\n${html}`;

          const isNetflixEmail = /netflix/i.test(from) || /netflix/i.test(subject) || /netflix\.com/i.test(combinedContent);

          if (isNetflixEmail) {
            let code: string | undefined;
            const directMatch = combinedContent.match(/(?:c[oó]digo|code|seja|digite|insira|tempor[aá]rio|acesso|entrar)[\s\S]{0,60}?(\b\d{4}\b)/i);
            if (directMatch && directMatch[1]) {
              code = directMatch[1];
            } else {
              const all4Digits = Array.from(text.matchAll(/\b([0-9]{4})\b/g)).map(m => m[1]);
              const validDigits = all4Digits.filter(d => !['2024', '2025', '2026', '2027', '1999', '2000'].includes(d));
              if (validDigits.length > 0) {
                code = validDigits[0];
              }
            }

            let link: string | undefined;
            const linkMatch = html.match(/https:\/\/(?:www\.)?netflix\.com\/[^\s"'>]+/i) ||
                              text.match(/https:\/\/(?:www\.)?netflix\.com\/[^\s"'>]+/i);
            if (linkMatch && linkMatch[0]) {
              link = linkMatch[0].replace(/&amp;/g, '&');
            }

            if (code || link) {
              const rawEmailDate = parsed.date || msg.attributes?.date || new Date();
              const emailTimestamp = new Date(rawEmailDate).getTime();
              const now = Date.now();
              const diffSeconds = Math.max(0, Math.floor((now - emailTimestamp) / 1000));
              const ageMinutes = Math.floor(diffSeconds / 60);

              await connection.end();

              if (diffSeconds > 900) {
                return res.status(200).json({
                  success: false,
                  isExpired: true,
                  code,
                  link: link || 'https://www.netflix.com',
                  ageMinutes,
                  date: new Date(emailTimestamp).toISOString(),
                  message: `O último código encontrado no e-mail (${code || 'link'}) já expirou (chegou há ${ageMinutes} minutos). A Netflix exige códigos gerados em menos de 15 minutos. Peça para enviar um novo código na sua Smart TV e clique novamente!`,
                  source: 'email_imap_expired'
                });
              }

              const remainingSec = Math.max(10, 900 - diffSeconds);

              return res.status(200).json({
                success: true,
                isExpired: false,
                code: code || 'Confirmar no Link',
                link: link || 'https://www.netflix.com/browse',
                email: user,
                expiresIn: remainingSec,
                ageMinutes,
                generatedAt: new Date(emailTimestamp).toISOString(),
                expiresAt: new Date(now + remainingSec * 1000).toISOString(),
                source: 'email_imap',
                message: `Código REAL capturado! Válido por mais ${Math.floor(remainingSec / 60)} min e ${remainingSec % 60}s.`
              });
            }
          }
        }
      }

      await connection.end();
    } catch (err: any) {
      lastErrorMsg = err?.message || String(err);
      if (connection) {
        try { await connection.end(); } catch (_) {}
      }
    }
  }

  return res.status(200).json({
    success: false,
    message: lastErrorMsg.includes('Invalid credentials') || lastErrorMsg.includes('auth')
      ? 'Atenção: Configure a Senha de Aplicativo do Gmail (NETFLIX_GMAIL_APP_PASSWORD).'
      : 'Nenhum e-mail recente da Netflix encontrado na caixa de entrada. Solicite o código na sua Smart TV e clique novamente!',
    source: 'not_found'
  });
}
