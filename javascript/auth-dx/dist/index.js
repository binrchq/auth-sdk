// @binrc/auth-dx — Read-only access to public DX cookies
// No encryption keys, no write capability — safe for third-party use
function getCookie(name) {
    if (typeof document === 'undefined')
        return null;
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
}
function parseSignedPayload(raw) {
    try {
        const dot = raw.indexOf('.');
        const b64 = dot >= 0 ? raw.slice(0, dot) : raw;
        const base64 = b64.replace(/-/g, '+').replace(/_/g, '/');
        const json = atob(base64);
        return JSON.parse(json);
    }
    catch {
        return null;
    }
}
function publicPrefix(mode) {
    return mode === 'staff' ? 'brcs' : 'brc';
}
function tenantPrefix(mode) {
    return mode === 'staff' ? 'binrc-staff-auth' : 'binrc-auth';
}
export class AuthDx {
    constructor(mode = 'default') {
        this.pub = publicPrefix(mode);
        this.tenant = tenantPrefix(mode);
    }
    /** Public user info cookie (name, email, avatar) */
    getClientAuthInfo() {
        const raw = getCookie(`${this.pub}-client-auth-info`);
        if (!raw)
            return null;
        return parseSignedPayload(raw);
    }
    /** Visit history cookie */
    getHlib() {
        const raw = getCookie(`${this.pub}-hlib`);
        if (!raw)
            return null;
        return parseSignedPayload(raw);
    }
    /** Device ID (persistent, 2-year TTL) */
    getDeviceId() {
        return getCookie(`${this.pub}-did`);
    }
    /** Language preference */
    getLang() {
        return getCookie(`${this.pub}-gn`);
    }
    /** Region */
    getRegion() {
        return getCookie(`${this.pub}-region`);
    }
}
// Default instance — works for any third-party app
export const authDx = new AuthDx('default');
//# sourceMappingURL=index.js.map