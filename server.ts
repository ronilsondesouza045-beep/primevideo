import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { db, User, SmmOrder, SmmConfig, SmmService } from './src/database';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'streamhub_vip_secret_key_2026';

app.use(express.json());
app.use(cookieParser());

import { UserRole } from './src/types';

// User Request augmentation
interface AuthenticatedRequest extends Request {
  authSource?: 'jwt' | 'header' | 'fallback';
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
    avatarUrl?: string;
  };
}

// Helper IP extractor
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

// Authentication Middlewares
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
  if (token === 'null' || token === 'undefined' || token === 'bearer' || token === '') {
    token = null;
  }

  const headerEmail = (req.headers['x-user-email'] || req.body?.email || req.query?.email) as string;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
      req.authSource = 'jwt';
      return next();
    } catch (err) {
      // Token expired or invalid signature, fallback to header email below
    }
  }

  if (headerEmail) {
    const cleanEmail = headerEmail.toLowerCase().trim();
    let u = db.getUserByEmail(cleanEmail);
    if (!u && cleanEmail && cleanEmail.includes('@')) {
      try {
        u = db.createUser(cleanEmail, 'social_login_pwd_123', cleanEmail.split('@')[0], '');
      } catch (e) {
        u = db.getUserByEmail(cleanEmail);
      }
    }

    if (u) {
      req.user = {
        id: u.id,
        email: u.email,
        role: u.role || 'user',
        name: u.name,
        avatarUrl: u.avatarUrl
      };
      req.authSource = 'header';
      return next();
    } else if (cleanEmail === 'ronisouza495@gmail.com') {
      req.user = {
        id: 'usr_admin_001',
        email: 'ronisouza495@gmail.com',
        role: 'super_admin',
        name: 'Administrador StreamHub VIP',
        avatarUrl: ''
      };
      req.authSource = 'header';
      return next();
    }
  }

  // Graceful fallback for authenticated requests if client provided any identification
  const clientIp = getClientIp(req);
  req.user = {
    id: `guest_${clientIp.replace(/[^a-zA-Z0-9]/g, '_')}`,
    email: headerEmail || `user_${clientIp.replace(/[^a-zA-Z0-9]/g, '')}@streamhub.vip`,
    role: 'user',
    name: 'Membro VIP',
    avatarUrl: ''
  };
  req.authSource = 'fallback';
  return next();
};

// RBAC Middleware Generators
const requireRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Acesso não autorizado. Autenticação necessária.' });
    }

    const isOwnerAdmin = req.user.email.toLowerCase() === 'ronisouza495@gmail.com';
    if (isOwnerAdmin || req.user.role === 'super_admin') {
      return next();
    }

    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({ error: `Acesso negado. Esta ação requer permissão de ${allowedRoles.join(' ou ')}.` });
  };
};

const requireAdmin = requireRoles('admin', 'super_admin');
const requireSupport = requireRoles('support', 'moderator', 'admin', 'super_admin');
const requireModerator = requireRoles('moderator', 'admin', 'super_admin');
const requireSuperAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ error: 'Não autorizado.' });
  const isOwnerAdmin = req.user.email.toLowerCase() === 'ronisouza495@gmail.com';
  if (isOwnerAdmin || req.user.role === 'super_admin') return next();
  return res.status(403).json({ error: 'Acesso exclusivo do Super Administrador.' });
};

// ==============================================
// 1. AUTHENTICATION ROUTES
// ==============================================

// Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, name, avatarUrl } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve conter no mínimo 6 caracteres.' });
    }

    const newUser = db.createUser(email, password, name, avatarUrl);

    db.recordUserLogin(newUser.id, getClientIp(req));
    db.addVisitorLog(
      getClientIp(req),
      (req.headers['user-agent'] as string) || '',
      '/register',
      { id: newUser.id, name: newUser.name, email: newUser.email }
    );

    // Auto login
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name, avatarUrl: newUser.avatarUrl },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      message: 'Conta criada com sucesso!',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        avatarUrl: newUser.avatarUrl
      },
      token
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Erro ao realizar cadastro.' });
  }
});

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Informe e-mail e senha.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ error: 'Sua conta está bloqueada pelo administrador.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Ensure user has avatarUrl
    if (!user.avatarUrl) {
      user.avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=dc2626&color=ffffff&bold=true`;
      db.updateUserAvatar(user.id, user.avatarUrl);
    }

    db.recordUserLogin(user.id, getClientIp(req));
    db.addVisitorLog(
      getClientIp(req),
      (req.headers['user-agent'] as string) || '',
      '/login',
      { id: user.id, name: user.name, email: user.email }
    );

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, avatarUrl: user.avatarUrl },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      message: 'Login efetuado com sucesso!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl
      },
      token
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro interno durante o login.' });
  }
});

// Social Login & Google Token Handler
app.post('/api/auth/social-login', (req: Request, res: Response) => {
  try {
    const { credential, email, name, avatarUrl, picture } = req.body;

    let userEmail = email;
    let userName = name;
    let userAvatar = avatarUrl || picture;

    // If Google GIS Token (credential JWT) was provided, decode it
    if (credential) {
      try {
        const decoded: any = jwt.decode(credential);
        if (decoded && decoded.email) {
          userEmail = decoded.email;
          userName = decoded.name || userName || 'Cliente Google VIP';
          userAvatar = decoded.picture || userAvatar;
        }
      } catch (e) {
        console.error('Erro ao decodificar token do Google GIS:', e);
      }
    }

    userEmail = userEmail || `google_vip_${Math.floor(1000 + Math.random() * 9000)}@gmail.com`;
    userName = userName || 'Cliente Google VIP';
    userAvatar = userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=dc2626&color=ffffff&bold=true`;

    let user = db.getUserByEmail(userEmail);
    if (!user) {
      user = db.createUser(userEmail, 'social_login_pwd_2026', userName, userAvatar);
    } else {
      if (userAvatar && user.avatarUrl !== userAvatar) {
        db.updateUserAvatar(user.id, userAvatar);
        user.avatarUrl = userAvatar;
      }
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ error: 'Sua conta está bloqueada pelo administrador.' });
    }

    db.recordUserLogin(user.id, getClientIp(req));
    db.addVisitorLog(
      getClientIp(req),
      (req.headers['user-agent'] as string) || '',
      '/social-login',
      { id: user.id, name: user.name, email: user.email }
    );

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, avatarUrl: user.avatarUrl },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      message: 'Login Social realizado com sucesso!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        walletBalance: db.getUserWalletBalance(user.id)
      },
      token
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao conectar via Login Social.' });
  }
});

// GET Current Authenticated User (Me)
app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    const user = db.getUserById(req.user.id) || db.getUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const avatarUrl = user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=dc2626&color=ffffff&bold=true`;

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        avatarUrl: avatarUrl,
        createdAt: user.createdAt,
        walletBalance: db.getUserWalletBalance(user.id)
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar perfil do usuário.' });
  }
});

// Track Visit Endpoint
app.post('/api/track-visit', (req: Request, res: Response) => {
  try {
    const ip = getClientIp(req);
    const userAgent = (req.headers['user-agent'] as string) || '';
    const path = req.body?.path || '/';

    let userObj = undefined;
    const token = req.cookies.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const u = db.getUserById(decoded.id);
        if (u) {
          userObj = { id: u.id, name: u.name, email: u.email };
        }
      } catch (e) {}
    }

    const log = db.addVisitorLog(ip, userAgent, path, userObj);
    return res.json({ success: true, log });
  } catch (err) {
    return res.json({ success: false });
  }
});

// User Support Chat API
app.post('/api/support/message', (req: Request, res: Response) => {
  try {
    const { text, userId, userName, userEmail } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Mensagem inválida.' });
    }

    let uId = userId || 'guest';
    let uName = userName || 'Cliente VIP';
    let uEmail = userEmail || 'visitante@streamhub.com';

    // Try token if present
    const token = req.cookies.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const u = db.getUserById(decoded.id);
        if (u) {
          uId = u.id;
          uName = u.name;
          uEmail = u.email;
        }
      } catch (e) {}
    }

    const msg = db.addSupportMessage(uId, uName, uEmail, 'user', text.trim());
    return res.json({ success: true, message: msg });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao enviar mensagem ao suporte.' });
  }
});

app.get('/api/support/history', (req: Request, res: Response) => {
  try {
    let uId = (req.query.userId as string) || (req.query.userEmail as string) || 'guest';
    const token = req.cookies.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const u = db.getUserById(decoded.id);
        if (u) {
          uId = u.id;
        }
      } catch (e) {}
    }

    const messages = db.getSupportMessagesForUser(uId);
    return res.json({ messages });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar mensagens.' });
  }
});

// Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  return res.json({ message: 'Sessão encerrada com sucesso.' });
});

// IP Helper is declared at the top of server.ts

// ==============================================
// 2. SERVICES & ACCESS GENERATOR
// ==============================================

// Check Prime Video status/eligibility for current IP or User
app.get('/api/services/prime-status', (req: Request, res: Response) => {
  try {
    const userIp = getClientIp(req);
    return res.json({
      blocked: false,
      reason: null,
      clientIp: userIp,
      errorMessage: null
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao verificar status.' });
  }
});

// Generate Free Prime Video Access (supports both route aliases)
app.post(['/api/services/generate-prime', '/api/services/prime'], authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const userIp = getClientIp(req);

    const primeCreds = db.getCredential('prime');

    const releasedCredentials = {
      email: primeCreds.email || 'primevideosouza368@gmail.com',
      password: primeCreds.password || 'roni141821',
      pin: 'Sem PIN',
      screen: 'Livre / Escolha qualquer perfil'
    };

    const accessLog = db.addAccessLog(user.id, user.email, 'prime', releasedCredentials, userIp);

    return res.json({
      success: true,
      message: 'Acesso Prime Video gerado com sucesso!',
      credentials: releasedCredentials,
      access: {
        id: accessLog.id,
        service: 'Prime Video VIP (Gratuito)',
        credentials: releasedCredentials,
        generatedAt: accessLog.createdAt,
        instructions: [
          'Acesse o site ou app oficial do Prime Video (primevideo.com).',
          'Insira o e-mail e a senha fornecidos acima.',
          'Escolha qualquer perfil de usuário disponível e aproveite seus filmes e séries sem limites.',
          'Dúvidas? Fale com nosso Chatbot no canto inferior da tela.'
        ]
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao liberar acesso ao Prime Video.' });
  }
});

// Generate Free Paramount+ Access (supports both route aliases)
app.post(['/api/services/generate-paramount', '/api/services/paramount'], authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const userIp = getClientIp(req);

    const paramCreds = db.getCredential('paramount');

    const releasedCredentials = {
      email: paramCreds.email || 'olivia8515@web-library.net',
      password: paramCreds.password || '4400988',
      screen: paramCreds.screen || 'Perfil Livre / Gratuito',
      warning: 'Aviso: A qualquer momento essa conta Paramount+ gratuita pode ser alterada ou parar de funcionar sem aviso prévio.'
    };

    const accessLog = db.addAccessLog(user.id, user.email, 'paramount', releasedCredentials, userIp);

    return res.json({
      success: true,
      message: 'Acesso Paramount+ gerado com sucesso!',
      credentials: releasedCredentials,
      access: {
        id: accessLog.id,
        service: 'Paramount+ Gratuito',
        credentials: releasedCredentials,
        generatedAt: accessLog.createdAt,
        instructions: [
          'Acesse o site ou app oficial do Paramount+ (paramountplus.com).',
          'Insira o e-mail e a senha fornecidos acima.',
          'Atenção: A qualquer momento esta conta Paramount+ gratuita pode parar de funcionar.'
        ]
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao liberar acesso ao Paramount+.' });
  }
});

// Generate Free Crunchyroll Access (supports both route aliases)
app.post(['/api/services/generate-crunchyroll', '/api/services/crunchyroll'], authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const userIp = getClientIp(req);

    const crunchyCreds = db.getCredential('crunchyroll');

    const releasedCredentials = {
      email: crunchyCreds.email || 'skeespq11@hotmail.com',
      password: crunchyCreds.password || '12344321',
      screen: crunchyCreds.screen || 'Perfil Livre / Gratuito',
      warning: 'Aviso: A qualquer momento o e-mail e a senha do Crunchyroll podem ser alterados ou parar de funcionar sem aviso prévio.'
    };

    const accessLog = db.addAccessLog(user.id, user.email, 'crunchyroll', releasedCredentials, userIp);

    return res.json({
      success: true,
      message: 'Acesso Crunchyroll VIP gerado com sucesso!',
      credentials: releasedCredentials,
      access: {
        id: accessLog.id,
        service: 'Crunchyroll VIP',
        credentials: releasedCredentials,
        generatedAt: accessLog.createdAt,
        instructions: [
          'Acesse o site ou app oficial do Crunchyroll (crunchyroll.com).',
          'Insira o e-mail e a senha fornecidos acima.',
          'Aproveite o catálogo organizado com Animes, Desenhos Animados e Filmes de Anime.',
          'Atenção: A qualquer momento o e-mail e a senha podem ser alterados ou parar de funcionar.'
        ]
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao liberar acesso ao Crunchyroll.' });
  }
});

// Generate Free ChatGPT Plus/Pro Access
app.post(['/api/services/generate-chatgpt', '/api/services/chatgpt'], authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const userIp = getClientIp(req);

    const gptCreds = db.getCredential('chatgpt');

    const releasedCredentials = {
      email: gptCreds.email || 'gatomemu22@gmail.com',
      password: gptCreds.password || '14182131r',
      screen: gptCreds.screen || 'ChatGPT Pro GPT-4o (Login Google)',
      warning: 'Aviso: Esta conta do ChatGPT Plus/Pro é vinculada ao Google. Faça login escolhendo "Continuar com o Google".'
    };

    const accessLog = db.addAccessLog(user.id, user.email, 'chatgpt', releasedCredentials, userIp);

    return res.json({
      success: true,
      message: 'Acesso ChatGPT Pro gerado com sucesso!',
      credentials: releasedCredentials,
      access: {
        id: accessLog.id,
        service: 'ChatGPT Plus / Pro',
        credentials: releasedCredentials,
        generatedAt: accessLog.createdAt,
        instructions: [
          'Acesse chatgpt.com ou baixe o app oficial na Google Play Store.',
          'Selecione a opção "Continuar com o Google" (Log in with Google).',
          'Insira o e-mail (gatomemu22@gmail.com) e a senha (14182131r).',
          'Aproveite o acesso completo à Inteligência Artificial GPT-4o!'
        ]
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao liberar acesso ao ChatGPT.' });
  }
});

// IPTV Catalog List Endpoint
app.get('/api/services/iptv-list', (req: Request, res: Response) => {
  const iptvAccounts = [
    { id: '1', username: 'WKSH7D9F23', password: 'diwnRPxesR', expiration: '28/01/2027', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '2', username: 'VNszNZtja', password: 'G8Tx6r', expiration: '26/12/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '3', username: '99149215b', password: '49258701Mg', expiration: '08/08/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '4', username: 'Caiquenz', password: '6b23kfmh', expiration: '18/08/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '5', username: '66236371', password: '50980400', expiration: '17/08/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '6', username: 'Andersonmatos', password: 'Amdatv123', expiration: '16/08/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '7', username: 'tatiana7106', password: 'Fellin94835', expiration: '20/08/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '8', username: 'airtoncougoc', password: '102030eE', expiration: '22/08/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '9', username: '892rondinele', password: 'RnD629914581e', expiration: '03/08/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '10', username: 'kellyNayara', password: 'Br951753x', expiration: '11/08/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '11', username: '34484652', password: '32757283', expiration: '25/08/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '12', username: 'NeyFutsal', password: '9d1ph5q7', expiration: '22/08/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '13', username: 'adanlucainn', password: 'H6gj7Ad5fd', expiration: '08/08/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '14', username: 'nadine3246', password: 'M9y3sF', expiration: '14/08/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '15', username: 'bzxf63he1', password: 'kQx41N', expiration: '28/08/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '16', username: 'z59VYQJd', password: 'w4Z3Mr', expiration: '07/08/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '17', username: 'Naldo00c', password: '102030eE', expiration: '25/08/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '18', username: 'israelcrs', password: 'Xte4G9', expiration: '19/08/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '19', username: 'robertoSmartOne', password: 'xBjU65', expiration: '16/08/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '20', username: 'JfzqMgdzj', password: 't8Kp6R', expiration: '29/07/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '21', username: 'AmiManonn', password: '9aT9xZ', expiration: '23/08/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '22', username: 'VanessaDuplex', password: 'BsdFu5278', expiration: '04/08/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '23', username: 'Alexandre2972', password: 'Asdfgh54321', expiration: '01/08/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '24', username: 'jorgegrafity642', password: 'pa5XG2', expiration: '21/08/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '25', username: '4Ws9wN', password: '4V7bmU', expiration: '05/08/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '26', username: 'rodney8582R', password: '2127QFDTxfhs', expiration: '18/08/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '27', username: 'de7re23aw', password: 'v1amp7jb', expiration: '05/08/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '28', username: 'Raffaela1', password: '240101Ra', expiration: '03/09/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '29', username: 'luanne10', password: '53KdYhv1e', expiration: '26/08/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '30', username: 'yRjZ75', password: '7K2mGd', expiration: '18/08/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
    { id: '31', username: 'h77397tws', password: 'hfw54451', expiration: '20/08/2026', connections: 1, status: 'Active', server: 'ger99.xyz:80' },
  ];

  return res.json({
    total: iptvAccounts.length,
    warning: '⚠️ Alguns acessos podem estar ocupados por limite de conexões simultâneas (1 conexão por conta). Se um usuário não funcionar, selecione ou gere outro da lista!',
    accounts: iptvAccounts
  });
});

// ==============================================
// MOVIES CATALOG API ENDPOINTS
// ==============================================

// GET all movies
app.get('/api/movies', (req: Request, res: Response) => {
  try {
    const movies = db.getMovies();
    return res.json({ success: true, movies });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao carregar catálogo de filmes.' });
  }
});

// POST add new movie (Admin or User)
app.post('/api/movies', (req: Request, res: Response) => {
  try {
    const { title, description, coverUrl, videoUrl, category, year, duration, quality, rating } = req.body;

    if (!title || !videoUrl) {
      return res.status(400).json({ error: 'Título e Link do Filme/Vídeo são obrigatórios!' });
    }

    const newMovie = db.addMovie({
      title: title.trim(),
      description: (description || 'Filme completo no catálogo StreamHub VIP. Assista em alta definição!').trim(),
      coverUrl: coverUrl?.trim() || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
      videoUrl: videoUrl.trim(),
      category: category?.trim() || 'Lançamentos',
      year: year?.trim() || new Date().getFullYear().toString(),
      duration: duration?.trim() || '2h 00m',
      quality: quality?.trim() || '1080p Full HD',
      rating: rating?.trim() || '9.8',
      addedBy: 'Administrador StreamHub'
    });

    return res.json({
      success: true,
      message: 'Filme adicionado ao catálogo com sucesso!',
      movie: newMovie
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao adicionar filme.' });
  }
});

// DELETE movie
app.delete('/api/movies/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const removed = db.deleteMovie(id);
    if (removed) {
      return res.json({ success: true, message: 'Filme removido do catálogo.' });
    } else {
      return res.status(404).json({ error: 'Filme não encontrado.' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao deletar filme.' });
  }
});

// Generate Free Fire PIN / Codiguin
app.post('/api/services/generate-freefire', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  return res.status(400).json({
    success: false,
    reason: 'maintenance',
    error: '⚠️ O resgate de códigos do Free Fire está temporariamente suspenso para manutenção e atualização do sistema. Por favor, tente novamente mais tarde!'
  });
});

// Get Free Fire PINs Stock / Status
app.get('/api/services/freefire-status', (req: Request, res: Response) => {
  return res.json({
    total: 0,
    available: 0,
    claimed: 0,
    outOfStock: true,
    isMaintenance: true,
    message: 'Serviço em manutenção temporária'
  });
});

// ==============================================
// REAL-TIME REVIEWS & EVALUATIONS ENDPOINTS
// ==============================================

// GET Reviews and Stats for Services
app.get('/api/reviews', (req: Request, res: Response) => {
  try {
    const service = req.query.service as 'prime' | 'paramount' | 'freefire' | undefined;
    const stats = db.getServiceReviewStats(service);
    return res.json({ stats });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao carregar avaliações.' });
  }
});

// POST Submit a New Service Review
app.post('/api/reviews', (req: Request, res: Response) => {
  try {
    const { service, rating, status, comment, userName } = req.body;

    if (!service || !['prime', 'paramount', 'freefire', 'crunchyroll'].includes(service)) {
      return res.status(400).json({ error: 'Serviço inválido para avaliação.' });
    }

    if (!status || !['working', 'not_working'].includes(status)) {
      return res.status(400).json({ error: 'Status da avaliação é obrigatório (Consegui / Não consegui).' });
    }

    const userIp = getClientIp(req);
    const userAgent = req.headers['user-agent'] || '';
    
    // Detect browser
    let browser = 'Outro Navegador';
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      browser = 'Google Chrome';
    } else if (userAgent.includes('Edg')) {
      browser = 'Microsoft Edge';
    } else if (userAgent.includes('Firefox')) {
      browser = 'Mozilla Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browser = 'Apple Safari';
    }

    // Identify user if logged in token present
    let userId: string | undefined = undefined;
    let userEmail: string | undefined = undefined;
    
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = decoded.id;
        userEmail = decoded.email;
      } catch (e) {
        // Optional auth
      }
    }

    const review = db.addServiceReview(
      service,
      Number(rating) || 5,
      status,
      comment || '',
      userName,
      userEmail,
      userIp,
      browser,
      userId
    );

    const updatedStats = db.getServiceReviewStats(service);

    return res.json({
      success: true,
      message: '⭐ Sua avaliação foi registrada em tempo real com sucesso! Obrigado pelo feedback.',
      review,
      stats: updatedStats
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao registrar avaliação.' });
  }
});

// Get User's Active Accesses History
app.get('/api/services/user-accesses', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const userIp = getClientIp(req);
    const accessLogs = db.getAccessLogs(user.id);
    const payments = db.getPayments(user.id);
    const limitCheck = db.checkPrimeGenerationLimit(user.id, userIp);

    return res.json({
      accessLogs,
      payments,
      primeBlocked: limitCheck.isBlocked,
      clientIp: userIp
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao carregar histórico de acessos.' });
  }
});

// ==============================================
// 3. NETFLIX PAYMENTS & TON INTEGRATION
// ==============================================

// Create Netflix Payment Request (R$ 10,00)
app.post('/api/payments/create-netflix-order', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const netflixCreds = db.getCredential('netflix');
    const payment = db.createPayment(user.id, user.email, 10.00);

    const tonLink = netflixCreds.tonLink || 'https://payment-link-v3.ton.com.br/pl_gE0bN7eV8MQWxR0U6CMo3lvZYxz2p9qO';

    return res.json({
      success: true,
      paymentId: payment.id,
      amount: payment.amount,
      status: payment.status,
      tonPaymentLink: tonLink,
      pixCode: payment.pixCode,
      message: 'Pedido de acesso Netflix gerado. Realize o pagamento de R$ 10,00 para liberar o acesso.',
      instructions: 'Após concluir o pagamento pelo link Ton ou código PIX, clique em "Verificar Pagamento".'
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao criar pedido de pagamento.' });
  }
});

// Check Payment Status
app.get('/api/payments/status/:paymentId', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    const payment = db.getPaymentById(paymentId);

    if (!payment) {
      return res.status(404).json({ error: 'Pagamento não localizado.' });
    }

    return res.json({
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount,
      updatedAt: payment.updatedAt,
      credentials: payment.status === 'APROVADO' ? payment.credentials : null
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao verificar status do pagamento.' });
  }
});

// Verify & Auto Approve Payment (or simulate confirmation)
app.post('/api/payments/verify/:paymentId', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    const payment = db.getPaymentById(paymentId);

    if (!payment) {
      return res.status(404).json({ error: 'Pagamento não encontrado.' });
    }

    if (payment.status === 'APROVADO') {
      return res.json({
        approved: true,
        message: 'Pagamento aprovado!',
        credentials: payment.credentials
      });
    }

    // Auto-approve rule for seamless test/demo or verified payment
    const approved = db.approvePayment(payment.id);

    return res.json({
      approved: true,
      message: 'Pagamento confirmado e aprovado com sucesso!',
      credentials: approved.credentials
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao validar o pagamento.' });
  }
});

// Ton Webhook Callback endpoint
app.post('/api/payments/webhook', (req: Request, res: Response) => {
  try {
    const { paymentId, status, transactionId } = req.body;
    console.log('[Ton Webhook Recebido]:', req.body);

    if (paymentId) {
      if (status === 'PAID' || status === 'APPROVED' || status === 'APROVADO') {
        db.approvePayment(paymentId);
      } else if (status === 'CANCELLED' || status === 'REJECTED') {
        db.updatePaymentStatus(paymentId, 'REJEITADO');
      }
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('Erro no webhook Ton:', err);
    return res.status(500).json({ error: 'Webhook processing error' });
  }
});

// Test Endpoint: Simulate instant payment approval for demo testing
app.post('/api/payments/simulate-confirm', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentId } = req.body;
    if (!paymentId) return res.status(400).json({ error: 'Payment ID is required' });

    const updated = db.approvePayment(paymentId);
    return res.json({
      success: true,
      message: 'Pagamento aprovado via simulador Ton!',
      credentials: updated.credentials
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Erro ao simular aprovação' });
  }
});

// ==============================================
// WALLET BALANCE ENDPOINTS
// ==============================================

// GET User Balance
app.get('/api/wallet/balance', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const balance = db.getUserWalletBalance(user.id);
    return res.json({
      success: true,
      balance,
      email: user.email,
      name: user.name
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao consultar saldo da carteira.' });
  }
});

// GET All Users Wallet Balances (Admin)
app.get('/api/wallet/users', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = db.getUsers().map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      status: u.status,
      walletBalance: u.walletBalance || 0.00,
      createdAt: u.createdAt
    }));
    return res.json({ success: true, users });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar lista de usuários.' });
  }
});

// POST Add / Adjust Wallet Balance (Admin)
app.post('/api/wallet/add-balance', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userEmail, amount } = req.body;
    if (!userEmail || amount === undefined || isNaN(Number(amount))) {
      return res.status(400).json({ error: 'Informe o e-mail do usuário e o valor do saldo.' });
    }

    const numAmount = parseFloat(Number(amount).toFixed(2));
    const result = db.addWalletBalance(userEmail.trim(), numAmount);

    if (!result.success) {
      return res.status(404).json({ error: 'Usuário não encontrado com o e-mail informado.' });
    }

    return res.json({
      success: true,
      message: `Saldo de R$ ${numAmount.toFixed(2)} ${numAmount >= 0 ? 'adicionado' : 'descontado'} com sucesso para ${userEmail}!`,
      newBalance: result.newBalance
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao ajustar saldo do usuário.' });
  }
});

// ==============================================
// SMM PANEL API INTEGRATION (HypeSMM Protocol)
// ==============================================

// GET Supplier Real API Balance (HypeSMM action: 'balance')
app.get('/api/smm/supplier-balance', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const config = db.getSmmConfig();
    const apiUrl = config.apiUrl || 'https://hypesmm.online/api/v2';
    const apiKey = config.apiKey || '8f7c256d22e85aa44d3b357bbeb59762';

    if (!apiKey) {
      return res.json({
        success: false,
        balance: '0.00',
        currency: 'BRL',
        error: 'Chave de API (API Key) não configurada.'
      });
    }

    const params = new URLSearchParams();
    params.append('key', apiKey);
    params.append('action', 'balance');

    const providerRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: params.toString()
    });

    if (!providerRes.ok) {
      const statusText = providerRes.status === 401 ? 'Chave API Inválida/Não Autorizada na HypeSMM' : `HTTP ${providerRes.status}`;
      return res.json({
        success: false,
        balance: '0.00',
        currency: 'BRL',
        error: `Fornecedor HypeSMM retornou ${statusText}`
      });
    }

    const data = await providerRes.json();
    if (data.error) {
      return res.json({
        success: false,
        balance: '0.00',
        currency: 'BRL',
        error: data.error
      });
    }

    return res.json({
      success: true,
      balance: data.balance || '0.00',
      currency: data.currency || 'BRL',
      raw: data
    });
  } catch (err: any) {
    return res.json({
      success: false,
      balance: '0.00',
      currency: 'BRL',
      error: `Erro ao consultar fornecedor: ${err.message || 'Falha na conexão com a HypeSMM'}`
    });
  }
});

// GET SMM Config (Admin)
// GET SMM Config (Admin - Full config including password field for editing)
app.get('/api/admin/smm/config', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const config = db.getSmmConfig();
  return res.json({
    success: true,
    config
  });
});

// GET Public/User SMM Config (Sanitized - NEVER exposes API Key)
app.get('/api/smm/config', (req: Request, res: Response) => {
  const config = db.getSmmConfig();
  return res.json({
    apiUrl: config.apiUrl,
    enabled: config.enabled,
    cooldownHours: config.cooldownHours || 24,
    freeTrialQty: config.freeTrialQty || 50,
    disabledCategories: config.disabledCategories || [],
    disabledServices: config.disabledServices || [],
    lastSyncAt: config.lastSyncAt,
    lastApiStatus: config.lastApiStatus || 'offline',
    lastServicesCount: config.lastServicesCount || 0
  });
});

// POST Update SMM Config (Admin)
app.post('/api/admin/smm/config', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { apiUrl, apiKey, cooldownHours, profitMargin, currencyRate, autoSync, enabled, testMode } = req.body;
    const updated = db.updateSmmConfig({
      ...(apiUrl && { apiUrl: apiUrl.trim() }),
      ...(apiKey !== undefined && { apiKey: apiKey.trim() }),
      ...(cooldownHours !== undefined && { cooldownHours: Number(cooldownHours) || 24 }),
      ...(profitMargin !== undefined && { profitMargin: parseFloat(profitMargin) }),
      ...(currencyRate !== undefined && { currencyRate: parseFloat(currencyRate) }),
      ...(autoSync !== undefined && { autoSync }),
      ...(enabled !== undefined && { enabled }),
      ...(testMode !== undefined && { testMode })
    });

    db.addSmmSyncLog('info', 'Configurações da API atualizadas pelo administrador.');
    return res.json({ success: true, message: 'Configurações da API salvas com sucesso!', config: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Erro ao salvar configurações da API.' });
  }
});

// POST Test API Connection (Admin - Consults Balance & Services List)
app.post('/api/admin/smm/test-connection', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const config = db.getSmmConfig();
    const apiUrl = req.body.apiUrl || config.apiUrl || 'https://verifiedatacado.com/api/v2';
    const apiKey = req.body.apiKey || config.apiKey;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        online: false,
        error: 'Chave de API não informada. Preencha a API Key nas configurações.'
      });
    }

    const startTime = Date.now();

    // 1. Check Balance
    const balanceParams = new URLSearchParams();
    balanceParams.append('key', apiKey);
    balanceParams.append('action', 'balance');

    const balanceRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
      },
      body: balanceParams.toString()
    });

    const latencyMs = Date.now() - startTime;

    if (!balanceRes.ok) {
      db.updateSmmConfig({ lastApiStatus: 'offline' });
      db.addSmmSyncLog('error', `Falha no teste de conexão (HTTP ${balanceRes.status})`);
      return res.json({
        success: false,
        online: false,
        error: `Servidor da API retornou erro HTTP ${balanceRes.status}`,
        latencyMs
      });
    }

    const balanceData = await balanceRes.json();
    if (balanceData.error) {
      db.updateSmmConfig({ lastApiStatus: 'offline' });
      db.addSmmSyncLog('error', `Erro na chave da API: ${balanceData.error}`);
      return res.json({
        success: false,
        online: false,
        error: `Erro retornado pela API: ${balanceData.error}`,
        latencyMs
      });
    }

    // 2. Check Services Count
    const servicesParams = new URLSearchParams();
    servicesParams.append('key', apiKey);
    servicesParams.append('action', 'services');

    const servicesRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
      },
      body: servicesParams.toString()
    });

    let servicesCount = 0;
    if (servicesRes.ok) {
      const servicesData = await servicesRes.json();
      if (Array.isArray(servicesData)) {
        servicesCount = servicesData.length;
      }
    }

    const formattedBalance = balanceData.balance || balanceData.amount || '0.00';
    const currency = balanceData.currency || 'BRL';
    const lastSyncAt = new Date().toISOString();

    db.updateSmmConfig({
      lastApiStatus: 'online',
      lastApiBalance: `${currency} ${formattedBalance}`,
      lastServicesCount: servicesCount,
      lastSyncAt
    });

    db.addSmmSyncLog(
      'test',
      `Teste de conexão BEM-SUCEDIDO. API Online (${latencyMs}ms). Saldo: ${currency} ${formattedBalance}. Serviços na API: ${servicesCount}.`
    );

    return res.json({
      success: true,
      online: true,
      balance: formattedBalance,
      currency,
      servicesCount,
      latencyMs,
      timestamp: lastSyncAt,
      message: '✅ Conexão estabelecida com sucesso! API Online e operacional.'
    });
  } catch (err: any) {
    db.updateSmmConfig({ lastApiStatus: 'offline' });
    db.addSmmSyncLog('error', `Exceção no teste de conexão: ${err.message || 'Falha de rede'}`);
    return res.json({
      success: false,
      online: false,
      error: `Erro ao comunicar com a API: ${err.message || 'Servidor indisponível'}`,
      latencyMs: 999
    });
  }
});

// POST Toggle Category Disabled
app.post('/api/admin/smm/category/toggle', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { categoryName } = req.body;
  if (!categoryName) return res.status(400).json({ error: 'Nome da categoria obrigatório.' });
  const updated = db.toggleSmmCategoryDisabled(categoryName);
  return res.json({ success: true, disabledCategories: updated });
});

// POST Toggle Service Disabled
app.post('/api/admin/smm/service/toggle', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { serviceId } = req.body;
  if (!serviceId) return res.status(400).json({ error: 'ID do serviço obrigatório.' });
  const updated = db.toggleSmmServiceDisabled(Number(serviceId));
  return res.json({ success: true, disabledServices: updated });
});

// Helper for SMM Catalog Synchronization
async function performSmmCatalogSync(overrideApiUrl?: string, overrideApiKey?: string) {
  try {
    const config = db.getSmmConfig();
    const apiUrl = overrideApiUrl || config.apiUrl || 'https://verifiedatacado.com/api/v2';
    const apiKey = overrideApiKey || config.apiKey || 'fdd634b7dace29b68e6ac06a947e0407';

    if (!apiKey) {
      return { success: false, servicesCount: 0, error: 'Chave de API não informada.' };
    }

    const params = new URLSearchParams();
    params.append('key', apiKey);
    params.append('action', 'services');

    const providerRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
      },
      body: params.toString()
    });

    if (!providerRes.ok) {
      const statusText = providerRes.status === 401 ? 'Chave de API inválida ou não autorizada (HTTP 401)' : `HTTP ${providerRes.status}`;
      db.updateSmmConfig({ lastApiStatus: 'offline' });
      db.addSmmSyncLog('error', `Falha na sincronização do catálogo: ${statusText}`);
      return { success: false, servicesCount: 0, error: `Servidor da API retornou: ${statusText}` };
    }

    const rawData = await providerRes.json();
    if (!Array.isArray(rawData)) {
      if (rawData?.error) {
        db.updateSmmConfig({ lastApiStatus: 'offline' });
        db.addSmmSyncLog('error', `Erro na sincronização: ${rawData.error}`);
        return { success: false, servicesCount: 0, error: `Erro do Fornecedor: ${rawData.error}` };
      }
      return { success: false, servicesCount: 0, error: 'Resposta inválida recebida da API do fornecedor.' };
    }

    const margin = config.profitMargin || 2.0;
    const rateMultiplier = config.currencyRate || 1.0;

    const processedServices = rawData.map((s: any) => {
      const originalRate = parseFloat(s.rate) || 0;
      const retailRate = parseFloat((originalRate * rateMultiplier * margin).toFixed(2));

      return {
        id: `smm_${s.service}`,
        serviceId: Number(s.service),
        name: s.name || `Serviço #${s.service}`,
        category: s.category || 'Geral',
        originalRate,
        rate: retailRate,
        min: parseInt(s.min) || 10,
        max: parseInt(s.max) || 100000,
        refill: Boolean(s.refill),
        cancel: Boolean(s.cancel),
        type: s.type || 'Default',
        description: s.name,
        enabled: true
      };
    });

    db.updateSmmServices(processedServices);
    const lastSyncAt = new Date().toISOString();
    db.updateSmmConfig({
      lastSyncAt,
      lastServicesCount: processedServices.length,
      lastApiStatus: 'online'
    });

    db.addSmmSyncLog('sync', `Sincronização concluída com sucesso! ${processedServices.length} serviços atualizados.`);
    console.log(`[SMM Catalog Sync] ${processedServices.length} serviços importados e salvos.`);

    return {
      success: true,
      servicesCount: processedServices.length,
      timestamp: lastSyncAt,
      message: `Catálogo sincronizado com sucesso! ${processedServices.length} serviços importados e atualizados.`
    };
  } catch (err: any) {
    console.error('Erro na sincronização:', err);
    db.updateSmmConfig({ lastApiStatus: 'offline' });
    db.addSmmSyncLog('error', `Exceção na sincronização: ${err.message || 'Erro de rede'}`);
    return {
      success: false,
      servicesCount: 0,
      error: `Erro ao conectar com a API: ${err.message || 'Falha de conexão'}`
    };
  }
}

// GET SMM Active Catalog
app.get(['/api/smm/catalog', '/api/smm/services'], async (req: Request, res: Response) => {
  try {
    const config = db.getSmmConfig();
    let services = db.getAllSmmServices();

    // If services in database is empty, auto-fetch from Verified Atacado supplier API
    if (!services || services.length === 0) {
      console.log('[SMM Catalog] Banco de dados vazio. Auto-sincronizando catálogo com a API Verified Atacado...');
      const syncResult = await performSmmCatalogSync();
      if (syncResult.success) {
        services = db.getAllSmmServices();
      }
    }

    // Filter disabled categories & disabled services for user catalog (unless admin=true)
    const isAdminQuery = req.query.admin === 'true';
    if (!isAdminQuery) {
      const disabledServices = config.disabledServices || [];
      const disabledCategories = config.disabledCategories || [];
      services = services.filter(s => {
        if (s.enabled === false) return false;
        if (disabledServices.includes(s.serviceId)) return false;
        if (disabledCategories.includes(s.category)) return false;
        return true;
      });
    }

    const categoriesMap = new Map<string, typeof services>();
    services.forEach(s => {
      const cat = s.category || 'Outros Serviços';
      if (!categoriesMap.has(cat)) {
        categoriesMap.set(cat, []);
      }
      categoriesMap.get(cat)!.push(s);
    });

    const categories = Array.from(categoriesMap.entries()).map(([name, items]) => ({
      name,
      count: items.length,
      services: items
    }));

    return res.json({
      success: true,
      enabled: config.enabled,
      marginMultiplier: config.profitMargin,
      currencyRate: config.currencyRate,
      testMode: config.testMode,
      totalServices: services.length,
      categories,
      services
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao carregar catálogo SMM.' });
  }
});

// POST Sync Catalog with Supplier API (action: 'services')
app.post('/api/smm/sync', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const result = await performSmmCatalogSync(req.body?.apiUrl, req.body?.apiKey);
  if (result.success) {
    return res.json(result);
  } else {
    return res.status(400).json(result);
  }
});

// GET User's Free Trial Status & Remaining Cooldown
app.get('/api/smm/my-trial-status', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const userIp = getClientIp(req);
    const config = db.getSmmConfig();
    const isAdmin = user.role === 'admin';
    const check = db.checkFreeTrialEligibility(user.id, userIp, undefined, isAdmin);

    return res.json({
      success: true,
      eligible: check.eligible,
      remainingMs: check.remainingMs || 0,
      userIp,
      cooldownHours: config.cooldownHours || 24,
      freeTrialQty: config.freeTrialQty || 50,
      reason: check.reason
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao verificar status do teste gratuito.' });
  }
});

// POST Admin Reset Trial Claims / Cooldowns
app.post('/api/admin/smm/reset-trials', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, ip } = req.body || {};
    db.clearFreeTrialClaims(userId, ip);
    return res.json({
      success: true,
      message: '⚡ Cooldowns de testes grátis resetados e liberados com sucesso!'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao resetar histórico de testes grátis.' });
  }
});

// GET Verified Atacado Supplier Balance (action: 'balance')
app.get('/api/smm/balance', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const config = db.getSmmConfig();
    const apiUrl = config.apiUrl || 'https://verifiedatacado.com/api/v2';
    const apiKey = config.apiKey || 'fdd634b7dace29b68e6ac06a947e0407';

    const startTime = Date.now();
    const params = new URLSearchParams();
    params.append('key', apiKey);
    params.append('action', 'balance');

    const supplierRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
      },
      body: params.toString()
    });

    const latencyMs = Date.now() - startTime;

    if (!supplierRes.ok) {
      return res.json({
        success: false,
        online: false,
        balance: '0.00',
        currency: 'BRL',
        latencyMs,
        error: `HTTP ${supplierRes.status}`
      });
    }

    const supplierData = await supplierRes.json();
    return res.json({
      success: true,
      online: true,
      balance: supplierData.balance || supplierData.amount || '0.00',
      currency: supplierData.currency || 'BRL',
      latencyMs
    });
  } catch (err: any) {
    return res.json({
      success: false,
      online: false,
      balance: '0.00',
      currency: 'BRL',
      latencyMs: 999,
      error: err.message || 'Erro de conexão com Verified Atacado'
    });
  }
});

// POST Free Trial (50 Units - Fixed Quantity, Free Cost, 24h & IP Lock)
app.post('/api/smm/free-trial', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const userIp = getClientIp(req);
    const { serviceId, link, type } = req.body;

    if (!link || typeof link !== 'string' || !link.trim()) {
      return res.status(400).json({ error: 'Informe o link válido do seu perfil ou publicação.' });
    }

    const config = db.getSmmConfig();
    const FIXED_QTY = config.freeTrialQty || 50; // Strict 50 units backend lock
    const isAdmin = user.role === 'admin';

    // 1. Check 24-hour & IP Eligibility Lock
    const check = db.checkFreeTrialEligibility(user.id, userIp, undefined, isAdmin);
    if (!check.eligible) {
      return res.status(400).json({
        success: false,
        isBlocked: true,
        remainingMs: check.remainingMs,
        error: check.reason || "❌ BLOQUEADO: Você já resgatou seu teste gratuito hoje. Aguarde o tempo restante de cooldown."
      });
    }

    // 2. Ensure catalog is loaded from Verified Atacado
    let services = db.getAllSmmServices();
    if (!services || services.length === 0) {
      await performSmmCatalogSync();
      services = db.getAllSmmServices();
    }

    // Locate service in catalog
    let chosenService = services.find(s => s.serviceId === Number(serviceId));

    if (!chosenService && type) {
      chosenService = services.find(s => {
        const cat = (s.category || '').toLowerCase();
        const name = (s.name || '').toLowerCase();
        if (type === 'followers') return cat.includes('seguidor') || name.includes('seguidor');
        return cat.includes('curtida') || name.includes('curtida');
      });
    }

    if (!chosenService && services.length > 0) {
      chosenService = services.find(s => s.enabled !== false) || services[0];
    }

    let numServiceId = chosenService ? chosenService.serviceId : (Number(serviceId) || 101);
    let serviceName = chosenService ? chosenService.name : '50 Unidades Engajamento (Teste Grátis)';
    let serviceCategory = chosenService ? chosenService.category : 'Catálogo Gratuito 24h';

    // 3. Record claim lock in DB (User ID + IP)
    db.addFreeTrialClaim(user.id, user.email, userIp, type || 'followers');

    // 4. Send Order Directly to Verified Atacado API (action: 'add')
    const apiUrl = config.apiUrl || 'https://verifiedatacado.com/api/v2';
    const apiKey = config.apiKey || 'fdd634b7dace29b68e6ac06a947e0407';

    let supplierOrderId: string | number | undefined;
    let orderStatus: SmmOrder['status'] = 'PROCESSANDO';

    const sendOrderToSupplier = async (sId: number) => {
      const params = new URLSearchParams();
      params.append('key', apiKey);
      params.append('action', 'add');
      params.append('service', String(sId));
      params.append('link', link.trim());
      params.append('quantity', String(FIXED_QTY));

      const apiRes = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
        },
        body: params.toString()
      });
      return await apiRes.json();
    };

    try {
      let apiData = await sendOrderToSupplier(numServiceId);

      // Handle incorrect_service_id by auto-refreshing catalog and retrying with a fresh service ID
      if (apiData?.error === 'error.incorrect_service_id') {
        console.log(`[SMM Free-Trial] Service ID #${numServiceId} falhou (${apiData.error}). Sincronizando catálogo...`);
        const syncRes = await performSmmCatalogSync();
        if (syncRes.success && syncRes.servicesCount > 0) {
          const freshServices = db.getAllSmmServices();
          const freshMatched = freshServices.find(s => {
            const cat = (s.category || '').toLowerCase();
            const name = (s.name || '').toLowerCase();
            if (type === 'followers') return cat.includes('seguidor') || name.includes('seguidor');
            return cat.includes('curtida') || name.includes('curtida');
          }) || freshServices[0];

          if (freshMatched && freshMatched.serviceId !== numServiceId) {
            console.log(`[SMM Free-Trial] Tentando novamente com novo ID #${freshMatched.serviceId} (${freshMatched.name})...`);
            numServiceId = freshMatched.serviceId;
            serviceName = freshMatched.name;
            serviceCategory = freshMatched.category;
            apiData = await sendOrderToSupplier(numServiceId);
          }
        }
      }

      if (apiData && apiData.order) {
        supplierOrderId = apiData.order;
        orderStatus = 'PROCESSANDO';
        console.log(`[SMM Free-Trial API] Pedido #${apiData.order} criado na Verified Atacado!`);

        // Check updated balance from Verified Atacado immediately to reflect balance deduction
        try {
          const balParams = new URLSearchParams();
          balParams.append('key', apiKey);
          balParams.append('action', 'balance');
          const balRes = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
            },
            body: balParams.toString()
          });
          if (balRes.ok) {
            const balData = await balRes.json();
            const newBal = balData?.balance || balData?.amount;
            if (newBal !== undefined) {
              db.updateSmmConfig({
                lastApiBalance: String(newBal),
                lastApiStatus: 'online'
              });
            }
          }
        } catch (balErr) {
          console.error('[SMM Free-Trial] Erro ao atualizar saldo após pedido:', balErr);
        }

        db.addSmmSyncLog('info', `[Teste Grátis enviado] Pedido #${apiData.order} criado na Verified Atacado. Cliente: ${user.email}, Qtd: ${FIXED_QTY}`);
      } else {
        const errorDetail = apiData?.error || 'Erro do provedor';
        console.log('[SMM Free-Trial] Resposta do provedor:', apiData);
        supplierOrderId = `PENDING_${Math.floor(100000 + Math.random() * 900000)}`;
        orderStatus = 'PENDENTE_APROVACAO';

        db.addSmmSyncLog('error', `[Teste Grátis Pendente] Não foi possível enviar automaticamente à Verified Atacado (${errorDetail}). Registrado para aprovação.`);
      }
    } catch (apiErr: any) {
      console.error('[SMM Free-Trial API Error]', apiErr);
      supplierOrderId = `PENDING_${Math.floor(100000 + Math.random() * 900000)}`;
      orderStatus = 'PENDENTE_APROVACAO';
      db.addSmmSyncLog('error', `[Teste Grátis Erro Conexão] ${apiErr.message || 'Erro de rede'}`);
    }

    // 5. Save Order Record
    const order = db.addSmmOrder(
      user.id,
      user.email,
      numServiceId,
      serviceName,
      serviceCategory,
      link.trim(),
      FIXED_QTY,
      0.00,
      supplierOrderId,
      orderStatus,
      true
    );

    return res.json({
      success: true,
      message: `🎉 Pedido de teste gratuito de 50 unidades registrado com sucesso! Seu pedido está sendo processado.`,
      order
    });
  } catch (err: any) {
    console.error('Erro ao processar teste grátis:', err);
    return res.status(500).json({ error: 'Erro interno ao processar teste gratuito.' });
  }
});

// POST Request Refill (action: 'refill')
app.post('/api/smm/refill', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'ID do pedido obrigatório.' });
    }

    const orders = db.getSmmOrders();
    const order = orders.find(o => o.id === orderId || String(o.supplierOrderId) === String(orderId));

    if (!order || !order.supplierOrderId) {
      return res.status(404).json({ error: 'Pedido não possui ID de fornecedor elegível para reposição.' });
    }

    const config = db.getSmmConfig();
    const apiUrl = config.apiUrl || 'https://verifiedatacado.com/api/v2';
    const apiKey = config.apiKey || 'fdd634b7dace29b68e6ac06a947e0407';

    const params = new URLSearchParams();
    params.append('key', apiKey);
    params.append('action', 'refill');
    params.append('order', String(order.supplierOrderId));

    const refillRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
      },
      body: params.toString()
    });

    const refillData = await refillRes.json();
    if (refillData.refill) {
      db.updateSmmOrderRefill(order.id, refillData.refill);
      return res.json({
        success: true,
        message: `🔄 Solicitação de reposição enviada com sucesso! ID da Reposição: ${refillData.refill}`,
        refillId: refillData.refill
      });
    } else {
      return res.status(400).json({
        success: false,
        error: refillData.error || 'A reposição não está disponível no momento para este pedido.'
      });
    }
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao solicitar reposição.' });
  }
});

// POST Paid Order (Using User Wallet Balance - Pending Admin Approval)
app.post('/api/smm/order', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { serviceId, link, quantity } = req.body;

    if (!serviceId || !link || !quantity) {
      return res.status(400).json({ error: 'Informe o serviço, o link do perfil/publicação e a quantidade desejada.' });
    }

    const numServiceId = Number(serviceId);
    const numQty = parseInt(quantity);

    if (isNaN(numQty) || numQty <= 0) {
      return res.status(400).json({ error: 'Quantidade inválida.' });
    }

    const service = db.getSmmServiceById(numServiceId);
    if (!service) {
      return res.status(404).json({ error: 'Serviço de engajamento não encontrado no catálogo.' });
    }

    if (numQty < service.min || numQty > service.max) {
      return res.status(400).json({
        error: `Quantidade fora do limite permitido. Mínimo: ${service.min.toLocaleString('pt-BR')} e Máximo: ${service.max.toLocaleString('pt-BR')}.`
      });
    }

    // Calculate total cost
    const totalCost = parseFloat(((service.rate / 1000) * numQty).toFixed(2));

    // Deduct/hold cost from User Wallet Balance
    const deduction = db.deductWalletBalance(user.id, totalCost);
    if (!deduction.success) {
      return res.status(400).json({
        success: false,
        insufficientBalance: true,
        requiredAmount: totalCost,
        userBalance: deduction.newBalance,
        tonRechargeLink: 'https://payment-link-v3.ton.com.br/pl_gE0bN7eV8MQWxR0U6CMo3lvZYxz2p9qO',
        error: deduction.message || 'Saldo insuficiente em sua carteira. Recarregue no mínimo R$ 10,00 para continuar.'
      });
    }

    // Save order in DB with status: 'PENDENTE_APROVACAO' (Manual approval by Admin)
    const pendingSupplierId = `PENDING_${Math.floor(100000 + Math.random() * 900000)}`;
    const order = db.addSmmOrder(
      user.id,
      user.email,
      numServiceId,
      service.name,
      service.category,
      link.trim(),
      numQty,
      totalCost,
      pendingSupplierId,
      'PENDENTE_APROVACAO',
      false
    );

    console.log(`[SMM Paid Order] Pedido ${order.id} registrado com status PENDENTE_APROVACAO (R$ ${totalCost}).`);

    return res.json({
      success: true,
      message: 'Pedido realizado com sucesso e saldo reservado! Aguardando aprovação da equipe para envio.',
      newBalance: deduction.newBalance,
      order
    });
  } catch (err: any) {
    console.error('Erro ao processar pedido SMM:', err);
    return res.status(500).json({ error: 'Erro interno ao processar pedido.' });
  }
});

// ADMIN ACTION 1: APPROVE ORDER & DISPATCH TO HYPESMM API
app.post('/api/admin/smm/orders/:id/approve', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orderId = req.params.id;
    const orders = db.getSmmOrders();
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    const config = db.getSmmConfig();
    const apiUrl = config.apiUrl || 'https://verifiedatacado.com/api/v2';
    const apiKey = config.apiKey || 'fdd634b7dace29b68e6ac06a947e0407';

    const params = new URLSearchParams();
    params.append('key', apiKey);
    params.append('action', 'add');
    params.append('service', String(order.serviceId));
    params.append('link', order.link.trim());
    params.append('quantity', String(order.quantity));

    console.log(`[Admin Approve] Enviando pedido ${order.id} para Verified Atacado API: service=${order.serviceId}, qty=${order.quantity}, link=${order.link}`);

    const supplierRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: params.toString()
    });

    const supplierData = await supplierRes.json();
    console.log('[Admin Approve] Resposta da API Verified Atacado:', supplierData);

    if (supplierData.order) {
      const updated = db.updateSmmOrderStatus(order.id, 'PROCESSANDO', supplierData.order);

      // Refresh balance
      try {
        const balParams = new URLSearchParams();
        balParams.append('key', apiKey);
        balParams.append('action', 'balance');
        const balRes = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: balParams.toString()
        });
        if (balRes.ok) {
          const balData = await balRes.json();
          const newBal = balData?.balance || balData?.amount;
          if (newBal !== undefined) {
            db.updateSmmConfig({ lastApiBalance: String(newBal), lastApiStatus: 'online' });
          }
        }
      } catch (balErr) {
        console.error('[Admin Approve] Erro ao atualizar saldo após aprovação:', balErr);
      }

      db.addSmmSyncLog('info', `[Aprovação Admin] Pedido #${order.id} aprovado e enviado à Verified Atacado (ID Fornecedor: #${supplierData.order})`);

      return res.json({
        success: true,
        message: `✅ Pedido #${order.id} APROVADO e enviado para a Verified Atacado com sucesso! (ID Fornecedor: ${supplierData.order})`,
        supplierOrderId: supplierData.order,
        order: updated || order
      });
    } else {
      console.error('❌ Erro retornado pela API Verified Atacado ao aprovar pedido:', supplierData.error || supplierData);
      db.addSmmSyncLog('error', `[Aprovação Falhou] Erro ao enviar pedido #${order.id} à Verified Atacado: ${supplierData.error || 'Desconhecido'}`);
      return res.status(400).json({
        success: false,
        error: `Erro da API Verified Atacado ao aprovar pedido: ${supplierData.error || 'Erro desconhecido'}`,
        supplierError: supplierData.error,
        supplierResponse: supplierData
      });
    }
  } catch (err: any) {
    console.error('Falha ao aprovar pedido e conectar com HypeSMM:', err);
    return res.status(502).json({
      error: `Falha na conexão com a API HypeSMM: ${err.message || 'Erro de rede'}`
    });
  }
});

// ADMIN ACTION 2: MARK COMPLETED MANUALLY
app.post('/api/admin/smm/orders/:id/complete', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const orderId = req.params.id;
    const updated = db.updateSmmOrderStatus(orderId, 'CONCLUIDO');
    if (!updated) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }
    return res.json({
      success: true,
      message: `🔵 Pedido #${orderId} marcado como CONCLUÍDO manualmente.`,
      order: updated
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao marcar pedido como concluído.' });
  }
});

// ADMIN ACTION 3: CANCEL & REFUND ORDER
app.post('/api/admin/smm/orders/:id/cancel', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const orderId = req.params.id;
    const orders = db.getSmmOrders();
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    // Refund wallet balance if order was paid and not free trial
    let refundMessage = '';
    if (order.cost > 0 && !order.isFreeTrial) {
      db.addWalletBalance(order.userId, order.cost);
      refundMessage = `Valor de R$ ${order.cost.toFixed(2)} foi estornado para a carteira do cliente.`;
    }

    const updated = db.updateSmmOrderStatus(order.id, 'CANCELADO');

    return res.json({
      success: true,
      message: `🔴 Pedido #${orderId} RECUSADO/CANCELADO com sucesso. ${refundMessage}`,
      order: updated || order
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao recusar/cancelar pedido.' });
  }
});

// GET SMM Orders
app.get('/api/smm/orders', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const isAdmin = user.role === 'admin' || user.email === 'ronisouza495@gmail.com';
    const orders = isAdmin ? db.getSmmOrders() : db.getSmmOrders(user.id);

    return res.json({
      success: true,
      orders
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar pedidos.' });
  }
});

// DELETE SMM Order (User or Admin)
app.delete('/api/smm/orders/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const orderId = req.params.id;
    const isAdmin = user.role === 'admin' || user.email === 'ronisouza495@gmail.com';

    const deleted = db.deleteSmmOrder(orderId, user.id, isAdmin);
    if (!deleted) {
      return res.status(404).json({ error: 'Pedido não encontrado ou sem permissão para excluir.' });
    }

    return res.json({
      success: true,
      message: `🗑️ Pedido #${orderId} excluído com sucesso!`
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao excluir pedido.' });
  }
});

// ADMIN ACTION 4: DELETE SMM ORDER
app.delete('/api/admin/smm/orders/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const orderId = req.params.id;
    const deleted = db.deleteSmmOrder(orderId, undefined, true);
    if (!deleted) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    return res.json({
      success: true,
      message: `🗑️ Pedido #${orderId} removido permanentemente do banco de dados.`
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao excluir pedido no painel de administração.' });
  }
});

// POST Check SMM Order Status (HypeSMM action: 'status')
app.post('/api/smm/order/status', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'Informe o ID do pedido.' });
    }

    const config = db.getSmmConfig();
    const orders = db.getSmmOrders();
    const order = orders.find(o => o.id === orderId || String(o.supplierOrderId) === String(orderId));

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    if (config.apiKey && !config.testMode && order.supplierOrderId) {
      try {
        const params = new URLSearchParams();
        params.append('key', config.apiKey);
        params.append('action', 'status');
        params.append('order', String(order.supplierOrderId));

        const supplierRes = await fetch(config.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          body: params.toString()
        });

        const supplierData = await supplierRes.json();
        if (supplierData.status) {
          const statusMap: Record<string, any> = {
            'Pending': 'PENDENTE',
            'Processing': 'PROCESSANDO',
            'In progress': 'EM_ANDAMENTO',
            'Completed': 'CONCLUIDO',
            'Partial': 'PARCIAL',
            'Canceled': 'CANCELADO',
            'Cancelled': 'CANCELADO'
          };
          const mappedStatus = statusMap[supplierData.status] || 'EM_ANDAMENTO';
          db.updateSmmOrderStatus(order.id, mappedStatus);
          order.status = mappedStatus;
        }
      } catch (e) {
        console.warn('Erro ao verificar status na HypeSMM:', e);
      }
    }

    return res.json({
      success: true,
      order
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao verificar status do pedido.' });
  }
});

// ==============================================
// 4. ADMIN PANEL APIs (Exclusivo ronisouza495@gmail.com)
// ==============================================

app.get('/api/admin/stats', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = db.getAdminStats();
    return res.json(stats);
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao carregar métricas administrativas.' });
  }
});

app.get('/api/admin/users', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = db.getUsers().map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      lastIp: u.lastIp
    }));
    return res.json({ users });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao listar usuários.' });
  }
});

app.get('/api/admin/visitors', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const visitors = db.getVisitorLogs();
    return res.json({ visitors });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao listar histórico de acessos/visitantes.' });
  }
});

app.get('/api/admin/support/chats', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const chats = db.getAllSupportChatsGrouped();
    return res.json({ chats });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao carregar mensagens de suporte.' });
  }
});

app.post('/api/admin/support/reply', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, userEmail, text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Sua resposta não pode estar em branco.' });
    }

    const uId = userId || 'guest';
    const uEmail = userEmail || 'visitante@streamhub.com';

    // Get user info if exists
    let userName = 'Cliente VIP';
    const u = db.getUserById(uId) || db.getUserByEmail(uEmail);
    if (u) {
      userName = u.name;
    }

    const replyMsg = db.addSupportMessage(uId, userName, uEmail, 'admin', text.trim());
    db.markSupportMessagesRead(uId || uEmail);

    return res.json({ success: true, message: replyMsg });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao responder mensagem.' });
  }
});

app.post('/api/admin/support/read', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.body;
    if (userId) {
      db.markSupportMessagesRead(userId);
    }
    return res.json({ success: true });
  } catch (err: any) {
    return res.json({ success: false });
  }
});

app.get('/api/admin/access-logs', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const accessLogs = db.getAccessLogs();
    const enriched = accessLogs.map(a => {
      const u = db.getUserById(a.userId);
      return {
        ...a,
        userName: u ? u.name : (a.userEmail ? a.userEmail.split('@')[0] : 'Usuário VIP'),
      };
    });
    return res.json({ accessLogs: enriched });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao listar histórico de logins gerados.' });
  }
});

app.patch('/api/admin/users/:userId/status', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (status !== 'active' && status !== 'blocked') {
      return res.status(400).json({ error: 'Status deve ser active ou blocked.' });
    }

    const updated = db.updateUserStatus(userId, status);
    return res.json({ message: `Status do usuário alterado para ${status}`, user: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Erro ao alterar status.' });
  }
});

app.delete('/api/admin/users/:userId', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const user = db.getUserById(userId);

    if (user?.email.toLowerCase() === 'ronisouza495@gmail.com') {
      return res.status(400).json({ error: 'O administrador principal não pode ser excluído.' });
    }

    const deleted = db.deleteUser(userId);
    return res.json({ success: deleted, message: 'Usuário removido do sistema.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao remover usuário.' });
  }
});

app.get('/api/admin/payments', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const payments = db.getPayments();
    return res.json({ payments });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao listar pagamentos.' });
  }
});

app.post('/api/admin/payments/:paymentId/approve', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    const approved = db.approvePayment(paymentId);
    return res.json({
      message: 'Pagamento aprovado e credencial liberada ao cliente!',
      payment: approved
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Erro ao aprovar pagamento.' });
  }
});

app.post('/api/admin/payments/:paymentId/reject', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    const updated = db.updatePaymentStatus(paymentId, 'REJEITADO');
    return res.json({
      message: 'Pagamento rejeitado.',
      payment: updated
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Erro ao rejeitar pagamento.' });
  }
});

app.get('/api/admin/credentials', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const prime = db.getCredential('prime');
    const paramount = db.getCredential('paramount');
    const crunchyroll = db.getCredential('crunchyroll');
    const chatgpt = db.getCredential('chatgpt');
    const netflix = db.getCredential('netflix');
    return res.json({ prime, paramount, crunchyroll, chatgpt, netflix });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao buscar credenciais.' });
  }
});

app.put('/api/admin/credentials', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { serviceId, email, password, pin, screen, tonLink } = req.body;
    if (serviceId !== 'prime' && serviceId !== 'netflix' && serviceId !== 'paramount' && serviceId !== 'crunchyroll' && serviceId !== 'chatgpt') {
      return res.status(400).json({ error: 'serviceId inválido. Use prime, paramount, crunchyroll, chatgpt ou netflix.' });
    }

    db.updateCredential(serviceId, {
      email,
      password,
      pin,
      screen,
      tonLink
    });

    db.addAuditLog(req.user?.email || 'admin', `Atualização de Credencial: ${serviceId}`, serviceId, `Email: ${email}`);
    return res.json({ message: `Credenciais de ${serviceId.toUpperCase()} atualizadas com sucesso!` });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao atualizar credenciais.' });
  }
});

// ==============================================
// 4.5. PRODUCTS, NOTIFICATIONS, PROFILE & AUDIT LOGS
// ==============================================

// Products Catalog API
app.get('/api/products', (req: Request, res: Response) => {
  try {
    const products = db.getProducts();
    return res.json({ success: true, products });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao carregar produtos do catálogo.' });
  }
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  try {
    const product = db.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });
    return res.json({ success: true, product });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar detalhes do produto.' });
  }
});

app.post('/api/admin/products', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, category, price, image, banner, stockStatus, features, badge, isFree, instructions } = req.body;
    if (!name || !description) return res.status(400).json({ error: 'Nome e Descrição são obrigatórios.' });

    const newProd = db.addProduct({
      name,
      description,
      category: category || 'Streaming',
      price: Number(price) || 0,
      isFree: Boolean(isFree || Number(price) === 0),
      image: image || 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=800&q=80',
      banner,
      stockStatus: stockStatus || 'DISPONIVEL',
      rating: 5.0,
      features: features || [],
      badge,
      instructions: instructions || []
    });

    db.addAuditLog(req.user?.email || 'admin', 'Criou Produto', newProd.id, `Nome: ${name}`);
    return res.json({ success: true, product: newProd, message: 'Produto cadastrado com sucesso!' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao cadastrar produto.' });
  }
});

app.put('/api/admin/products/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Produto não encontrado.' });
    db.addAuditLog(req.user?.email || 'admin', 'Atualizou Produto', req.params.id, JSON.stringify(req.body));
    return res.json({ success: true, product: updated, message: 'Produto atualizado com sucesso!' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar produto.' });
  }
});

app.delete('/api/admin/products/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const removed = db.deleteProduct(req.params.id);
    if (!removed) return res.status(404).json({ error: 'Produto não encontrado.' });
    db.addAuditLog(req.user?.email || 'admin', 'Excluiu Produto', req.params.id);
    return res.json({ success: true, message: 'Produto removido com sucesso!' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao excluir produto.' });
  }
});

// Notifications API
app.get('/api/notifications', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const notifications = db.getNotifications(req.user?.id);
    return res.json({ success: true, notifications });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar notificações.' });
  }
});

app.post('/api/notifications/read', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    db.markNotificationsRead(req.user?.id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar notificações.' });
  }
});

// ==============================================
// ETAPA 2 — ADVANCED SaaS & MARKETPLACE API ROUTES
// ==============================================

// 1. ADVANCED DASHBOARD ANALYTICS
app.get('/api/admin/analytics', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const period = (req.query.period as any) || '30d';
    const analytics = db.getAdvancedAnalytics(period);
    return res.json({ success: true, analytics });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao gerar dados analíticos.' });
  }
});

// 2. ONLINE PRESENCE TRACKING
app.post('/api/track-presence', (req: Request, res: Response) => {
  try {
    const { userId, userEmail, userName, role, device, browser } = req.body;
    if (userId && userEmail) {
      db.trackUserPresence(userId, userEmail, userName || userEmail.split('@')[0], role || 'user', device, browser, getClientIp(req));
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao registrar presença.' });
  }
});

app.get('/api/admin/online-users', authenticateToken, requireSupport, (req: AuthenticatedRequest, res: Response) => {
  try {
    const online = db.getOnlineUsers();
    return res.json({ success: true, count: online.length, onlineUsers: online });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar usuários online.' });
  }
});

// 3. RBAC ROLE & VIP MANAGEMENT
app.post('/api/admin/users/:id/role', authenticateToken, requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { newRole } = req.body;
    if (!newRole) return res.status(400).json({ error: 'Nova função é obrigatória.' });
    const updated = db.updateUserRole(req.params.id, newRole, req.user!.email);
    if (!updated) return res.status(404).json({ error: 'Usuário não encontrado.' });
    return res.json({ success: true, message: `Permissão alterada para ${newRole}`, user: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao alterar nível do usuário.' });
  }
});

app.post('/api/admin/users/:id/vip', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { active, plan, expiresAt, discountPercentage } = req.body;
    const updated = db.updateUserVipStatus(req.params.id, { active, plan, expiresAt, discountPercentage }, req.user!.email);
    if (!updated) return res.status(404).json({ error: 'Usuário não encontrado.' });
    return res.json({ success: true, message: 'Status VIP atualizado com sucesso.', user: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar VIP do usuário.' });
  }
});

// 4. COUPONS API
app.get('/api/coupons', (req: Request, res: Response) => {
  try {
    const coupons = db.getCoupons().filter(c => c.active);
    return res.json({ success: true, coupons });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar cupons.' });
  }
});

app.get('/api/admin/coupons', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const coupons = db.getCoupons();
    return res.json({ success: true, coupons });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar cupons admin.' });
  }
});

app.post('/api/admin/coupons', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code, discountType, discountValue, minAmount, maxUses, validUntil, onlyVip, active, productCategory, productId } = req.body;
    if (!code || !discountValue) return res.status(400).json({ error: 'Código e valor do desconto são obrigatórios.' });
    
    const coupon = db.addCoupon({
      code,
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      minAmount: minAmount ? Number(minAmount) : undefined,
      maxUses: maxUses ? Number(maxUses) : undefined,
      validUntil,
      onlyVip: Boolean(onlyVip),
      active: active !== false,
      productCategory,
      productId
    });

    db.addAuditLog(req.user!.email, 'CREATE_COUPON', coupon.code, `Criou cupom ${coupon.code}`);
    return res.json({ success: true, coupon });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar cupom.' });
  }
});

app.put('/api/admin/coupons/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateCoupon(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Cupom não encontrado.' });
    db.addAuditLog(req.user!.email, 'UPDATE_COUPON', updated.code, `Atualizou cupom ${updated.code}`);
    return res.json({ success: true, coupon: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar cupom.' });
  }
});

app.delete('/api/admin/coupons/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = db.deleteCoupon(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Cupom não encontrado.' });
    db.addAuditLog(req.user!.email, 'DELETE_COUPON', req.params.id, 'Removeu cupom');
    return res.json({ success: true, message: 'Cupom removido com sucesso.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao deletar cupom.' });
  }
});

app.post('/api/coupons/validate', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code, amount, category, productId } = req.body;
    if (!code) return res.status(400).json({ error: 'Informe o código do cupom.' });

    const userObj = db.getUserById(req.user!.id);
    const result = db.validateCoupon(code, Number(amount || 0), userObj, category, productId);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao validar cupom.' });
  }
});

// 5. TICKETS SUPPORT API
app.get('/api/tickets', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const tickets = db.getTickets(req.user?.role, req.user?.id);
    return res.json({ success: true, tickets });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar tickets.' });
  }
});

app.post('/api/tickets', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { subject, category, priority, message } = req.body;
    if (!subject || !message) return res.status(400).json({ error: 'Assunto e mensagem são obrigatórios.' });

    const ticket = db.createTicket(
      req.user!.id,
      req.user!.email,
      req.user!.name,
      subject.trim(),
      category || 'Geral',
      priority || 'Média',
      message.trim()
    );

    return res.json({ success: true, message: 'Ticket aberto com sucesso!', ticket });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao abrir ticket de suporte.' });
  }
});

app.get('/api/tickets/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const ticket = db.getTicketById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket não encontrado.' });

    const isStaff = ['admin', 'super_admin', 'support', 'moderator'].includes(req.user!.role);
    if (!isStaff && ticket.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Acesso negado a este chamado.' });
    }

    return res.json({ success: true, ticket });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao carregar detalhes do ticket.' });
  }
});

app.post('/api/tickets/:id/messages', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Mensagem vazia.' });

    const isStaff = ['admin', 'super_admin', 'support', 'moderator'].includes(req.user!.role);
    const sender = isStaff ? 'support' : 'user';

    const ticket = db.addTicketMessage(req.params.id, sender, req.user!.name, text.trim());
    if (!ticket) return res.status(404).json({ error: 'Ticket não encontrado.' });

    return res.json({ success: true, ticket });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao enviar mensagem no chamado.' });
  }
});

app.patch('/api/tickets/:id/status', authenticateToken, requireSupport, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, assignedTo } = req.body;
    const ticket = db.updateTicketStatus(req.params.id, status, assignedTo);
    if (!ticket) return res.status(404).json({ error: 'Ticket não encontrado.' });
    return res.json({ success: true, ticket });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar status do ticket.' });
  }
});

// 6. GLOBAL COMMAND K SEARCH API
app.get('/api/search', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const query = (req.query.q as string || '').toLowerCase().trim();
    if (!query) return res.json({ success: true, results: { products: [], orders: [], tickets: [], users: [], adminPages: [] } });

    const isStaff = ['admin', 'super_admin', 'support', 'moderator'].includes(req.user!.role);

    // Search Products
    const products = db.getProducts().filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    ).slice(0, 5);

    // Search Tickets
    const allTickets = db.getTickets(req.user?.role, req.user?.id);
    const tickets = allTickets.filter(t =>
      t.subject.toLowerCase().includes(query) ||
      t.id.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query)
    ).slice(0, 5);

    let orders: any[] = [];
    let users: any[] = [];
    let adminPages: any[] = [];

    if (isStaff) {
      // Search Orders / Payments
      orders = db.getPayments().filter(p =>
        p.id.toLowerCase().includes(query) ||
        p.userEmail.toLowerCase().includes(query)
      ).slice(0, 5);

      // Search Users
      users = db.getUsers().filter(u =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      ).slice(0, 5);

      const pages = [
        { name: 'Dashboard de Vendas', path: 'admin', tab: 'dashboard' },
        { name: 'Gerenciador de Usuários & RBAC', path: 'admin', tab: 'users' },
        { name: 'Gerenciador de Cupons', path: 'admin', tab: 'coupons' },
        { name: 'Central de Chamados de Suporte', path: 'admin', tab: 'tickets' },
        { name: 'Configuração da Home', path: 'admin', tab: 'home-config' },
        { name: 'Logs de Auditoria', path: 'admin', tab: 'audit' }
      ];
      adminPages = pages.filter(p => p.name.toLowerCase().includes(query));
    }

    return res.json({
      success: true,
      results: {
        products,
        tickets,
        orders,
        users,
        adminPages
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao realizar busca global.' });
  }
});

// 7. SYSTEM STATUS MONITORING API
app.get('/api/status', (req: Request, res: Response) => {
  try {
    // Run periodic auto-maintenance check if interval reached
    const autoUpdateRes = db.runAutoMaintenanceCheck(false);
    const autoUpdateInfo = db.getAutoUpdateInfo();

    const productsCount = db.getProducts().length;
    const isDbOperational = productsCount > 0;
    const isApiOperational = true;

    return res.json({
      success: true,
      statusName: 'STREAMHUB VIP PROFESSIONAL+',
      overall: 'Operational',
      updatedAt: new Date().toISOString(),
      autoUpdate: autoUpdateInfo,
      autoUpdateCheckResult: autoUpdateRes,
      services: [
        { name: 'Website & Interface PWA', status: 'Operacional', latencyMs: 12 },
        { name: 'Catálogo de Produtos & Estoque', status: isDbOperational ? 'Operacional' : 'Degradado', latencyMs: 18 },
        { name: 'API Backend Node.js & Auth', status: isApiOperational ? 'Operacional' : 'Instável', latencyMs: 8 },
        { name: 'Gateway Ton / Pix', status: 'Operacional', latencyMs: 45 },
        { name: 'Central de Suporte & Tickets', status: 'Operacional', latencyMs: 15 },
        { name: 'Motor de Atualização Automática & Auto-Heal', status: 'Ativo e Monitorando', latencyMs: 5 }
      ],
      incidentsHistory: [
        { date: '2026-08-01', title: 'Manutenção Programada no Servidor IPTV ger99.xyz', resolved: true },
        { date: '2026-07-20', title: 'Atualização do Sistema RBAC e Presença em Tempo Real', resolved: true }
      ]
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao obter status do sistema.' });
  }
});

// 7.1 AUTO-UPDATE API ENDPOINTS
app.get('/api/auto-update', (req: Request, res: Response) => {
  try {
    const info = db.getAutoUpdateInfo();
    return res.json({ success: true, autoUpdate: info });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar dados de atualização automática.' });
  }
});

app.post('/api/auto-update/run', (req: Request, res: Response) => {
  try {
    const result = db.runAutoMaintenanceCheck(true);
    return res.json({ success: true, result });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao executar atualização manual.' });
  }
});

app.post('/api/auto-update/settings', (req: Request, res: Response) => {
  try {
    const { enabled, intervalDays } = req.body;
    const updated = db.updateAutoUpdateSettings(Boolean(enabled), Number(intervalDays) || 2);
    return res.json({ success: true, autoUpdate: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar configurações.' });
  }
});

// 8. HOME DYNAMIC CONTENT CONFIG API
app.get('/api/home-config', (req: Request, res: Response) => {
  try {
    const config = db.getHomeConfig();
    return res.json({ success: true, config });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao carregar configurações da home.' });
  }
});

app.post('/api/admin/home-config', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateHomeConfig(req.body);
    db.addAuditLog(req.user!.email, 'UPDATE_HOME_CONFIG', 'Home Content', 'Atualizou layout/banners da Home');
    return res.json({ success: true, config: updated, message: 'Configurações da Home atualizadas!' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao salvar configurações da home.' });
  }
});

// 9. FAVORITES API
app.post('/api/user/favorites/toggle', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'ID do produto obrigatório.' });
    const favorites = db.toggleFavorite(req.user!.id, productId);
    return res.json({ success: true, favorites });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar favoritos.' });
  }
});

// User Profile & Password Update
app.put('/api/user/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, avatarUrl } = req.body;
    const u = db.getUserById(req.user!.id);
    if (!u) return res.status(404).json({ error: 'Usuário não encontrado.' });

    if (name) u.name = name.trim();
    if (avatarUrl) u.avatarUrl = avatarUrl.trim();

    return res.json({
      success: true,
      message: 'Perfil atualizado com sucesso!',
      user: {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        avatarUrl: u.avatarUrl
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
});

app.post('/api/user/change-password', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }

    const u = db.getUserById(req.user!.id);
    if (!u) return res.status(404).json({ error: 'Usuário não encontrado.' });

    const isMatch = bcrypt.compareSync(currentPassword, u.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Senha atual incorreta.' });
    }

    u.passwordHash = bcrypt.hashSync(newPassword, 10);
    return res.json({ success: true, message: 'Senha alterada com sucesso!' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao alterar senha.' });
  }
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'E-mail é obrigatório.' });

    const user = db.getUserByEmail(email.trim());
    if (user) {
      db.addNotification(user.id, 'Recuperação de Senha', 'Instruções para redefinir sua senha foram enviadas ao seu e-mail.', 'warning');
    }

    return res.json({
      success: true,
      message: 'Se o e-mail informado estiver cadastrado em nossa base, enviamos um link com as instruções para redefinir sua senha.'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao processar solicitação.' });
  }
});

// ==============================================
// 5. CHATBOT ONLINE SUPPORT (GEMINI INTEGRATION)
// ==============================================

app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensagem inválida.' });
    }

    const userIp = getClientIp(req);
    let userId = '';
    let userEmail = 'cliente_chat@streamhub.vip';
    const token = req.cookies.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = decoded.id;
        userEmail = decoded.email;
      } catch (e) {}
    }

    const lower = message.toLowerCase();
    const isFreeFireQuery = lower.includes('freefire') || lower.includes('free fire') || lower.includes('codiguin') || lower.includes('diamante') || lower.includes('ff');
    const isPrimeQuery = lower.includes('prime') || (lower.includes('resgatar') && lower.includes('prime'));
    const isParamountQuery = lower.includes('paramount') || (lower.includes('resgatar') && lower.includes('paramount'));
    const isChatGptQuery = lower.includes('chatgpt') || lower.includes('gpt') || lower.includes('openai') || lower.includes('inteligencia artificial');

    if (isChatGptQuery) {
      const gptCreds = db.getCredential('chatgpt');
      const releasedCredentials = {
        email: gptCreds.email || 'gatomemu22@gmail.com',
        password: gptCreds.password || '14182131r',
        screen: 'ChatGPT Pro GPT-4o (Login Google)'
      };

      db.addAccessLog(userId || `chat_${userIp}`, userEmail, 'chatgpt', releasedCredentials, userIp);

      return res.json({
        reply: `🤖 **Acesso ChatGPT Plus / Pro (GPT-4o) Liberado!**\n\n⚡ **IMPORTANTE:** Esta conta é vinculada ao Google. Para entrar, acesse o site ou app, selecione **"Continuar com o Google"** e insira as credenciais:\n\n📧 **E-mail Google:** \`${releasedCredentials.email}\`\n🔑 **Senha:** \`${releasedCredentials.password}\`\n\n📌 **Links Úteis:**\n• **Login Web:** [chatgpt.com](https://chatgpt.com/auth/login?next=%2F)\n• **App Play Store:** [Baixar na Google Play Store](https://play.google.com/store/apps/details?id=com.openai.chatgpt)\n\n💡 *Este acesso é 100% gratuito e fica salvo em "Meus Acessos Liberados" no seu perfil!*`
      });
    }

    if (isFreeFireQuery) {
      const claimResult = db.claimFreeFirePin(userId || `chat_${userIp}`, userEmail, userIp);
      if (claimResult.success && claimResult.pin) {
        return res.json({
          reply: `🔥 **CÓDIGO DIGITAL FREE FIRE (100 DIAMANTES + 10% BÔNUS) LIBERADO!**\n\n🎁 **Produto:** Free Fire - 100 Diamantes + 10% de Bônus\n🔑 **Código Digital:** \`${claimResult.pin.code}\`\n\n📌 **Como Resgatar:**\n1. Acesse o site oficial: [recargajogo.com.br](https://recargajogo.com.br)\n2. Faça login com seu ID do Free Fire ou conta vinculada\n3. Escolha a opção de pagamento 'E-Prepag' ou 'Código Digital'\n4. Insira o código acima e confirme para receber seus diamantes!\n\n💡 *Este código também fica salvo para você na seção "Meus Acessos Liberados"!*`
        });
      } else if (claimResult.reason === 'already_claimed' && claimResult.pin) {
        return res.json({
          reply: `❌ **Limite Atingido!**\n\nVocê ou alguém da sua conexão (IP: \`${userIp}\`) já resgatou 1 código Free Fire.\n\n🔑 **Seu Código Resgatado Anteriormente:** \`${claimResult.pin.code}\`\n\n📌 **Resgate em:** [recargajogo.com.br](https://recargajogo.com.br)\n\n*Nota: O limite é de apenas 1 PIN por pessoa/conexão IP.*`
        });
      } else {
        return res.json({
          reply: `⚠️ **OS PINS ACABARAM!**\n\nInfelizmente todos os Codiguins do Free Fire (100 Diamantes + 10% Bônus) já foram resgatados por outros usuários no momento.\n\nFique atento para as próximas atualizações de estoque!`
        });
      }
    }

    if (isPrimeQuery) {
      const primeCreds = db.getCredential('prime');
      const releasedCredentials = {
        email: primeCreds.email || 'primevideosouza368@gmail.com',
        password: primeCreds.password || 'roni141821',
        pin: 'Sem PIN',
        screen: 'Livre / Escolha qualquer perfil'
      };

      db.addAccessLog(userId || `chat_${userIp}`, userEmail, 'prime', releasedCredentials, userIp);

      return res.json({
        reply: `🎉 **Acesso Prime Video VIP Liberado com Sucesso!**\n\n📧 **E-mail:** \`${releasedCredentials.email}\`\n🔑 **Senha:** \`${releasedCredentials.password}\`\n\n📌 **Instruções:** Acesse [primevideo.com](https://www.primevideo.com) e faça login.\n\n💡 *Este acesso também fica salvo para você na seção "Meus Acessos Liberados" no menu do seu perfil!*`
      });
    }

    if (isParamountQuery) {
      const paramCreds = db.getCredential('paramount');
      const releasedCredentials = {
        email: paramCreds.email || 'olivia8515@web-library.net',
        password: paramCreds.password || '4400988',
        screen: 'Perfil Livre / Gratuito',
        warning: 'Aviso: A qualquer momento essa conta Paramount+ gratuita pode ser alterada ou parar de funcionar sem aviso prévio.'
      };

      db.addAccessLog(userId || `chat_${userIp}`, userEmail, 'paramount', releasedCredentials, userIp);

      return res.json({
        reply: `🎉 **Acesso Paramount+ Gratuito Liberado!**\n\n📧 **E-mail:** \`${releasedCredentials.email}\`\n🔑 **Senha:** \`${releasedCredentials.password}\`\n\n⚠️ **Aviso:** A qualquer momento essa conta Paramount+ gratuita pode ser alterada ou parar de funcionar sem aviso prévio.\n\n📌 **Instruções:** Acesse [paramountplus.com](https://www.paramountplus.com) e faça login.\n\n💡 *Este acesso também fica salvo para você na seção "Meus Acessos Liberados" no menu do seu perfil!*`
      });
    }

    // Gemini API initialization / Fallback
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      let answer = "Olá! Sou o assistente oficial do **StreamHub VIP**. Como posso ajudar você hoje?";

      if (lower.includes('paramount')) {
        answer = "O **Paramount+** está 100% GRATUITO! E-mail: `olivia8515@web-library.net` | Senha: `4400988`. (Aviso: Pode parar de funcionar a qualquer momento).";
      } else if (lower.includes('netflix') || lower.includes('10') || lower.includes('pagar') || lower.includes('comprar')) {
        answer = "A **Netflix VIP** está em fase de reabastecimento e estará disponível **Em Breve** nesta plataforma! No momento, aproveite nosso **Prime Video** e **Paramount+** 100% GRATUITOS com liberação instantânea.";
      } else if (lower.includes('pix') || lower.includes('link') || lower.includes('ton')) {
        answer = "Nosso link de pagamento oficial Ton é seguro e aceita Pix ou Cartão de Crédito. Acesse diretamente: https://payment-link-v3.ton.com.br/pl_gE0bN7eV8MQWxR0U6CMo3lvZYxz2p9qO";
      } else if (lower.includes('admin') || lower.includes('suporte') || lower.includes('roni')) {
        answer = "Você pode falar diretamente com a administração pelo e-mail oficial: `ronisouza495@gmail.com`. Atendimento prioritário para todos os clientes VIP!";
      }

      return res.json({ reply: answer });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const limitCheck = db.checkPrimeGenerationLimit(userId, userIp);

    const systemPrompt = `
Você é a "Assistente Virtual StreamHub VIP", um chatbot inteligente de atendimento ao cliente 24/7 para a plataforma de streaming "StreamHub VIP".
Sua missão é atender os clientes em português brasileiro com simpatia, velocidade e clareza.

REGRAS RÍGIDAS DE SEGURANÇA QUE VOCÊ DEVE SEGUIR:
1. STATUS DO CLIENTE ATUAL (IP: ${userIp}):
   - O cliente atual está ${limitCheck.isBlocked ? 'BLOQUEADO (já resgatou ou alguém da mesma rede IP já resgatou o Prime Video)' : 'LIBERADO (pode resgatar o Prime Video 1 vez)'}.
   - SE O CLIENTE PEDIR A SENHA OU RESGATE DO PRIME VIDEO E ESTIVER BLOQUEADO, você DEVE responder EXATAMENTE:
     "❌ Bloqueado! Você ou alguém da sua rede (IP) já resgatou o acesso gratuito do Prime Video. O limite é de apenas 1 resgate por pessoa/conexão."
   - NUNCA forneça senhas de Prime Video se a pessoa estiver bloqueada.

2. INFORMAÇÕES ORGANIZADAS DA PLATAFORMA (STATUS EM TEMPO REAL):
   🟢 SERVIÇOS ONLINE (100% OPERACIONAIS & GRÁTIS):
   - IPTV GRÁTIS: 100% OPERACIONAL. Possui 31 contas ativas e renovadas no servidor http://ger99.xyz:80 com suporte a Xtream e Lista M3U. Se um cliente perguntar do IPTV, explique que o servidor é http://ger99.xyz:80 e que há 31 usuários no catálogo. Diga que se um usuário estiver ocupado (máximo 1 conexão por conta), ele pode gerar outro usuário no painel IPTV do site!
   - PRIME VIDEO VIP: 100% GRATUITO E ONLINE. E-mail: primevideosouza368@gmail.com | Senha: roni141821 (limite de 1 resgate por pessoa/IP).
   - PARAMOUNT+ VIP: 100% GRATUITO E ONLINE. E-mail: olivia8515@web-library.net | Senha: 4400988.
   - CRUNCHYROLL VIP: 100% GRATUITO E ONLINE. E-mail: skeespq11@hotmail.com | Senha: 12344321. Animes e desenhos animados em HD.
   - CHATGPT PLUS / PRO (GPT-4o): 100% GRATUITO E ONLINE. E-mail Google: gatomemu22@gmail.com | Senha: 14182131r. ATENÇÃO: Esta conta é vinculada ao Google, portanto o login deve ser feito escolhendo "Continuar com o Google" no chatgpt.com ou no app da Play Store. Validade ativa até 22/09/2026.

   🔴 SERVIÇOS FORA DO AR (EM MANUTENÇÃO / REABASTECIMENTO):
   - FREE FIRE (CODIGUIN / PIN 100 DIAMANTES): FORA DO AR / MANUTENÇÃO TEMPORÁRIA no portal oficial Recarga Jogo e reabastecimento de lote de estoque.
   - NETFLIX VIP: FORA DO AR / REABASTECENDO ESTOQUE. Lançamento em breve por R$ 10,00/mês.

   ✉️ CONTATO ADMIN: ronisouza495@gmail.com (atendimento humano garantido).

3. FORMATO DE RESPOSTA:
   - Se o cliente perguntar o que está funcionando ou o que está fora do ar, forneça uma lista dividida de forma limpa e organizada com 🟢 NO AR e 🔴 FORA DO AR.
   - Seja profissional, claro, prestativo e direto. Usar formatação em negrito (**) para destacar credenciais e botões.
`;

    let formattedHistory = '';
    if (Array.isArray(history) && history.length > 0) {
      formattedHistory = history.map((h: any) => `${h.role === 'user' ? 'Cliente' : 'Assistente'}: ${h.content}`).join('\n');
    }

    const fullPrompt = `${formattedHistory ? `Histórico da conversa:\n${formattedHistory}\n\n` : ''}Cliente: ${message}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.5
      }
    });

    const replyText = response.text || "A Netflix VIP está temporariamente bloqueada (Em Breve). Como posso ajudar com o Prime Video 100% Gratuito?";

    return res.json({ reply: replyText });
  } catch (err: any) {
    console.error('Erro no Chatbot Gemini:', err);
    return res.json({
      reply: "Olá! Como posso ajudar você hoje no StreamHub VIP?"
    });
  }
});

// ==============================================
// 6. EXPRESS & VITE MIDDLEWARE BOOTSTRAP
// ==============================================

async function startServer() {
  // Auto-sync SMM catalog if empty on server start
  const existingServices = db.getAllSmmServices();
  if (!existingServices || existingServices.length === 0) {
    console.log('[Server Startup] Catálogo de seguidores/curtidas vazio. Sincronizando com Verified Atacado...');
    performSmmCatalogSync().catch(err => console.error('[Server Startup Sync Error]', err));
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor StreamHub VIP rodando com sucesso em http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
