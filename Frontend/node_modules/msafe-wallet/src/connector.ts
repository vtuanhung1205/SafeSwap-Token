import { version } from '../package.json';
import { HandshakeMessage } from './HandshakeMessage';
import { isAllowList, isSessionIDVersion } from './version';

export class Connector {
    static version = version;
    static sessionID = 0;
    connected = true;
    onClose?: () => void;
    onMessage?: (data: any) => void;
    constructor(public readonly port: MessagePort, public readonly peerVersion: string | undefined, public readonly sessionID: number | undefined) {
        this.port.onmessage = (ev) => {
            this.onMessage && this.onMessage(ev.data);
        };
        this.port.onmessageerror = () => {
            this.close();
        };
    }

    send(data: any) {
        this.port.postMessage(data);
    }

    on(type: 'close' | 'message', handle: (data?: string) => void) {
        switch (type) {
            case 'close':
                this.onClose = handle;
                break;
            case 'message':
                this.onMessage = handle;
                break;
            default:
                throw Error("invlaid type");
        }
    }

    get version() {
        return {
            self: Connector.version,
            peer: this.peerVersion,
        }
    }

    close() {
        if (this.connected) {
            this.port.close();
            this.connected = false;
            this.onClose && this.onClose();
        }
    }

    static newSessionID() {
        return Connector.sessionID++;
    }

    // client connect to server
    static async connect(targetWindow: any, origins: string[]): Promise<Connector> {
        return new Promise((resolve, rejected) => {
            const sessionID = Connector.newSessionID();
            let cleaner = () => { };
            let timer = setTimeout(() => {
                cleaner();
                rejected(`connect timeout: ${sessionID}`);
            }, 1000);
            const handle = (ev: MessageEvent) => {
                const port = ev.ports[0];
                if (!origins.includes(ev.origin)) return;
                if (typeof ev.data !== 'string') return;
                const handshakeMessage = HandshakeMessage.fromString(ev.data);
                if (!handshakeMessage.isHandshakeMessage(HandshakeMessage.HANDSHAKE_PORT_ACK)) return;
                if (handshakeMessage.sessionID !== sessionID) return;
                cleaner();
                resolve(new Connector(port, handshakeMessage.version, sessionID));
            };
            cleaner = () => {
                clearTimeout(timer);
                window.removeEventListener('message', handle);
            };
            window.addEventListener('message', handle);
            const handshakeMessage = new HandshakeMessage(HandshakeMessage.HANDSHAKE_REQ, Connector.version, sessionID);
            targetWindow.postMessage(handshakeMessage.toString(handshakeMessage.version), '*');
        });
    }
    // server listening connection request
    static accepts(origin: string, handler: (connector: Connector) => void): () => void {
        origin = new URL(origin).origin;
        const handle = (ev: MessageEvent) => {
            if (ev.origin !== origin) return;
            if (typeof ev.data !== 'string') return;
            const handshakeMessage = HandshakeMessage.fromString(ev.data);
            if (!handshakeMessage.isHandshakeMessage(HandshakeMessage.HANDSHAKE_REQ)) return;

            const peerVersion = handshakeMessage.version;
            const thisVersion = Connector.version;
            if (isSessionIDVersion(peerVersion)) {
                const channelPair = new MessageChannel();
                const replyMessage = new HandshakeMessage(HandshakeMessage.HANDSHAKE_PORT_ACK, thisVersion, handshakeMessage.sessionID);
                (ev.source as Window).postMessage(replyMessage.toString(peerVersion), ev.origin, [channelPair.port2]);
                handler(new Connector(channelPair.port1, peerVersion, handshakeMessage.sessionID));
            } else if (isAllowList(peerVersion)) {
                const channelPair = new MessageChannel();
                const replyMessage = new HandshakeMessage(HandshakeMessage.HANDSHAKE_PORT_ACK, thisVersion);
                (ev.source as Window).postMessage(replyMessage.toString(peerVersion), ev.origin, [channelPair.port2]);
                handler(new Connector(channelPair.port1, peerVersion, undefined));
            } else {
                const port = ev.ports[0];
                const replyMessage = new HandshakeMessage(HandshakeMessage.HANDSHAKE_ACK, thisVersion);
                port.postMessage(replyMessage.toString(peerVersion));
                handler(new Connector(ev.ports[0], peerVersion, undefined));
            }
        };
        window.addEventListener('message', handle);
        return () => window.removeEventListener('message', handle);
    }

    static async accept(origin: string): Promise<Connector> {
        return new Promise((resolve) => {
            const cleaner = this.accepts(origin, (connector) => {
                resolve(connector);
                cleaner();
            });
        });
    }
}