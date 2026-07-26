export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  status: 'active' | 'blocked';
  avatarUrl?: string;
  createdAt?: string;
  lastLoginAt?: string;
  lastIp?: string;
}

export interface ServiceCredentials {
  email: string;
  password: string;
  pin?: string;
  screen?: string;
}

export interface AccessLog {
  id: string;
  userId: string;
  userEmail: string;
  userIp?: string;
  service: 'prime' | 'netflix';
  credentials: ServiceCredentials;
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
  credentials?: ServiceCredentials | null;
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

export interface AdminStats {
  totalSales: number;
  totalUsers: number;
  primeAccessCount: number;
  netflixAccessCount: number;
  pendingPaymentsCount: number;
  approvedPaymentsCount: number;
  totalVisits: number;
  chromeVisits: number;
  otherVisits: number;
  mobileVisits: number;
  desktopVisits: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
