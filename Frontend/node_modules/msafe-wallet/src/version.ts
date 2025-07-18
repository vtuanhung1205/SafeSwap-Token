
/// Versions that introduces new features.
export enum Versions {
    ALLOWLIST = '2.0.5', // version that enable allowlist
    SESSION_ID = '2.1.4', // version that enable session id
};

/// Compare two version strings.
export function cmp(a: string, b: string): number {
    const parse = (version: string) => version.split('.').map(Number);
    const [majorA, minorA, batchA] = parse(a);
    const [majorB, minorB, batchB] = parse(b);
    if (majorA > majorB) return 1;
    if (majorA < majorB) return -1;
    if (minorA > minorB) return 1;
    if (minorA < minorB) return -1;
    if (batchA > batchB) return 1;
    if (batchA < batchB) return -1;
    return 0;
}

export function isSessionIDVersion(version: string | undefined): boolean {
    return version !== undefined && cmp(version, Versions.SESSION_ID) >= 0;
}

/// Check if the version is enable allowlist.
export function isAllowList(version: string | undefined): boolean {
    return version !== undefined && cmp(version, Versions.ALLOWLIST) >= 0;
}

export function isMultiSigFormatVersion(version: string | undefined): boolean {
    return version !== undefined;
}

/// Check if the version is enable versioned handshake message.
export function isVersionedHandshakeVersion(version: string | undefined): boolean {
    return version !== undefined;
}