import * as bodyParser from 'body-parser';
import * as express from 'express';
import { Block, Blockchain, Node } from './models';
import {SOCKETS, initP2PServer} from './p2p';


const HTTP_PORT: number = parseInt(process.env.HTTP_PORT) || 3001;
const P2P_PORT: number = parseInt(process.env.P2P_PORT) || 6001;
const NODE = new Node();


const initHttpServer = (httpPort: number) => {
    const app = express();
    app.use(bodyParser.json());

    app.get('/blocks', (req, res) => {
        res.send(NODE.getBlockchain().getBlocks());
    })

    app.post('/mint_block', (req, res) => {
        const newBlock: Block = NODE.getBlockchain().generateNextBlock(req.body.data);
        res.send(newBlock);
    });

    app.get('/peers', (req, res) => {
        // res.send(SOCKETS.map((s: any) => s._socket.remoteAddress + ':' +  s._socket.remotePort));
    });

    app.post('/add_peer', (req, res) => {
        // connectToPeers(req.body.peer);
        // res.send();
    });

    app.listen(HTTP_PORT, () => {
        console.log('Listening http on port: ' + HTTP_PORT);
    })
}

initHttpServer(HTTP_PORT);
initP2PServer(P2P_PORT);