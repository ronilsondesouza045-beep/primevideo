import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SystemNotification } from '../types';

const INITIAL_FALLBACK_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif_init_01',
    title: '⚡ Código Netflix TV Gerado (Tempo Real)',
    message: 'Roni Souza acabou de puxar um código de 4 dígitos para Smart TV na Netflix em tempo real.',
    read: false,
    type: 'success',
    link: '/catalog',
    category: 'netflix',
    userName: 'Roni Souza',
    service: 'netflix',
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString()
  },
  {
    id: 'notif_init_02',
    title: '⚡ Código Netflix TV Gerado (Tempo Real)',
    message: 'Lucas Santos acabou de puxar um código de 4 dígitos para Smart TV na Netflix em tempo real.',
    read: false,
    type: 'success',
    link: '/catalog',
    category: 'netflix',
    userName: 'Lucas Santos',
    service: 'netflix',
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString()
  },
  {
    id: 'notif_init_03',
    title: '🍿 Paramount+ VIP Liberado',
    message: 'Mateus Oliveira resgatou acesso imediato ao catálogo Paramount+ com tela exclusiva.',
    read: false,
    type: 'info',
    link: '/catalog',
    category: 'streaming',
    userName: 'Mateus Oliveira',
    service: 'paramount',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString()
  },
  {
    id: 'notif_init_04',
    title: '💎 StreamHub VIP 2.5 Ativo',
    message: 'Sistema de sincronização de códigos Netflix e catálogo de streamings 100% online.',
    read: true,
    type: 'info',
    link: '/catalog',
    category: 'system',
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString()
  }
];

class NotificationsService {
  private notifications: SystemNotification[] = [];
  private listeners: ((notifications: SystemNotification[]) => void)[] = [];
  private unsubscribeFirestore: (() => void) | null = null;
  private isInitialized = false;

  constructor() {
    this.loadFromCache();
  }

  private loadFromCache() {
    try {
      const cached = localStorage.getItem('streamhub_notifications_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.notifications = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load notifications from cache:', e);
    }
    this.notifications = [...INITIAL_FALLBACK_NOTIFICATIONS];
  }

  private saveToCache() {
    try {
      localStorage.setItem('streamhub_notifications_cache', JSON.stringify(this.notifications));
    } catch (e) {
      // Ignore quota errors
    }
  }

  private getReadIds(): Set<string> {
    try {
      const readRaw = localStorage.getItem('streamhub_read_notification_ids');
      if (readRaw) {
        return new Set(JSON.parse(readRaw));
      }
    } catch {}
    return new Set();
  }

  private saveReadId(id: string) {
    try {
      const readIds = this.getReadIds();
      readIds.add(id);
      localStorage.setItem('streamhub_read_notification_ids', JSON.stringify(Array.from(readIds)));
    } catch {}
  }

  public init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // 1. First sync with API if reachable
    this.fetchFromApi();

    // 2. Start real-time Firestore listener
    try {
      const notifsCol = collection(db, 'notifications');
      const q = query(notifsCol, orderBy('createdAt', 'desc'), limit(30));

      this.unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        const readIds = this.getReadIds();
        const firestoreNotifs: SystemNotification[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          let createdAtStr = new Date().toISOString();
          if (data.createdAt) {
            if (typeof data.createdAt === 'string') {
              createdAtStr = data.createdAt;
            } else if (data.createdAt instanceof Timestamp) {
              createdAtStr = data.createdAt.toDate().toISOString();
            } else if (data.createdAt.seconds) {
              createdAtStr = new Date(data.createdAt.seconds * 1000).toISOString();
            }
          }

          firestoreNotifs.push({
            id: doc.id,
            title: data.title || '⚡ Atividade em Tempo Real',
            message: data.message || '',
            read: readIds.has(doc.id) || Boolean(data.read),
            type: data.type || 'success',
            link: data.link || '/catalog',
            category: data.category || 'netflix',
            userName: data.userName,
            service: data.service,
            createdAt: createdAtStr
          });
        });

        if (firestoreNotifs.length > 0) {
          // Merge with fallback to ensure rich initial state
          const existingIds = new Set(firestoreNotifs.map(n => n.id));
          const complementary = INITIAL_FALLBACK_NOTIFICATIONS.filter(f => !existingIds.has(f.id));
          this.notifications = [...firestoreNotifs, ...complementary].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        } else {
          // If Firestore collection is still empty, keep local fallbacks
          if (this.notifications.length === 0) {
            this.notifications = [...INITIAL_FALLBACK_NOTIFICATIONS];
          }
        }

        this.saveToCache();
        this.notifyListeners();
      }, (err) => {
        console.warn('Firestore notifications listener error (fallback to local/API):', err);
      });
    } catch (err) {
      console.warn('Could not attach Firestore listener:', err);
    }
  }

  public async fetchFromApi() {
    try {
      const token = localStorage.getItem('streamhub_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/notifications', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.notifications && Array.isArray(data.notifications) && data.notifications.length > 0) {
          const readIds = this.getReadIds();
          const apiNotifs: SystemNotification[] = data.notifications.map((n: any) => ({
            ...n,
            read: readIds.has(n.id) ? true : Boolean(n.read)
          }));

          // Merge uniquely
          const map = new Map<string, SystemNotification>();
          this.notifications.forEach(n => map.set(n.id, n));
          apiNotifs.forEach(n => map.set(n.id, n));

          this.notifications = Array.from(map.values()).sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          this.saveToCache();
          this.notifyListeners();
        }
      }
    } catch (e) {
      // Ignored for offline/serverless resilience
    }
  }

  public getNotifications(): SystemNotification[] {
    const readIds = this.getReadIds();
    return this.notifications.map(n => ({
      ...n,
      read: readIds.has(n.id) ? true : n.read
    }));
  }

  public getUnreadCount(): number {
    return this.getNotifications().filter(n => !n.read).length;
  }

  public subscribe(callback: (notifications: SystemNotification[]) => void): () => void {
    this.listeners.push(callback);
    callback(this.getNotifications());

    // Ensure service is running
    this.init();

    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners() {
    const data = this.getNotifications();
    this.listeners.forEach(cb => {
      try {
        cb(data);
      } catch (e) {
        console.error('Notification subscriber callback error:', e);
      }
    });
    window.dispatchEvent(new CustomEvent('streamhub_notifications_updated'));
  }

  public async addNotification(item: {
    title?: string;
    message?: string;
    category?: 'netflix' | 'streaming' | 'system' | 'catalog';
    userName?: string;
    service?: string;
    type?: 'info' | 'success' | 'warning' | 'alert';
    link?: string;
  }) {
    const category = item.category || 'netflix';
    const userName = item.userName || 'Membro VIP';
    const service = item.service || (category === 'netflix' ? 'netflix' : 'streaming');
    const serviceLabel = service === 'netflix' ? 'Netflix' : service.toUpperCase();

    const title = item.title || (
      category === 'netflix'
        ? '⚡ Código Netflix TV Gerado (Tempo Real)'
        : `🍿 Acesso ${serviceLabel} Ativado (Tempo Real)`
    );

    const message = item.message || (
      category === 'netflix'
        ? `${userName} acabou de puxar um código de 4 dígitos para Smart TV na Netflix em tempo real.`
        : `${userName} resgatou acesso VIP ao catálogo de ${serviceLabel}.`
    );

    const newNotif: SystemNotification = {
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title,
      message,
      read: false,
      type: item.type || 'success',
      link: item.link || '/catalog',
      category,
      userName,
      service,
      createdAt: new Date().toISOString()
    };

    // 1. Update local cache immediately
    this.notifications.unshift(newNotif);
    this.saveToCache();
    this.notifyListeners();

    // 2. Persist to Firestore for global cross-user real-time sync
    try {
      const notifsCol = collection(db, 'notifications');
      await addDoc(notifsCol, {
        title: newNotif.title,
        message: newNotif.message,
        read: false,
        type: newNotif.type,
        link: newNotif.link,
        category: newNotif.category,
        userName: newNotif.userName,
        service: newNotif.service,
        createdAt: newNotif.createdAt
      });
    } catch (e) {
      console.warn('Could not write notification to Firestore (fallback active):', e);
    }

    // 3. Inform API / serverless if available
    try {
      fetch('/api/notifications/log-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-name': userName
        },
        body: JSON.stringify({
          userName,
          category,
          service,
          title: newNotif.title,
          message: newNotif.message
        })
      }).catch(() => {});
    } catch {}
  }

  public async markAllAsRead() {
    const readIds = this.getReadIds();
    this.notifications.forEach(n => readIds.add(n.id));
    localStorage.setItem('streamhub_read_notification_ids', JSON.stringify(Array.from(readIds)));

    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.saveToCache();
    this.notifyListeners();

    try {
      const token = localStorage.getItem('streamhub_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      fetch('/api/notifications/read', { method: 'POST', headers }).catch(() => {});
    } catch {}
  }
}

export const notificationsService = new NotificationsService();
