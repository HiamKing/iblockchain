import * as bodyParser from 'body-parser';
import * as express from 'express';
import { initP2PServer } from './p2pNetwork/p2p';
import getRouter from './routers/index';
import { initWallet } from './wallet/wallet';

const HTTP_PORT: number = parseInt(process.env.HTTP_PORT) || 3001;
const P2P_PORT: number = parseInt(process.env.P2P_PORT) || 6001;

const initHttpServer = (httpPort: number) => {
  const app = express();
  app.use(bodyParser.json());

  app.use((err, req, res, next) => {
    if (err) res.status(400).send(err.message);
  });

  app.use('/', getRouter);

  app.listen(httpPort, () => {
    console.log('Listening http on port: ' + httpPort);
  });
};

initHttpServer(HTTP_PORT);
initP2PServer(P2P_PORT);
initWallet();
