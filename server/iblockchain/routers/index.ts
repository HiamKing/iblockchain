import * as express from 'express';
import blockRoutes from './block';
import transactionRoutes from './transaction';
import transactionPoolRoutes from './transactionPool';
import addressRoutes from './address';
import peerRoutes from './peer';
import balanceRoutes from './balance';
import walletRoutes from './wallet';

const router = express.Router();
router.use('/block', blockRoutes);
router.use('/transaction', transactionRoutes);
router.use('/transaction-pool', transactionPoolRoutes);
router.use('/address', addressRoutes);
router.use('/peer', peerRoutes);
router.use('/balance', balanceRoutes);
router.use('/wallet', walletRoutes);

router.post('/stop', (req, res) => {
  console.log('Stopping server');
  res.send({ msg: 'Stopping server' });
  process.exit();
});

export default router;
