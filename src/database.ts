import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'admin' | 'user';
  status: 'active' | 'blocked';
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
  lastIp?: string;
}

export interface ServiceCredential {
  serviceId: 'prime' | 'netflix' | 'paramount';
  email: string;
  password: string;
  pin?: string;
  screen?: string;
  tonLink?: string;
}

export interface AccessLog {
  id: string;
  userId: string;
  userEmail: string;
  userIp?: string;
  service: 'prime' | 'netflix' | 'paramount' | 'freefire';
  credentials: {
    email: string;
    password: string;
    pin?: string;
    screen?: string;
    warning?: string;
  };
  createdAt: string;
}

export interface FreeFirePin {
  id: string;
  title: string;
  code: string;
  isClaimed: boolean;
  claimedByUserId?: string;
  claimedByUserEmail?: string;
  claimedByIp?: string;
  claimedAt?: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
  tonTransactionId?: string;
  pixCode?: string;
  createdAt: string;
  updatedAt: string;
  credentials?: {
    email: string;
    password: string;
    pin?: string;
    screen?: string;
  } | null;
}

export interface VisitorLog {
  id: string;
  ip: string;
  userAgent: string;
  browser: string;
  device: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  path: string;
  timestamp: string;
}

export interface SupportMessage {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  sender: 'user' | 'admin' | 'bot';
  text: string;
  createdAt: string;
  readByAdmin?: boolean;
}

interface DatabaseSchema {
  users: User[];
  credentials: Record<string, ServiceCredential>;
  accessLogs: AccessLog[];
  payments: PaymentRecord[];
  visitorLogs: VisitorLog[];
  supportMessages: SupportMessage[];
  freeFirePins: FreeFirePin[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'streamhub.json');

class JSONDatabase {
  private data: DatabaseSchema = {
    users: [],
    credentials: {},
    accessLogs: [],
    payments: [],
    visitorLogs: [],
    supportMessages: [],
    freeFirePins: []
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.freeFirePins) {
          this.data.freeFirePins = [];
        }
      } catch (err) {
        console.error('Error reading database file, re-initializing default data:', err);
        this.seedDefaults();
      }
    } else {
      this.seedDefaults();
    }

    // Ensure default admin always exists & has updated credentials
    this.ensureDefaultAdmin();
    this.ensureDefaultCredentials();
    this.ensureDefaultFreeFirePins();
    this.ensureSampleData();
  }

  private seedDefaults() {
    this.data = {
      users: [],
      credentials: {},
      accessLogs: [],
      payments: [],
      visitorLogs: [],
      supportMessages: [],
      freeFirePins: []
    };
    this.save();
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database to disk:', err);
    }
  }

  private ensureDefaultAdmin() {
    const adminEmail = 'ronisouza495@gmail.com';
    const adminIndex = this.data.users.findIndex(u => u.email.toLowerCase() === adminEmail.toLowerCase());
    const hash = bcrypt.hashSync('admin123', 10);

    if (adminIndex === -1) {
      this.data.users.unshift({
        id: 'usr_admin_001',
        email: adminEmail,
        passwordHash: hash,
        name: 'Administrador StreamHub VIP',
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString()
      });
    } else {
      this.data.users[adminIndex].role = 'admin';
      this.data.users[adminIndex].status = 'active';
      // ensure password
      if (!bcrypt.compareSync('admin123', this.data.users[adminIndex].passwordHash)) {
        this.data.users[adminIndex].passwordHash = hash;
      }
    }
    this.save();
  }

  private ensureDefaultCredentials() {
    // Prime Video Default:
    // Email: primevideosouza368@gmail.com
    // Senha: roni141821
    this.data.credentials['prime'] = {
      serviceId: 'prime',
      email: 'primevideosouza368@gmail.com',
      password: 'roni141821',
      tonLink: ''
    };

    // Paramount+ Default (100% Gratuito)
    // Email: olivia8515@web-library.net
    // Senha: 4400988
    this.data.credentials['paramount'] = {
      serviceId: 'paramount',
      email: 'olivia8515@web-library.net',
      password: '4400988',
      screen: 'Perfil Livre / Gratuito',
      tonLink: ''
    };

    // Netflix Default (Paid R$ 10,00)
    this.data.credentials['netflix'] = {
      serviceId: 'netflix',
      email: 'primevideosouza368@gmail.com',
      password: 'roni141821',
      pin: '1418',
      screen: 'Perfil VIP #1 (Rede Souza)',
      tonLink: 'https://payment-link-v3.ton.com.br/pl_gE0bN7eV8MQWxR0U6CMo3lvZYxz2p9qO'
    };

    this.save();
  }

  private ensureDefaultFreeFirePins() {
    if (!this.data.freeFirePins) {
      this.data.freeFirePins = [];
    }

    const defaultCodes = [
      'C3323966-7B78-4169-A43B-E99D5CDC776E',
      'DC1CEA85-1356-4D70-9FB5-A5DB9BEFDEBD'
    ];

    defaultCodes.forEach((code, idx) => {
      const exists = this.data.freeFirePins.some(p => p.code === code);
      if (!exists) {
        this.data.freeFirePins.push({
          id: `ff_pin_${idx + 1}`,
          title: 'Free Fire - 100 Diamantes + 10% de Bônus',
          code: code,
          isClaimed: false
        });
      }
    });

    this.save();
  }

  private ensureSampleData() {
    if (!this.data.visitorLogs) this.data.visitorLogs = [];
    if (!this.data.supportMessages) this.data.supportMessages = [];

    if (this.data.visitorLogs.length === 0) {
      this.data.visitorLogs.push({
        id: `vis_${Date.now()}_1`,
        ip: '189.120.45.12',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        browser: 'Google Chrome',
        device: 'Desktop',
        userId: 'usr_admin_001',
        userName: 'Administrador StreamHub VIP',
        userEmail: 'ronisouza495@gmail.com',
        path: '/admin',
        timestamp: new Date().toISOString()
      });
      this.data.visitorLogs.push({
        id: `vis_${Date.now()}_2`,
        ip: '177.92.10.88',
        userAgent: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
        browser: 'Google Chrome',
        device: 'Mobile',
        userName: 'Cliente VIP Chrome',
        userEmail: 'cliente_chrome@gmail.com',
        path: '/register',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      });
    }

    if (this.data.supportMessages.length === 0) {
      this.data.supportMessages.push({
        id: `msg_${Date.now()}_1`,
        userId: 'usr_sample_01',
        userName: 'Marcos Silva',
        userEmail: 'marcos.silva@gmail.com',
        sender: 'user',
        text: 'Olá admin! Fiz o pagamento da Netflix via PIX Ton, como faço para pegar a senha da tela?',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        readByAdmin: false
      });
    }
    this.save();
  }

  // User Methods
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(email: string, passwordPlain: string, name?: string, avatarUrl?: string): User {
    const existing = this.getUserByEmail(email);
    if (existing) {
      throw new Error('E-mail já cadastrado');
    }

    const isSystemAdmin = email.toLowerCase() === 'ronisouza495@gmail.com';
    const userName = name || email.split('@')[0];
    const defaultAvatar = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=dc2626&color=ffffff&bold=true`;

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: email.toLowerCase(),
      passwordHash: bcrypt.hashSync(passwordPlain, 10),
      name: userName,
      role: isSystemAdmin ? 'admin' : 'user',
      status: 'active',
      avatarUrl: defaultAvatar,
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public updateUserAvatar(userId: string, avatarUrl: string): User {
    const user = this.getUserById(userId);
    if (!user) throw new Error('Usuário não encontrado');
    user.avatarUrl = avatarUrl;
    this.save();
    return user;
  }

  public updateUserStatus(userId: string, status: 'active' | 'blocked'): User {
    const user = this.getUserById(userId);
    if (!user) throw new Error('Usuário não encontrado');
    user.status = status;
    this.save();
    return user;
  }

  public deleteUser(userId: string): boolean {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== userId);
    if (this.data.users.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Credentials Methods
  public getCredential(serviceId: 'prime' | 'netflix' | 'paramount'): ServiceCredential {
    return this.data.credentials[serviceId] || {
      serviceId,
      email: serviceId === 'paramount' ? 'olivia8515@web-library.net' : 'primevideosouza368@gmail.com',
      password: serviceId === 'paramount' ? '4400988' : 'roni141821'
    };
  }

  public updateCredential(serviceId: 'prime' | 'netflix' | 'paramount', cred: Partial<ServiceCredential>) {
    this.data.credentials[serviceId] = {
      ...this.data.credentials[serviceId],
      ...cred
    };
    this.save();
  }

  // Access Logs
  public checkPrimeGenerationLimit(userId: string, userIp: string): { isBlocked: boolean; reason?: 'user' | 'ip' } {
    return { isBlocked: false };
  }

  public addAccessLog(
    userId: string,
    userEmail: string,
    service: 'prime' | 'netflix' | 'paramount' | 'freefire',
    credentials: AccessLog['credentials'],
    userIp?: string
  ): AccessLog {
    const log: AccessLog = {
      id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      userEmail,
      userIp: userIp ? userIp.replace(/^::ffff:/, '').trim() : '127.0.0.1',
      service,
      credentials,
      createdAt: new Date().toISOString()
    };
    this.data.accessLogs.unshift(log);
    this.save();
    return log;
  }

  public claimFreeFirePin(userId: string, userEmail: string, userIp?: string): {
    success: boolean;
    reason?: 'already_claimed' | 'out_of_stock';
    pin?: FreeFirePin;
    error?: string;
  } {
    const cleanIp = userIp ? userIp.replace(/^::ffff:/, '').trim() : '127.0.0.1';
    const emailKey = userEmail ? userEmail.toLowerCase().trim() : '';

    if (!this.data.freeFirePins) {
      this.data.freeFirePins = [];
    }

    // 1. Check if this IP or User ID or User Email has ALREADY claimed a Free Fire PIN
    const existingClaim = this.data.freeFirePins.find(p =>
      p.isClaimed && (
        (cleanIp && cleanIp !== '127.0.0.1' && p.claimedByIp === cleanIp) ||
        (userId && p.claimedByUserId === userId) ||
        (emailKey && p.claimedByUserEmail?.toLowerCase() === emailKey)
      )
    );

    if (existingClaim) {
      return {
        success: false,
        reason: 'already_claimed',
        pin: existingClaim,
        error: `❌ Limite Atingido: Você já resgatou o seu Código Free Fire!\n\nSeu código resgatado: ${existingClaim.code}\n\nO limite é de apenas 1 PIN por pessoa / IP.`
      };
    }

    // Also check in accessLogs
    const existingAccessLog = this.data.accessLogs.find(a =>
      a.service === 'freefire' && (
        (cleanIp && cleanIp !== '127.0.0.1' && a.userIp === cleanIp) ||
        (userId && a.userId === userId) ||
        (emailKey && a.userEmail?.toLowerCase() === emailKey)
      )
    );

    if (existingAccessLog) {
      return {
        success: false,
        reason: 'already_claimed',
        pin: {
          id: existingAccessLog.id,
          title: 'Free Fire - 100 Diamantes + 10% de Bônus',
          code: existingAccessLog.credentials.password,
          isClaimed: true,
          claimedByUserId: existingAccessLog.userId,
          claimedByUserEmail: existingAccessLog.userEmail,
          claimedByIp: existingAccessLog.userIp,
          claimedAt: existingAccessLog.createdAt
        },
        error: `❌ Limite Atingido: Você já resgatou o seu Código Free Fire!\n\nSeu código resgatado: ${existingAccessLog.credentials.password}\n\nO limite é de apenas 1 PIN por pessoa / IP.`
      };
    }

    // 2. Find first unclaimed PIN
    const availablePin = this.data.freeFirePins.find(p => !p.isClaimed);

    if (!availablePin) {
      return {
        success: false,
        reason: 'out_of_stock',
        error: '⚠️ OS PINS ACABARAM! Estoque de Codiguins Free Fire esgotado no momento. Fique atento para o próximo lote!'
      };
    }

    // 3. Mark pin as claimed
    availablePin.isClaimed = true;
    availablePin.claimedByUserId = userId;
    availablePin.claimedByUserEmail = userEmail;
    availablePin.claimedByIp = cleanIp;
    availablePin.claimedAt = new Date().toISOString();

    // 4. Record access log
    this.addAccessLog(
      userId,
      userEmail,
      'freefire',
      {
        email: 'CÓDIGO DIGITAL FREE FIRE (100 DIAMANTES)',
        password: availablePin.code,
        warning: 'Resgate o seu código no site oficial: recargajogo.com.br'
      },
      cleanIp
    );

    this.save();
    return {
      success: true,
      pin: availablePin
    };
  }

  public getFreeFirePinsStatus() {
    if (!this.data.freeFirePins) this.data.freeFirePins = [];
    const total = this.data.freeFirePins.length;
    const claimed = this.data.freeFirePins.filter(p => p.isClaimed).length;
    const available = total - claimed;
    return {
      total,
      claimed,
      available,
      outOfStock: available <= 0,
      pins: this.data.freeFirePins
    };
  }

  public getAccessLogs(userId?: string): AccessLog[] {
    if (userId) {
      return this.data.accessLogs.filter(l => l.userId === userId);
    }
    return this.data.accessLogs;
  }

  // Payments Methods
  public createPayment(userId: string, userEmail: string, amount = 10.00): PaymentRecord {
    const paymentId = `TON-${Math.floor(100000 + Math.random() * 900000)}`;
    const pixCode = `00020126580014br.gov.bcb.pix0136payment-link-v3.ton.com.br/pl_gE0bN7eV8MQWxR0U6CMo3lvZYxz2p9qO520400005303986540510.005802BR5915STREAMHUB VIP6009SAO PAULO62070503***6304`;
    
    const payment: PaymentRecord = {
      id: paymentId,
      userId,
      userEmail,
      amount,
      status: 'PENDENTE',
      pixCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      credentials: null
    };

    this.data.payments.unshift(payment);
    this.save();
    return payment;
  }

  public getPayments(userId?: string): PaymentRecord[] {
    if (userId) {
      return this.data.payments.filter(p => p.userId === userId);
    }
    return this.data.payments;
  }

  public getPaymentById(paymentId: string): PaymentRecord | undefined {
    return this.data.payments.find(p => p.id === paymentId || p.tonTransactionId === paymentId);
  }

  public approvePayment(paymentId: string): PaymentRecord {
    const payment = this.getPaymentById(paymentId);
    if (!payment) throw new Error('Pagamento não encontrado');

    payment.status = 'APROVADO';
    payment.updatedAt = new Date().toISOString();

    const netflixCreds = this.getCredential('netflix');
    payment.credentials = {
      email: netflixCreds.email,
      password: netflixCreds.password,
      pin: netflixCreds.pin || '1418',
      screen: netflixCreds.screen || 'Perfil VIP #1'
    };

    // Log this access as well
    this.addAccessLog(payment.userId, payment.userEmail, 'netflix', payment.credentials);

    this.save();
    return payment;
  }

  public updatePaymentStatus(paymentId: string, status: 'PENDENTE' | 'APROVADO' | 'REJEITADO'): PaymentRecord {
    if (status === 'APROVADO') {
      return this.approvePayment(paymentId);
    }
    const payment = this.getPaymentById(paymentId);
    if (!payment) throw new Error('Pagamento não encontrado');

    payment.status = status;
    payment.updatedAt = new Date().toISOString();
    this.save();
    return payment;
  }

  public recordUserLogin(userId: string, userIp?: string) {
    const user = this.getUserById(userId);
    if (user) {
      user.lastLoginAt = new Date().toISOString();
      if (userIp) {
        user.lastIp = userIp.replace(/^::ffff:/, '').trim();
      }
      this.save();
    }
  }

  // Visitor Tracking
  public addVisitorLog(
    ip: string,
    userAgent: string,
    path: string,
    user?: { id: string; name: string; email: string }
  ): VisitorLog {
    const cleanIp = ip ? ip.replace(/^::ffff:/, '').trim() : '127.0.0.1';
    
    // Detect browser accurately
    let browser = 'Outro Navegador';
    const uaLower = (userAgent || '').toLowerCase();
    if (uaLower.includes('edg/') || uaLower.includes('edge')) {
      browser = 'Microsoft Edge';
    } else if (uaLower.includes('opera') || uaLower.includes('opr/')) {
      browser = 'Opera';
    } else if (uaLower.includes('firefox') || uaLower.includes('fxios')) {
      browser = 'Mozilla Firefox';
    } else if (
      uaLower.includes('chrome') ||
      uaLower.includes('crios') ||
      uaLower.includes('chromium') ||
      uaLower.includes('headlesschrome') ||
      uaLower.includes('gsa')
    ) {
      browser = 'Google Chrome';
    } else if (uaLower.includes('safari')) {
      browser = 'Apple Safari';
    } else if (uaLower.includes('applewebkit') || uaLower.includes('mozilla')) {
      browser = 'Google Chrome';
    }

    // Detect device
    let device = 'Desktop';
    if (uaLower.includes('mobile') || uaLower.includes('android') || uaLower.includes('iphone')) {
      device = 'Mobile';
    } else if (uaLower.includes('ipad') || uaLower.includes('tablet')) {
      device = 'Tablet';
    }

    if (!this.data.visitorLogs) {
      this.data.visitorLogs = [];
    }

    const log: VisitorLog = {
      id: `vis_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ip: cleanIp,
      userAgent: userAgent || 'N/A',
      browser,
      device,
      userId: user?.id,
      userName: user?.name,
      userEmail: user?.email,
      path: path || '/',
      timestamp: new Date().toISOString()
    };

    // Store log (limit max 1000 logs in memory/disk to keep light)
    this.data.visitorLogs.unshift(log);
    if (this.data.visitorLogs.length > 1000) {
      this.data.visitorLogs = this.data.visitorLogs.slice(0, 1000);
    }
    this.save();
    return log;
  }

  public getVisitorLogs(): VisitorLog[] {
    return this.data.visitorLogs || [];
  }

  // Support Messages Methods (Admin <-> User Realtime Chat)
  public addSupportMessage(
    userId: string,
    userName: string,
    userEmail: string,
    sender: 'user' | 'admin' | 'bot',
    text: string
  ): SupportMessage {
    if (!this.data.supportMessages) {
      this.data.supportMessages = [];
    }

    const msg: SupportMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: userId || 'guest',
      userName: userName || 'Cliente VIP',
      userEmail: userEmail || 'visitante@streamhub.com',
      sender,
      text,
      createdAt: new Date().toISOString(),
      readByAdmin: sender === 'admin'
    };

    this.data.supportMessages.push(msg);
    this.save();
    return msg;
  }

  public getSupportMessagesForUser(userIdOrEmail: string): SupportMessage[] {
    if (!this.data.supportMessages) return [];
    const key = (userIdOrEmail || '').toLowerCase();
    return this.data.supportMessages.filter(
      m => m.userId.toLowerCase() === key || m.userEmail.toLowerCase() === key
    );
  }

  public getAllSupportChatsGrouped() {
    if (!this.data.supportMessages) return [];

    const map = new Map<string, {
      userId: string;
      userName: string;
      userEmail: string;
      lastMessage: string;
      lastMessageAt: string;
      unreadCount: number;
      messages: SupportMessage[];
    }>();

    this.data.supportMessages.forEach(msg => {
      const key = (msg.userId || msg.userEmail || 'guest').toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          userId: msg.userId,
          userName: msg.userName,
          userEmail: msg.userEmail,
          lastMessage: msg.text,
          lastMessageAt: msg.createdAt,
          unreadCount: 0,
          messages: []
        });
      }
      const chat = map.get(key)!;
      chat.messages.push(msg);
      chat.lastMessage = msg.text;
      chat.lastMessageAt = msg.createdAt;
      if (msg.sender === 'user' && !msg.readByAdmin) {
        chat.unreadCount++;
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  }

  public markSupportMessagesRead(userIdOrEmail: string) {
    if (!this.data.supportMessages) return;
    const key = (userIdOrEmail || '').toLowerCase();
    let updated = false;
    this.data.supportMessages.forEach(m => {
      if ((m.userId.toLowerCase() === key || m.userEmail.toLowerCase() === key) && m.sender === 'user') {
        m.readByAdmin = true;
        updated = true;
      }
    });
    if (updated) this.save();
  }

  // Dashboard Stats for Admin
  public getAdminStats() {
    const approvedPayments = this.data.payments.filter(p => p.status === 'APROVADO');
    const totalSales = approvedPayments.reduce((sum, p) => sum + p.amount, 0);
    const primeCount = this.data.accessLogs.filter(a => a.service === 'prime').length;
    const paramountCount = this.data.accessLogs.filter(a => a.service === 'paramount').length;
    const freeFireCount = (this.data.freeFirePins || []).filter(p => p.isClaimed).length;
    const freeFireAvailable = (this.data.freeFirePins || []).filter(p => !p.isClaimed).length;
    const netflixCount = approvedPayments.length;
    
    const visitorLogs = this.data.visitorLogs || [];
    const chromeLogs = visitorLogs.filter(v => v.browser === 'Google Chrome');
    const chromeVisits = chromeLogs.length;
    
    // Unique IP addresses or user IDs that visited via Chrome
    const uniqueChromeSet = new Set(
      chromeLogs.map(v => v.userId || v.userEmail || v.ip)
    );
    const uniqueChromeVisits = uniqueChromeSet.size;

    // Unique registered users who accessed or registered via Chrome
    const chromeUserSet = new Set(
      chromeLogs.filter(v => v.userId || v.userEmail).map(v => v.userId || v.userEmail)
    );
    const chromeRegisteredUsers = chromeUserSet.size;

    const otherVisits = visitorLogs.length - chromeVisits;
    const mobileVisits = visitorLogs.filter(v => v.device === 'Mobile').length;
    const desktopVisits = visitorLogs.filter(v => v.device === 'Desktop').length;

    const unreadMessagesCount = (this.data.supportMessages || []).filter(
      m => m.sender === 'user' && !m.readByAdmin
    ).length;

    return {
      totalSales,
      totalUsers: this.data.users.length,
      primeAccessCount: primeCount,
      paramountAccessCount: paramountCount,
      freeFireAccessCount: freeFireCount,
      freeFireAvailableCount: freeFireAvailable,
      netflixAccessCount: netflixCount,
      pendingPaymentsCount: this.data.payments.filter(p => p.status === 'PENDENTE').length,
      approvedPaymentsCount: approvedPayments.length,
      totalVisits: visitorLogs.length,
      chromeVisits,
      uniqueChromeVisits,
      chromeRegisteredUsers,
      otherVisits,
      mobileVisits,
      desktopVisits,
      unreadMessagesCount
    };
  }
}

export const db = new JSONDatabase();
