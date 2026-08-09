import { Router } from 'express';
import { getSystemStatus, getAutoUpdateInfo, runAutoUpdate, updateSettings } from '../controllers/statusController';

const router = Router();

router.get('/status', getSystemStatus);
router.get('/auto-update', getAutoUpdateInfo);
router.post('/auto-update/run', runAutoUpdate);
router.post('/auto-update/settings', updateSettings);

export default router;
