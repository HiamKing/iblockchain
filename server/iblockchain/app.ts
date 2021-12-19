import * as bodyParser from 'body-parser';
import * as express from 'express';
import { Block, generateNextBlock, getBlockchain } from './models';
import {getSockets, initP2PServer, connectToPeers} from './p2p';


const HTTP_PORT: number = parseInt(process.env.HTTP_PORT) || 3001;
const P2P_PORT: number = parseInt(process.env.P2P_PORT) || 6001;


const initHttpServer = (httpPort: number) => {
    const app = express();
    app.use(bodyParser.json());

    app.get('/blocks', (req, res) => {
        res.send(getBlockchain());
    })

    app.post('/mint_block', (req, res) => {
        const newBlock: Block = generateNextBlock(req.body.data);
        res.send(newBlock);
    });

    app.get('/peers', (req, res) => {
        res.send(getSockets().map((s: any) => s._socket.remoteAddress + ':' +  s._socket.remotePort));
    });

    app.post('/add_peer', (req, res) => {
        connectToPeers(req.body.peer);
        res.send();
    });

    app.listen(httpPort, () => {
        console.log('Listening http on port: ' + httpPort);
    })
}

initHttpServer(HTTP_PORT);
initP2PServer(P2P_PORT);