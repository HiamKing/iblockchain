import * as express from 'express';
import blockRoutes from './block';
import transactionRoutes from './transaction';
import addressRoutes from './address';
import peerRoutes from './peer';
import balanceRoutes from './balance';

const router = express.Router();
router.use('/block', blockRoutes);
router.use('/transaction', transactionRoutes);
router.use('/address', addressRoutes);
router.use('/peer', peerRoutes);
router.use('/balance', balanceRoutes);
router.post('/stop', (req, res) => {
  console.log('Stopping server');
  res.send({ msg: 'Stopping server' });
  process.exit();
});

export default router;
