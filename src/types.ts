export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  status: 'active' | 'blocked';
  avatarUrl?: string;
  createdAt?: string;
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

export interface AdminStats {
  totalSales: number;
  totalUsers: number;
  primeAccessCount: number;
  netflixAccessCount: number;
  pendingPaymentsCount: number;
  approvedPaymentsCount: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
