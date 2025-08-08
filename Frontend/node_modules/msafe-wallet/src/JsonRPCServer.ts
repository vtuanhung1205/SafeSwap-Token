import { Connector } from "./connector";
import { JsonRpcParamsSchemaByPositional, JsonRpcPayloadRequest, parse, format, JsonRpcError } from 'json-rpc-protocol'
import { decodeFromStr, encodeToStr } from "./coder";

type RPCMethod = (...params: any[]) => Promise<any>;

export class JsonRPCServer {

    constructor(public readonly connector: Connector, readonly methods: { [method: string]: RPCMethod }) {
        this.connector.on('message', data => this.onRequest(data!));
        this.connector.on('close', () => this.onClose());
    }

    private onRequest(data: string) {
        const req = parse(data) as JsonRpcPayloadRequest;
        if (req.type !== 'request') return;
        const method = this.methods[req.method];
        if (method === undefined) {
            const resp = format.error(req.id, new JsonRpcError("method not exist"));
            this.connector.send(resp);
            return;
        }
        method(...(req.params as JsonRpcParamsSchemaByPositional).map(param => decodeFromStr(param))).then(response => {
            const resp = format.response(req.id, encodeToStr(response));
            this.connector.send(resp);
        }).catch(err => {
            const resp = format.error(req.id, new JsonRpcError(String(err)));
            this.connector.send(resp);
        });
    }

    notify(type: string, data: any[]) {
        const notification = format.notification(type, data.map(encodeToStr));
        this.connector.send(notification);
    }

    get version() {
        return this.connector.version;
    }

    private onClose() {

    }
}