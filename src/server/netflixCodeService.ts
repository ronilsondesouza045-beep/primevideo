import { ImapSimple, connect, ImapSimpleOptions } from 'imap-simple';
import { simpleParser, ParsedMail } from 'mailparser';

export interface NetflixCodeResult {
  success: boolean;
  code?: string;
  link?: string;
  subject?: string;
  date?: string;
  message?: string;
  source?: 'email_imap' | 'manual' | 'not_found' | 'generated' | string;
}

export interface FetchOptions {
  user?: string;
  password?: string;
  manualCode?: string;
  manualLink?: string;
}

/**
 * Conecta ao Gmail via IMAP e busca códigos de verificação reais de 4 dígitos e links enviados pela Netflix.
 */
export async function fetchLatestNetflixCode(options?: FetchOptions): Promise<NetflixCodeResult> {
  const user = (options?.user || process.env.NETFLIX_GMAIL_USER || 'prine1070@gmail.com').trim();
  
  // Senhas candidatas para autenticação IMAP Gmail
  const candidatePasswords = [
    options?.password,
    process.env.NETFLIX_GMAIL_APP_PASSWORD,
    'ofigpfwbruhpwqpl',
    'ofig pfwb ruhp wqpl',
    'roni141821'
  ].filter((p): p is string => Boolean(p && p.trim().length > 0))
   .map(p => p.replace(/\s+/g, ''));

  const manualCode = options?.manualCode?.trim();
  const manualLink = options?.manualLink?.trim();

  let lastErrorMsg = '';

  // Tenta conectar com as senhas disponíveis
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

      // Buscar e-mails da Netflix ou mensagens recentes
      let searchCriteria: any[] = [
        ['OR', ['HEADER', 'FROM', 'netflix'], ['HEADER', 'SUBJECT', 'Netflix']]
      ];

      const fetchOptions = {
        bodies: ['HEADER', 'TEXT', ''],
        markSeen: false,
        struct: true
      };

      let messages = await connection.search(searchCriteria, fetchOptions);

      // Se não encontrou por filtro, busca os últimos e-mails recentes (últimas 24h/recentes)
      if (!messages || messages.length === 0) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 2);
        const fallbackCriteria = [['SINCE', yesterday.toISOString().split('T')[0]]];
        try {
          messages = await connection.search(fallbackCriteria, fetchOptions);
        } catch {
          // Se falhar o SINCE, tenta UNSEEN
          messages = await connection.search(['UNSEEN'], fetchOptions);
        }
      }

      if (messages && messages.length > 0) {
        // Ordenar mais recentes primeiro
        messages.sort((a, b) => {
          const dateA = new Date(a.attributes?.date || 0).getTime();
          const dateB = new Date(b.attributes?.date || 0).getTime();
          return dateB - dateA;
        });

        // Analisar as últimas 15 mensagens em busca da Netflix
        const recentMessages = messages.slice(0, 15);

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
            // Extrai código de 4 dígitos (padrão Netflix: "Seu código de acesso temporário é 1234" ou "digite o código 1234")
            let code: string | undefined;
            const directMatch = combinedContent.match(/(?:c[oó]digo|code|seja|digite|insira|tempor[aá]rio|acesso)[\s\S]{0,50}?(\b\d{4}\b)/i);
            if (directMatch && directMatch[1]) {
              code = directMatch[1];
            } else {
              const all4Digits = Array.from(text.matchAll(/\b([0-9]{4})\b/g)).map(m => m[1]);
              const validDigits = all4Digits.filter(d => !['2024', '2025', '2026', '2027', '1999', '2000'].includes(d));
              if (validDigits.length > 0) {
                code = validDigits[0];
              }
            }

            // Extrai link de confirmação de residência ou atualização da TV
            let link: string | undefined;
            const linkMatch = html.match(/https:\/\/(?:www\.)?netflix\.com\/[^\s"'>]+/i) ||
                              text.match(/https:\/\/(?:www\.)?netflix\.com\/[^\s"'>]+/i);
            if (linkMatch && linkMatch[0]) {
              link = linkMatch[0].replace(/&amp;/g, '&');
            }

            if (code || link) {
              return {
                success: true,
                code: code || 'Confirmar no Link',
                link: link || manualLink || 'https://www.netflix.com',
                subject,
                date: new Date(msg.attributes?.date || Date.now()).toISOString(),
                message: 'Código REAL capturado diretamente do seu e-mail com sucesso!',
                source: 'email_imap'
              };
            }
          }
        }
      }
    } catch (err: any) {
      lastErrorMsg = err?.message || 'Erro ao autenticar no Gmail';
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch (e) {
          // ignore
        }
      }
    }
  }

  // Se tem código manual registrado no sistema
  if (manualCode && manualCode.length > 0) {
    return {
      success: true,
      code: manualCode,
      link: manualLink || 'https://www.netflix.com',
      message: 'Código de acesso disponível.',
      date: new Date().toISOString(),
      source: 'manual'
    };
  }

  return {
    success: false,
    message: lastErrorMsg.includes('Invalid credentials') || lastErrorMsg.includes('auth')
      ? 'Atenção: Configure a Senha de Aplicativo do Gmail (NETFLIX_GMAIL_APP_PASSWORD) ou cadastre o código no Painel Admin.'
      : 'Nenhum e-mail recente da Netflix encontrado. Solicite o código na sua TV/app da Netflix e clique novamente!',
    source: 'not_found'
  };
}
