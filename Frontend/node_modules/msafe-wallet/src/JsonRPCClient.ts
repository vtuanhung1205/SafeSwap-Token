import { Connector } from "./connector";
import { JsonRpcParamsSchemaByPositional, parse, format, JsonRpcPayloadResponse, JsonRpcPayloadNotification, JsonRpcPayloadError } from 'json-rpc-protocol'
import { encodeToStr, decodeFromStr } from "./coder";

type executorFunc = (data: any) => void;
type executor = { resolve: executorFunc, reject: executorFunc };
type notifier = (...params: any[]) => void;

export class JsonRPCClient {
    id: number = 0;
    executors: { [id: number]: executor } = {};
    constructor(public readonly connector: Connector, readonly notifiers: { [type: string]: notifier }) {
        this.connector.on('message', data => this.onMessage(data!));
        this.connector.on('close', () => this.onClose());
    }
    private onMessage(data: string) {
        const mesg = parse(data) as JsonRpcPayloadResponse | JsonRpcPayloadNotification | JsonRpcPayloadError;
        switch (mesg.type) {
            case 'notification':
                return this.onNotify(mesg.method, (mesg.params as JsonRpcParamsSchemaByPositional).map(decodeFromStr));
            case 'response':
                const { resolve } = this.executors[Number(mesg.id)];
                delete this.executors[Number(mesg.id)];
                return resolve(decodeFromStr(mesg.result));
            case 'error':
                const { reject } = this.executors[Number(mesg.id)];
                delete this.executors[Number(mesg.id)];
                return reject(mesg.error.message);
        }

    }
    async request(method: string, params: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
            const reqId = this.id++;
            this.executors[reqId] = { resolve, reject };
            const req = format.request(reqId, method, params.map(encodeToStr));
            this.connector.send(req);
        });
    }
    get version() {
        return this.connector.version;
    }
    private onNotify(type: string, data: any[]) {
        this.notifiers[type](...data);
    }
    private onClose() {

    }
}