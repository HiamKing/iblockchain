import * as express from 'express';
import { connectToPeers, getSockets } from '../p2pNetwork/p2p';

const router = express.Router();

router.get('/', (req, res) => {
  res.send(
    getSockets().map(
      (s: any) => s._socket.remoteAddress + ':' + s._socket.remotePort
    )
  );
});

router.post('/', (req, res) => {
  connectToPeers(req.body.peer);
  res.send();
});

export default router;
