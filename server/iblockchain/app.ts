import * as bodyParser from 'body-parser';
import * as express from 'express';
import _ from 'lodash';
import { getBlockchain } from './blockchain/blockchain';
import { Block } from './blockchain/models';
import { getSockets, initP2PServer, connectToPeers } from './p2pNetwork/p2p';

const HTTP_PORT: number = parseInt(process.env.HTTP_PORT) || 3001;
const P2P_PORT: number = parseInt(process.env.P2P_PORT) || 6001;

const initHttpServer = (httpPort: number) => {
  const app = express();
  app.use(bodyParser.json());
  app.use((err, req, res, next) => {
    if (err) {
      res.status(400).send(err.message);
    }
  });

  app.get('/blocks', (req, res) => {
    res.send(getBlockchain());
  });

  app.get('/block/:hash', (req, res) => {
    const block = _.find(getBlockchain(), {'hash': req.params.hash});
    res.send(block);
  });

  app.post('/mint_block', (req, res) => {
    const newBlock: Block = generateNextBlock(req.body.data);
    res.send(newBlock);
  });

  app.get('/peers', (req, res) => {
    console.log(getSockets());
    res.send(
      getSockets().map(
        (s: any) => s._socket.remoteAddress + ':' + s._socket.remotePort
      )
    );
  });

  app.post('/add_peer', (req, res) => {
    connectToPeers(req.body.peer);
    res.send();
  });

  app.listen(httpPort, () => {
    console.log('Listening http on port: ' + httpPort);
  });
};

initHttpServer(HTTP_PORT);
initP2PServer(P2P_PORT);
