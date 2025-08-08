import { isSessionIDVersion, isVersionedHandshakeVersion } from "./version";

export class HandshakeMessage {
    static HANDSHAKE_REQ = 'HANDSHAKE_REQ';
    static HANDSHAKE_ACK = 'HANDSHAKE_ACK';
    static HANDSHAKE_PORT_ACK = 'HANDSHAKE_PORT_REQ';
    handshakeType: string;
    version: string | undefined;
    sessionID: number | undefined;
    constructor(handshakeType: string, version?: string, sessionID?: number) {
        this.handshakeType = handshakeType;
        if (version !== undefined) this.version = version;
        if (sessionID !== undefined) this.sessionID = sessionID;
    }

    // When responding to a lower-version client, a lower-version message is required.
    toString(messageVersion:string | undefined): string {
        if (isSessionIDVersion(messageVersion)) {
            if (this.sessionID === undefined) throw Error('sessionID is undefined');
            return `${this.handshakeType}:${this.version}:${this.sessionID}`;
        }
        if (isVersionedHandshakeVersion(messageVersion)) return `${this.handshakeType}:${this.version}`;
        return this.handshakeType;
    }

    isHandshakeMessage(handshakeType: string): boolean {
        if(this.handshakeType !== handshakeType) return false;
        if (isSessionIDVersion(this.version) && this.sessionID === undefined) return false;
        return true;
    }

    static fromString(message: string): HandshakeMessage {
        const [handshakeType, version, sessionID] = message.split(':');
        return new HandshakeMessage(handshakeType, version, Number(sessionID));
    }

}
