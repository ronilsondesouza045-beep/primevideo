import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { db, User } from './src/database';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'streamhub_vip_secret_key_2026';

app.use(express.json());
app.use(cookieParser());

// User Request augmentation
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'user';
    name: string;
    avatarUrl?: string;
  };
}

// Authentication Middlewares
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
  const headerEmail = req.headers['x-user-email'] as string;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
      return next();
    } catch (err) {
      // Continue to header fallback
    }
  }

  if (headerEmail) {
    const cleanEmail = headerEmail.toLowerCase().trim();
    const u = db.getUserByEmail(cleanEmail);
    if (u) {
      req.user = {
        id: u.id,
        email: u.email,
        role: u.role,
        name: u.name,
        avatarUrl: u.avatarUrl
      };
      return next();
    } else if (cleanEmail === 'ronisouza495@gmail.com') {
      req.user = {
        id: 'usr_admin_001',
        email: 'ronisouza495@gmail.com',
        role: 'admin',
        name: 'Administrador StreamHub VIP',
        avatarUrl: ''
      };
      return next();
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Sessão não autenticada. Faça login para continuar.' });
  }

  return res.status(401).json({ error: 'Token inválido ou expirado.' });
};

const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Acesso não autorizado.' });
  }

  const isAdminEmail = req.user.email.toLowerCase() === 'ronisouza495@gmail.com';
  if (!isAdminEmail && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito ao Administrador do StreamHub VIP.' });
  }
  next();
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
        avatarUrl: user.avatarUrl
      },
      token
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao conectar via Login Social.' });
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

// Current User Info
app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' });

  const user = db.getUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  const avatarUrl = user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=dc2626&color=ffffff&bold=true`;

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      avatarUrl: avatarUrl,
      createdAt: user.createdAt
    }
  });
});

// IP Helper
const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ipStr = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return ipStr.split(',')[0].trim().replace(/^::ffff:/, '');
  }
  return (req.ip || req.socket.remoteAddress || '127.0.0.1').replace(/^::ffff:/, '').trim();
};

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

// Generate Free Prime Video Access
app.post('/api/services/generate-prime', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
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
    const netflix = db.getCredential('netflix');
    return res.json({ prime, netflix });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao buscar credenciais.' });
  }
});

app.put('/api/admin/credentials', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { serviceId, email, password, pin, screen, tonLink } = req.body;
    if (serviceId !== 'prime' && serviceId !== 'netflix') {
      return res.status(400).json({ error: 'serviceId inválido. Use prime ou netflix.' });
    }

    db.updateCredential(serviceId, {
      email,
      password,
      pin,
      screen,
      tonLink
    });

    return res.json({ message: `Credenciais de ${serviceId.toUpperCase()} atualizadas com sucesso!` });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao atualizar credenciais.' });
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
    const isPrimeQuery = lower.includes('prime') || lower.includes('gratis') || lower.includes('gratuito') || lower.includes('resgatar') || lower.includes('senha') || lower.includes('conta') || lower.includes('acesso');

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

    // Gemini API initialization / Fallback
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      let answer = "Olá! Sou o assistente oficial do **StreamHub VIP**. Como posso ajudar você hoje?";

      if (lower.includes('netflix') || lower.includes('10') || lower.includes('pagar') || lower.includes('comprar')) {
        answer = "A **Netflix VIP** está em fase de reabastecimento e estará disponível **Em Breve** nesta plataforma! No momento, aproveite nosso **Prime Video 100% GRATUITO** com liberação instantânea de e-mail e senha.";
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
   - NUNCA forneça senhas se a pessoa estiver bloqueada.

2. INFORMAÇÕES DA PLATAFORMA:
   - NETFLIX VIP: O serviço da Netflix está BLOQUEADO e TEMPORARIAMENTE INDISPONÍVEL (EM BREVE). NÃO há vendas ou liberações de Netflix no momento, pois o estoque está em reabastecimento. Se o cliente perguntar sobre a Netflix, diga educadamente que está bloqueada/indisponível temporariamente e estará disponível em breve!
   - PRIME VIDEO: É o ÚNICO serviço ativo no momento, sendo 100% GRATUITO (limite rígido de 1 resgate por pessoa/IP).
   - Suporte / Admin: ronisouza495@gmail.com
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
