export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  status: 'active' | 'blocked';
  avatarUrl?: string;
  walletBalance?: number;
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
  service: 'prime' | 'netflix' | 'paramount' | 'freefire' | 'crunchyroll';
  credentials: ServiceCredentials;
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
  freeFireAccessCount?: number;
  freeFireAvailableCount?: number;
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

export interface ServiceReview {
  id: string;
  service: 'prime' | 'paramount' | 'freefire' | 'crunchyroll';
  userId?: string;
  userName: string;
  userEmail?: string;
  userIp?: string;
  browser?: string;
  rating: number; // 1 to 5
  status: 'working' | 'not_working';
  comment: string;
  createdAt: string;
}

export interface ServiceReviewStats {
  service: 'prime' | 'paramount' | 'freefire' | 'crunchyroll';
  totalReviews: number;
  workingCount: number;
  notWorkingCount: number;
  successRate: number;
  averageRating: number;
  recentReviews: ServiceReview[];
}

export interface FreeTrialClaim {
  id: string;
  userId: string;
  userEmail: string;
  ip: string;
  type: 'followers' | 'likes';
  claimedAt: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'security';
  message: string;
  details?: any;
  ip?: string;
}

export interface SmmService {
  id: string;
  serviceId: number;
  name: string;
  category: string;
  originalRate: number;
  rate: number; // Retail rate in BRL per 1000
  min: number;
  max: number;
  refill: boolean;
  cancel?: boolean;
  type?: string;
  description?: string;
  enabled: boolean;
  freeTrialEnabled?: boolean;
}

export interface SmmOrder {
  id: string;
  userId: string;
  userEmail: string;
  userIp?: string;
  serviceId: number;
  serviceName: string;
  category: string;
  link: string;
  quantity: number;
  cost: number;
  supplierOrderId?: string | number;
  refillId?: string | number;
  status: 'PENDENTE_APROVACAO' | 'PENDENTE' | 'PROCESSANDO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'PARCIAL' | 'CANCELADO';
  isFreeTrial?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SmmConfig {
  apiUrl: string;
  apiKey: string;
  profitMargin: number; // e.g. 2.0 (100% profit margin)
  currencyRate: number; // e.g. 1.0
  autoSync: boolean;
  enabled: boolean;
  testMode: boolean;
  cooldownHours: number; // Default 24h
  freeTrialQty: number; // Default 50 units
  disabledServices?: number[];
  disabledCategories?: string[];
  bannedIps: string[];
  lastSyncAt?: string;
  lastApiStatus?: boolean | 'online' | 'offline' | string;
  lastApiBalance?: string;
  lastServicesCount?: number;
  syncLogs?: Array<{
    id?: string;
    timestamp: string;
    level?: string;
    type?: 'sync' | 'test' | 'error' | 'info' | string;
    message: string;
    details?: any;
  }>;
}

export interface IptvAccount {
  id: string;
  username: string;
  password: string;
  expiration: string;
  connections: number;
  status: string;
  server: string;
}

