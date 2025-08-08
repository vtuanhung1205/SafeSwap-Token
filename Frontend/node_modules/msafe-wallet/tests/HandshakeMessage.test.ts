import { HandshakeMessage } from '../src/HandshakeMessage';
import { Versions } from '../src/version';

describe('HandshakeMessage', () => {
    it('toHandshakeMessage', () => {
        const toHandshakeMessage = (type: string, version?: string, sessionID?: number) => new HandshakeMessage(type, version, sessionID);
        expect(toHandshakeMessage(HandshakeMessage.HANDSHAKE_REQ, undefined, undefined).toString(undefined)).toEqual(`${HandshakeMessage.HANDSHAKE_REQ}`);
        expect(toHandshakeMessage(HandshakeMessage.HANDSHAKE_ACK, undefined, undefined).toString(undefined)).toEqual(`${HandshakeMessage.HANDSHAKE_ACK}`);
        expect(toHandshakeMessage(HandshakeMessage.HANDSHAKE_PORT_ACK, undefined, undefined).toString(undefined)).toEqual(`${HandshakeMessage.HANDSHAKE_PORT_ACK}`);

        expect(toHandshakeMessage(HandshakeMessage.HANDSHAKE_REQ, Versions.ALLOWLIST, undefined).toString(undefined)).toEqual(`${HandshakeMessage.HANDSHAKE_REQ}`);
        expect(toHandshakeMessage(HandshakeMessage.HANDSHAKE_ACK, Versions.ALLOWLIST, undefined).toString(undefined)).toEqual(`${HandshakeMessage.HANDSHAKE_ACK}`);
        expect(toHandshakeMessage(HandshakeMessage.HANDSHAKE_PORT_ACK, Versions.ALLOWLIST, undefined).toString(undefined)).toEqual(`${HandshakeMessage.HANDSHAKE_PORT_ACK}`);

        expect(toHandshakeMessage(HandshakeMessage.HANDSHAKE_REQ, Versions.ALLOWLIST, undefined).toString(Versions.ALLOWLIST)).toEqual(`${HandshakeMessage.HANDSHAKE_REQ}:${Versions.ALLOWLIST}`);
        expect(toHandshakeMessage(HandshakeMessage.HANDSHAKE_ACK, Versions.ALLOWLIST, undefined).toString(Versions.ALLOWLIST)).toEqual(`${HandshakeMessage.HANDSHAKE_ACK}:${Versions.ALLOWLIST}`);
        expect(toHandshakeMessage(HandshakeMessage.HANDSHAKE_PORT_ACK, Versions.ALLOWLIST, undefined).toString(Versions.ALLOWLIST)).toEqual(`${HandshakeMessage.HANDSHAKE_PORT_ACK}:${Versions.ALLOWLIST}`);
        
        expect(toHandshakeMessage(HandshakeMessage.HANDSHAKE_REQ, Versions.SESSION_ID, 0).toString(Versions.ALLOWLIST)).toEqual(`${HandshakeMessage.HANDSHAKE_REQ}:${Versions.SESSION_ID}`);
        expect(toHandshakeMessage(HandshakeMessage.HANDSHAKE_ACK, Versions.SESSION_ID, 0).toString(Versions.ALLOWLIST)).toEqual(`${HandshakeMessage.HANDSHAKE_ACK}:${Versions.SESSION_ID}`);
        expect(toHandshakeMessage(HandshakeMessage.HANDSHAKE_PORT_ACK, Versions.SESSION_ID, 0).toString(Versions.ALLOWLIST)).toEqual(`${HandshakeMessage.HANDSHAKE_PORT_ACK}:${Versions.SESSION_ID}`);

        const sessionID = 0;
        expect(toHandshakeMessage(HandshakeMessage.HANDSHAKE_REQ, Versions.SESSION_ID, sessionID).toString(Versions.SESSION_ID)).toEqual(`${HandshakeMessage.HANDSHAKE_REQ}:${Versions.SESSION_ID}:${sessionID}`);
        expect(toHandshakeMessage(HandshakeMessage.HANDSHAKE_ACK, Versions.SESSION_ID, sessionID).toString(Versions.SESSION_ID)).toEqual(`${HandshakeMessage.HANDSHAKE_ACK}:${Versions.SESSION_ID}:${sessionID}`);
        expect(toHandshakeMessage(HandshakeMessage.HANDSHAKE_PORT_ACK, Versions.SESSION_ID, sessionID).toString(Versions.SESSION_ID)).toEqual(`${HandshakeMessage.HANDSHAKE_PORT_ACK}:${Versions.SESSION_ID}:${sessionID}`);
    });
});