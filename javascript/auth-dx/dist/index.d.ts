export interface ClientAuthInfo {
    v: 1;
    user: {
        sub: string;
        name?: string;
        email?: string;
        phone?: string;
        avatar?: string;
        email_verified?: boolean;
        ts: number;
    };
}
export interface HlibInfo {
    v: 1;
    initialized: boolean;
    firstVisit: number;
    sessionCount: number;
    lastVisit: number;
}
export type DeployMode = 'default' | 'staff';
export declare class AuthDx {
    private pub;
    private tenant;
    constructor(mode?: DeployMode);
    /** Public user info cookie (name, email, avatar) */
    getClientAuthInfo(): ClientAuthInfo | null;
    /** Visit history cookie */
    getHlib(): HlibInfo | null;
    /** Device ID (persistent, 2-year TTL) */
    getDeviceId(): string | null;
    /** Language preference */
    getLang(): string | null;
    /** Region */
    getRegion(): string | null;
}
export declare const authDx: AuthDx;
//# sourceMappingURL=index.d.ts.map