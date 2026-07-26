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
  warning?: string;
}

export interface AccessLog {
  id: string;
  userId: string;
  userEmail: string;
  userIp?: string;
  service: 'prime' | 'netflix' | 'paramount';
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

export interface AdminStats {
  totalSales: number;
  totalUsers: number;
  primeAccessCount: number;
  paramountAccessCount?: number;
  netflixAccessCount: number;
  pendingPaymentsCount: number;
  approvedPaymentsCount: number;
  totalVisits: number;
  chromeVisits: number;
  uniqueChromeVisits: number;
  chromeRegisteredUsers: number;
  otherVisits: number;
  mobileVisits: number;
  desktopVisits: number;
  unreadMessagesCount?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
