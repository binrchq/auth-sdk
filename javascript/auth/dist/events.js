// Session-expired event bus — fired by api.ts 401 interceptor
const SESSION_EXPIRED = 'binrc:session-expired';
export function dispatchSessionExpired() {
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED));
}
export function onSessionExpired(callback) {
    window.addEventListener(SESSION_EXPIRED, callback);
    return () => window.removeEventListener(SESSION_EXPIRED, callback);
}
//# sourceMappingURL=events.js.map