export type FreeToolCategory = 'TODOS' | 'RASTREAMENTO' | 'AO VIVO' | 'SALAS' | 'OUTROS';

export interface FreeTool {
  id: string;
  title: string;
  description: string;
  url: string;
  badge: 'GRÁTIS' | 'GRÁTIS · LIMITADO' | 'FREE · LIMITADO';
  category: 'Rastreamento' | 'Ao Vivo' | 'Salas' | 'Outros';
  provider: string;
  buttonText: string;
  iconName: 'Radio' | 'Activity' | 'Search' | 'Tv' | 'Layers' | 'ExternalLink' | 'Zap';
  enabled: boolean;
  featured?: boolean;
  allowIframe?: boolean;
  tags?: string[];
}

export const FREE_TOOLS_CONFIG: FreeTool[] = [
  {
    id: 'tiktok-live-monitor',
    title: 'Monitor de Chat & Live TikTok',
    url: 'https://tiktoklivewebvercelv43viewersgiftsl.vercel.app/',
    badge: 'GRÁTIS',
    category: 'Ao Vivo',
    provider: 'TikTok Live Web',
    description: 'Monitore chat ao vivo, contagem de espectadores, presentes (gifts), curtidas e eventos de lives do TikTok em tempo real.',
    buttonText: 'MONITORAR LIVE TIKTOK',
    iconName: 'Tv',
    enabled: true,
    featured: true,
    allowIframe: true,
    tags: ['tiktok', 'live', 'chat', 'monitor', 'tempo real', 'presentes', 'gifts', 'viewers', 'espectadores', 'gratis']
  },
  {
    id: 'private-room',
    title: 'Rastreador de Salas',
    url: 'https://catvu.live/live-private-room',
    badge: 'GRÁTIS',
    category: 'Rastreamento',
    provider: 'Catvu',
    description: 'Consulte salas e utilize os recursos gratuitos disponibilizados pelo Catvu.',
    buttonText: 'USAR AGORA',
    iconName: 'Radio',
    enabled: true,
    featured: true,
    allowIframe: true,
    tags: ['salas', 'rastreador', 'imvu', 'online', 'catvu', 'busca', 'gratis', 'gratuito']
  },
  {
    id: 'live-watch',
    title: 'Live Watch',
    url: 'https://catvu.live/live-watch',
    badge: 'GRÁTIS · LIMITADO',
    category: 'Ao Vivo',
    provider: 'Catvu',
    description: 'Acompanhe a atividade de uma sala utilizando o acesso gratuito/limitado disponibilizado pelo Catvu.',
    buttonText: 'ABRIR LIVE WATCH',
    iconName: 'Activity',
    enabled: true,
    featured: true,
    allowIframe: true,
    tags: ['ao vivo', 'live', 'watch', 'monitor', 'tempo real', 'catvu', 'gratis', 'limitado']
  }
];
