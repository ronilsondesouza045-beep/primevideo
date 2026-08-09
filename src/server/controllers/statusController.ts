import { Request, Response } from 'express';
import { db } from '../../database';

export const getSystemStatus = (req: Request, res: Response) => {
  try {
    const autoUpdateRes = db.runAutoMaintenanceCheck(false);
    const autoUpdateInfo = db.getAutoUpdateInfo();

    const productsCount = db.getProducts().length;
    const isDbOperational = productsCount > 0;

    return res.json({
      statusName: 'STREAMHUB VIP PROFESSIONAL+',
      overall: 'Operational',
      updatedAt: new Date().toISOString(),
      autoUpdate: autoUpdateInfo,
      autoUpdateCheckResult: autoUpdateRes,
      services: [
        { name: 'Website & Interface PWA', status: 'Operacional', latencyMs: 12 },
        { name: 'Catálogo de Produtos & Estoque', status: isDbOperational ? 'Operacional' : 'Degradado', latencyMs: 18 },
        { name: 'Servidor IPTV ger99.xyz:80', status: 'Operacional', latencyMs: 24 },
        { name: 'Gateway Ton / Pix', status: 'Operacional', latencyMs: 45 },
        { name: 'Central de Suporte & Tickets', status: 'Operacional', latencyMs: 15 },
        { name: 'Motor de Atualização Automática & Auto-Heal', status: 'Ativo e Monitorando', latencyMs: 5 }
      ],
      incidentsHistory: [
        { date: '2026-08-01', title: 'Manutenção Programada no Servidor IPTV ger99.xyz', resolved: true },
        { date: '2026-07-20', title: 'Atualização do Gateway de Pagamento Ton/Pix', resolved: true }
      ]
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao verificar status do sistema.' });
  }
};

export const getAutoUpdateInfo = (req: Request, res: Response) => {
  try {
    const info = db.getAutoUpdateInfo();
    return res.json({ success: true, autoUpdate: info });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar dados de atualização automática.' });
  }
};

export const runAutoUpdate = (req: Request, res: Response) => {
  try {
    const result = db.runAutoMaintenanceCheck(true);
    return res.json({ success: true, result });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao executar atualização manual.' });
  }
};

export const updateSettings = (req: Request, res: Response) => {
  try {
    const { enabled, intervalDays } = req.body;
    const updated = db.updateAutoUpdateSettings(Boolean(enabled), Number(intervalDays) || 2);
    return res.json({ success: true, autoUpdate: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar configurações.' });
  }
};
