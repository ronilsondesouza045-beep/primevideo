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
  serviceId: 'prime' | 'netflix';
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
  service: 'prime' | 'netflix';
  credentials: {
    email: string;
    password: string;
    pin?: string;
    screen?: string;
  };
  createdAt: string;
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

interface DatabaseSchema {
  users: User[];
  credentials: Record<string, ServiceCredential>;
  accessLogs: AccessLog[];
  payments: PaymentRecord[];
  visitorLogs: VisitorLog[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'streamhub.json');

class JSONDatabase {
  private data: DatabaseSchema = {
    users: [],
    credentials: {},
    accessLogs: [],
    payments: [],
    visitorLogs: []
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
  }

  private seedDefaults() {
    this.data = {
      users: [],
      credentials: {},
      accessLogs: [],
      payments: [],
      visitorLogs: []
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
  public getCredential(serviceId: 'prime' | 'netflix'): ServiceCredential {
    return this.data.credentials[serviceId];
  }

  public updateCredential(serviceId: 'prime' | 'netflix', cred: Partial<ServiceCredential>) {
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
    service: 'prime' | 'netflix',
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
    
    // Detect browser
    let browser = 'Outro Navegador';
    const uaLower = (userAgent || '').toLowerCase();
    if (uaLower.includes('edg/')) {
      browser = 'Microsoft Edge';
    } else if (uaLower.includes('chrome') || uaLower.includes('crios')) {
      browser = 'Google Chrome';
    } else if (uaLower.includes('firefox') || uaLower.includes('fxios')) {
      browser = 'Mozilla Firefox';
    } else if (uaLower.includes('safari') && !uaLower.includes('chrome')) {
      browser = 'Apple Safari';
    } else if (uaLower.includes('opera') || uaLower.includes('opr/')) {
      browser = 'Opera';
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

  // Dashboard Stats for Admin
  public getAdminStats() {
    const approvedPayments = this.data.payments.filter(p => p.status === 'APROVADO');
    const totalSales = approvedPayments.reduce((sum, p) => sum + p.amount, 0);
    const primeCount = this.data.accessLogs.filter(a => a.service === 'prime').length;
    const netflixCount = approvedPayments.length;
    
    const visitorLogs = this.data.visitorLogs || [];
    const chromeVisits = visitorLogs.filter(v => v.browser === 'Google Chrome').length;
    const otherVisits = visitorLogs.length - chromeVisits;
    const mobileVisits = visitorLogs.filter(v => v.device === 'Mobile').length;
    const desktopVisits = visitorLogs.filter(v => v.device === 'Desktop').length;

    return {
      totalSales,
      totalUsers: this.data.users.length,
      primeAccessCount: primeCount,
      netflixAccessCount: netflixCount,
      pendingPaymentsCount: this.data.payments.filter(p => p.status === 'PENDENTE').length,
      approvedPaymentsCount: approvedPayments.length,
      totalVisits: visitorLogs.length,
      chromeVisits,
      otherVisits,
      mobileVisits,
      desktopVisits
    };
  }
}

export const db = new JSONDatabase();
