export type UserRole = 'user' | 'vip' | 'support' | 'moderator' | 'admin' | 'super_admin';

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  lastActive: string;
  current?: boolean;
}

export interface VipStatus {
  active: boolean;
  plan: 'VIP Bronze' | 'VIP Silver' | 'VIP Gold' | 'VIP Diamond' | 'Premium';
  expiresAt: string;
  benefits?: string[];
  discountPercentage?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'active' | 'blocked';
  avatarUrl?: string;
  walletBalance?: number;
  vipStatus?: VipStatus;
  favorites?: string[];
  activeSessions?: UserSession[];
  createdAt?: string;
  lastLoginAt?: string;
  lastActiveAt?: string;
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

export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'Streaming' | 'Entretenimento' | 'Games' | 'Premium' | 'Gratuitos' | 'Outros';
  price: number;
  originalPrice?: number;
  promoEndDate?: string; // ISO date for countdown timer
  isFree?: boolean;
  image: string;
  banner?: string;
  stockCount?: number;
  minStockThreshold?: number;
  stockStatus: 'DISPONIVEL' | 'ESTOQUE_BAIXO' | 'ESGOTADO' | 'EM_BREVE';
  rating?: number;
  ratingCount?: number;
  features?: string[];
  badge?: string;
  isVipExclusive?: boolean;
  totalSales?: number;
  downloadUrl?: string;
  instructions?: string[];
  updatedAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minAmount?: number;
  maxUses?: number;
  usedCount: number;
  validUntil?: string;
  onlyVip?: boolean;
  active: boolean;
  productCategory?: string;
  productId?: string;
  createdAt: string;
}

export interface CouponValidationResult {
  valid: boolean;
  discount: number;
  finalPrice: number;
  message: string;
  coupon?: Coupon;
}

export interface TicketMessage {
  id: string;
  sender: 'user' | 'support' | 'admin' | 'system';
  senderName: string;
  text: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  category: string;
  priority: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  status: 'ABERTO' | 'EM_ATENDIMENTO' | 'AGUARDANDO_USUARIO' | 'RESOLVIDO' | 'FECHADO';
  assignedTo?: string;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface UserPresence {
  userId: string;
  userEmail: string;
  userName: string;
  role: UserRole;
  lastActiveAt: string;
  device?: string;
  browser?: string;
  ip?: string;
  activeSessionId?: string;
  status: 'online' | 'idle' | 'offline';
}

export interface HomeBanner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  ctaText?: string;
  ctaLink?: string;
  buttonText?: string;
  buttonLink?: string;
  bgGradient?: string;
  imageUrl?: string;
  active: boolean;
}

export interface HomeContentConfig {
  banners: HomeBanner[];
  announcementText?: string;
  announcementActive?: boolean;
  featuredProductIds: string[];
}

export interface SystemNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'alert';
  link?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  target?: string;
  details?: string;
  ip?: string;
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

