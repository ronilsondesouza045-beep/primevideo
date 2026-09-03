import { ImapSimple, connect, ImapSimpleOptions } from 'imap-simple';
import { simpleParser, ParsedMail } from 'mailparser';

export interface NetflixCodeResult {
  success: boolean;
  code?: string;
  link?: string;
  subject?: string;
  date?: string;
  message?: string;
  isExpired?: boolean;
  ageMinutes?: number;
  expiresIn?: number;
  source?: 'email_imap' | 'email_imap_expired' | 'manual' | 'not_found' | 'generated' | string;
}

export interface FetchOptions {
  user?: string;
  password?: string;
  manualCode?: string;
  manualLink?: string;
}

/**
 * Conecta ao Gmail via IMAP e busca códigos de verificação reais de 4 dígitos e links enviados pela Netflix.
 * Valida rigorosamente se o código recebido no e-mail tem menos de 15 minutos (900 segundos).
 */
export async function fetchLatestNetflixCode(options?: FetchOptions): Promise<NetflixCodeResult> {
  const user = (options?.user || process.env.NETFLIX_GMAIL_USER || 'prine1070@gmail.com').trim();
  
  // Senhas candidatas para autenticação IMAP Gmail
  const candidatePasswords = [
    'ofigpfwbruhpwqpl',
    options?.password,
    process.env.NETFLIX_GMAIL_APP_PASSWORD,
    'roni1418rr',
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

      // Busca todas as mensagens na caixa de entrada
      const searchCriteria: any[] = ['ALL'];
      const fetchOptions = {
        bodies: [''],
        markSeen: false,
        struct: false
      };

      const messages = await connection.search(searchCriteria, fetchOptions);

      if (messages && messages.length > 0) {
        // Analisar da mensagem mais recente para a mais antiga
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
            // Extrai código de 4 dígitos (padrão Netflix: "Informe este código para entrar 1359" ou "código 1234")
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

            // Extrai link de confirmação de residência ou atualização da TV
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

              // Validação de 15 minutos (900 segundos)
              if (diffSeconds > 900) {
                return {
                  success: false,
                  isExpired: true,
                  code,
                  link: link || manualLink || 'https://www.netflix.com',
                  ageMinutes,
                  date: new Date(emailTimestamp).toISOString(),
                  message: `O último código encontrado no e-mail (${code || 'link'}) já expirou (chegou há ${ageMinutes} minutos). A Netflix exige códigos gerados em menos de 15 minutos. Peça para enviar um novo código na sua Smart TV e clique novamente!`,
                  source: 'email_imap_expired'
                };
              }

              const remainingSec = Math.max(10, 900 - diffSeconds);

              return {
                success: true,
                isExpired: false,
                code: code || 'Confirmar no Link',
                link: link || manualLink || 'https://www.netflix.com',
                subject,
                date: new Date(emailTimestamp).toISOString(),
                expiresIn: remainingSec,
                ageMinutes,
                message: `Código REAL capturado! Válido por mais ${Math.floor(remainingSec / 60)} min e ${remainingSec % 60}s.`,
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
      expiresIn: 900,
      source: 'manual'
    };
  }

  return {
    success: false,
    message: lastErrorMsg.includes('Invalid credentials') || lastErrorMsg.includes('auth')
      ? 'Atenção: Configure a Senha de Aplicativo do Gmail (NETFLIX_GMAIL_APP_PASSWORD) ou cadastre o código no Painel Admin.'
      : 'Nenhum e-mail recente da Netflix encontrado na caixa de entrada. Solicite o código na sua Smart TV e clique novamente!',
    source: 'not_found'
  };
}
