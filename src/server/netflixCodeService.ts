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
 * Conecta ao Gmail via IMAP e busca códigos de verificação de 4 dígitos e links de residência enviados pela Netflix.
 */
export async function fetchLatestNetflixCode(options?: FetchOptions): Promise<NetflixCodeResult> {
  const user = (options?.user || process.env.NETFLIX_GMAIL_USER || 'prine1070@gmail.com').trim();
  
  // Senhas candidatas: App Password ou senha direta
  const candidatePasswords = [
    options?.password,
    process.env.NETFLIX_GMAIL_APP_PASSWORD,
    'roni141821'
  ].filter((p): p is string => Boolean(p && p.trim().length > 0))
   .map(p => p.replace(/\s+/g, ''));

  const manualCode = options?.manualCode?.trim();
  const manualLink = options?.manualLink?.trim();

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
          authTimeout: 6000,
          tlsOptions: { rejectUnauthorized: false }
        }
      };

      connection = await connect(config);
      await connection.openBox('INBOX');

      // Buscar e-mails recentes da Netflix
      const searchCriteria = [
        ['HEADER', 'FROM', 'netflix.com']
      ];

      const fetchOptions = {
        bodies: ['HEADER', 'TEXT', ''],
        markSeen: false,
        struct: true
      };

      let messages = await connection.search(searchCriteria, fetchOptions);

      if (!messages || messages.length === 0) {
        const fallbackCriteria = [
          ['OR', ['HEADER', 'SUBJECT', 'Netflix'], ['HEADER', 'SUBJECT', 'código']]
        ];
        const fallbackMessages = await connection.search(fallbackCriteria, fetchOptions);
        if (fallbackMessages && fallbackMessages.length > 0) {
          messages = fallbackMessages;
        }
      }

      if (messages && messages.length > 0) {
        // Ordenar mais recentes primeiro
        messages.sort((a, b) => {
          const dateA = new Date(a.attributes?.date || 0).getTime();
          const dateB = new Date(b.attributes?.date || 0).getTime();
          return dateB - dateA;
        });

        const latestMessage = messages[0];
        const allParts = latestMessage.parts || [];
        const fullBodyPart = allParts.find((part) => part.which === '') || allParts[0];

        const parsed: ParsedMail = await simpleParser(fullBodyPart.body);
        const subject = parsed.subject || 'Código Netflix';
        const text = parsed.text || '';
        const html = (parsed.html as string) || '';
        const combinedContent = `${subject}\n${text}\n${html}`;

        // Extrai código de 4 dígitos (padrão Netflix)
        let code: string | undefined;
        const directMatch = combinedContent.match(/(?:c[oó]digo|code|seja|digite|insira|tempor[aá]rio)[\s\S]{0,40}?(\b\d{4}\b)/i);
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
            code: code || manualCode || 'Confirmar no Link',
            link: link || manualLink,
            subject,
            date: new Date(latestMessage.attributes?.date || Date.now()).toISOString(),
            message: 'Código mais recente capturado do e-mail oficial com sucesso!',
            source: 'email_imap'
          };
        }
      }
    } catch (err: any) {
      // Tenta a próxima senha ou cai no fallback
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
  if (manualCode) {
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
    message: 'Aguardando o código chegar no e-mail... Digite prine1070@gmail.com na Netflix da sua TV e clique em Enviar Código.',
    source: 'not_found'
  };
}
