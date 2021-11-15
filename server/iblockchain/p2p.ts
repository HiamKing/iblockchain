import * as WebSocket from 'ws';
import {Server} from 'ws';
import {Block, Blockchain, Node} from './models';

const SOCKETS: WebSocket[] = [];

enum MessageType {
        QUERY_LATEST = 0,
        QUERY_ALL = 1,
        RESPONSE_BLOCKCHAIN = 2
}

class Message {
    private type: MessageType;
    private data: any;

    public getType(): MessageType {
        return this.type;
    }

    public getData(): any {
        return this.data;
    }
}


const JSonToObject = <T>(data: string): T => {
    try {
        return JSON.parse(data);
    } catch(e) {
        console.log(e);
        return null;
    }
}

const initP2PServer  = (p2pPort: number) => {
    const server: Server = new WebSocket.Server({port: p2pPort});

    server.on('connection', (ws: WebSocket) => {
        initConnection(ws);
    });
    console.log('Listening websocket p2p port on: ' + p2pPort);
}

const initConnection = (ws: WebSocket) => {
    SOCKETS.push(ws);
    // initMessageHandler(ws);
    // initErrorHandler(ws);
    // write(ws, queryChainLengthMsg());
}

const initMessageHandler = (ws: WebSocket) => {
    ws.on('message', (data: string) => {
        const message: Message = JSonToObject<Message>(data);
        if(message === null) {
            console.log('Could not parse received JSON message: ' + data);
            return;
        }
        console.log('Received message' + JSON.stringify(message));

        switch(message.getType()) {
            case MessageType.QUERY_LATEST:
                // write(ws, responseLatestMessage());
                break;
            case MessageType.QUERY_ALL:
                // write(ws, responseLatestMessage());
                break;
            case MessageType.RESPONSE_BLOCKCHAIN:
                // const receivedBlocks: Blockchain = JSonToObject<Blockchain>(message.data);
                // if(receivedBlocks === null) {
                //     console.log('Invalid blocks received: ');
                //     console.log(message.getData());
                //     break;
                // }
                // handleBlockchainResponse(receivedBlocks);
                break;
            }
    });
}




export {SOCKETS, initP2PServer};
