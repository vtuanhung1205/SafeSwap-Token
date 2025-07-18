import { Connector } from '../src/connector'
import { HandshakeMessage } from '../src/HandshakeMessage';

const serverOrigin = 'https://m-safe.io';
const clientOrigin = 'https://dapp.io';
const invalidOrigin = 'https://invalid.io';

/// We use FakeMessageEvent to simulate MessageEvent, because MessageEvent check source type is Window.
class FakeMessageEvent {
    data: any;
    origin: string;
    source: any;
    ports: any[];
    constructor(message: any, option: any) {
        if (message !== 'message') throw new Error('invalid message');
        this.data = option.data;
        this.origin = option.origin;
        this.source = option.source;
        this.ports = option.ports || [];
    }
}

type EventHandler = (ev: FakeMessageEvent) => void;
/// We use FakeWindow to simulate multiply window object, because jest doesn't support child iframe.
class FakeWindows {
    origin: string;
    targetWindow!: FakeWindows;
    ports: MessagePort[] = [];
    handle?: EventHandler;
    constructor(origin: string) {
        this.origin = origin;
    }
    setTargetWindow(targetWindow: FakeWindows) {
        this.targetWindow = targetWindow;
    }

    addEventListener(type = 'message', handle: EventHandler) {
        this.handle = handle;
    }
    removeEventListener(type = 'message', handle: EventHandler) {
        this.handle = undefined;
    }
    postMessage(message: string, origin: string, ports?: MessagePort[]) {
        ports && this.ports.push(...ports);
        if (origin === '*' || origin === this.origin) {
            this.handle && this.handle(new FakeMessageEvent('message', {
                data: message, origin: this.targetWindow.origin, ports: ports, source: this.targetWindow as any
            }));
        }
    }
    clean() {
        this.ports.forEach(port => port.close());
        this.ports = [];
        this.handle = undefined;
    }
};

const serverWindow = new FakeWindows(serverOrigin);
const clientWindow = new FakeWindows(clientOrigin);
serverWindow.setTargetWindow(clientWindow);
clientWindow.setTargetWindow(serverWindow);

/// switch to server/client window
const switchToServer = () => global.window = serverWindow as any;
const switchToClient = () => global.window = clientWindow as any;

test("Connector integration test", async () => {
    let done: (v: any) => void;

    switchToServer();
    const cleaner = Connector.accepts(clientOrigin, (connector: Connector) => {
        expect(connector.connected).toEqual(true);
        connector.on("message", (data: any) => {
            expect(data).toEqual("ping");
            connector.send("pong");
        })
    });
    switchToClient();
    const connector = await Connector.connect(serverWindow, [invalidOrigin, serverOrigin]);

    switchToServer();
    cleaner();
    expect(connector.connected).toEqual(true);
    connector.on("message", (data: any) => {
        expect(data).toEqual("pong");
        done(undefined);
    });
    connector.send("ping");

    await new Promise(resolve => done = resolve);
    serverWindow.clean();
    clientWindow.clean();
});

describe("Connector unit test", () => {
    const fakeVersion = '2.0.0';
    const connect_deprecated = (targetWindow: any, origin: string): Promise<Connector> => {
        return new Promise((resolve, rejected) => {
            const channelPair = new MessageChannel();
            let timer = setTimeout(rejected, 1000);
            channelPair.port1.onmessage = ev => {
                if(typeof ev.data !== 'string') return;
                const handshakeMessage = HandshakeMessage.fromString(ev.data);
                if (handshakeMessage.isHandshakeMessage(HandshakeMessage.HANDSHAKE_ACK)) {
                    clearTimeout(timer);
                    const version = handshakeMessage.version;
                    resolve(new Connector(channelPair.port1, version, undefined));
                }
            };
            const message = `${HandshakeMessage.HANDSHAKE_REQ}:${fakeVersion}`;
            targetWindow.postMessage(message, origin, [channelPair.port2]);
        });
    }

    afterEach(() => {
        serverWindow.clean();
        clientWindow.clean();
    });

    it("connect with invalid origins", async () => {
        switchToServer();
        const cleaner = Connector.accepts(clientOrigin, (connector: Connector) => {
            expect(connector.version.peer).toEqual(connector.version.self);
        });

        switchToClient();
        await expect(Connector.connect(serverWindow, [invalidOrigin])).rejects.toContain('connect timeout');
        switchToServer();
        cleaner();
    });

    it("connect with client use old handshake", async () => {
        switchToServer();
        const cleaner = Connector.accepts(clientOrigin, (connector: Connector) => {
            expect(connector.version.peer).toEqual(fakeVersion);
        });

        switchToClient();
        const connector = await connect_deprecated(serverWindow, serverOrigin);
        switchToServer();
        cleaner();
        // check version
        expect(connector.version.peer).toEqual(Connector.version);
        connector.close();
    });

    it("connect with client has version", async () => {
        switchToServer();
        const cleaner = Connector.accepts(clientOrigin, (connector: Connector) => {
            expect(connector.version.peer).toEqual(connector.version.self);
        });

        switchToClient();
        const connector = await Connector.connect(serverWindow, [serverOrigin]);
        switchToServer();
        cleaner();
        // check version
        expect(connector.version.peer).toEqual(connector.version.self);
        connector.close();
    });

    it("connect with client without version", async () => {
        switchToServer();
        const cleaner = Connector.accepts(clientOrigin, (connector: Connector) => {
            expect(connector.version.peer).toEqual(undefined);
        });

        const postMessage = serverWindow.postMessage.bind(serverWindow);
        serverWindow.postMessage = (message: string, origin: string, ports: MessagePort[]) => {
            const handshakeMessage = HandshakeMessage.fromString(message);
            if (handshakeMessage.isHandshakeMessage(HandshakeMessage.HANDSHAKE_REQ)) {
                message = handshakeMessage.toString(undefined);
            }
            return postMessage(message, origin, ports);
        }

        switchToClient();
        const connector = await connect_deprecated(serverWindow, serverOrigin);
        switchToServer();
        cleaner();

        // check version
        expect(connector.version.peer).toEqual(undefined);
        connector.close();
        serverWindow.postMessage = postMessage;
    });
});