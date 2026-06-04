import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * OneTapPrompt — FedCM-style floating sign-in card.
 *
 * Mirrors the Google One Tap UX:
 *   - Appears top-right when the user is unauthenticated and a hint cookie exists
 *   - Shows avatar / name / email from the hint
 *   - "以 X 身份继续" CTA calls signIn()
 *   - Auto-dismisses after 8 s; manual X close suppresses for the session
 *   - Links to the app's privacy policy and terms of service
 */
import React from 'react';
import { AuthClient } from '../client.js';
function readHintCookie() {
    if (typeof document === 'undefined')
        return null;
    try {
        const match = document.cookie.split('; ').find(c => c.startsWith('brc-client-auth-info='));
        if (!match)
            return null;
        const raw = decodeURIComponent(match.slice('brc-client-auth-info='.length));
        try {
            return JSON.parse(raw);
        }
        catch { }
        const parts = raw.split('.');
        if (parts.length >= 2) {
            const pad = (s) => s + '=='.slice((s.length % 4) || 4);
            try {
                return JSON.parse(atob(pad(parts[0].replace(/-/g, '+').replace(/_/g, '/'))));
            }
            catch { }
        }
        return null;
    }
    catch {
        return null;
    }
}
const SESSION_DISMISS_KEY = 'binrc_onetap_dismissed';
function Avatar({ src, name, size = 40 }) {
    const initials = (name || '?').slice(0, 1).toUpperCase();
    if (src) {
        return (_jsx("img", { src: src, alt: name, width: size, height: size, style: { borderRadius: '50%', objectFit: 'cover', flexShrink: 0 } }));
    }
    return (_jsx("div", { style: {
            width: size, height: size, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6344F5 0%, #20e091 100%)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.4, fontWeight: 700, flexShrink: 0,
        }, children: initials }));
}
function BinrcLogo({ size = 20 }) {
    const id = React.useId();
    return (_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 1700 1700", width: size, height: size, "aria-hidden": "true", style: { display: 'block', flexShrink: 0 }, children: [_jsx("defs", { children: _jsx("clipPath", { id: id, children: _jsx("path", { d: "M838 96c-401.7 0-727.4 335.8-727.4 750s325.7 750 727.4 750c401.7 0 727.4-335.8 727.4-750S1239.7 96 838 96z" }) }) }), _jsx("g", { clipPath: `url(#${id})`, transform: "matrix(1.1145977,0,0,1.1144444,-83.607839,-89.986662)", children: _jsx("path", { fill: "#20e091", fillRule: "evenodd", d: "m838 96c-401.7 0-727.4 335.8-727.4 750 0 414.2 325.7 750 727.4 750 401.7 0 727.4-335.8 727.4-750C1565.4 431.8 1239.7 96 838 96zm446.9 944.6c-24.4 59.5-59.4 113-104 159-44.6 46-96.5 82.1-154.2 107.3-59.6 26-123.1 39.2-188.7 39.2-65.6 0-129-13.2-188.7-39.2-57.7-25.2-109.6-61.3-154.2-107.3-44.6-46-79.6-99.5-104-159-25.2-61.5-38-127-38-194.6 0-67.6 12.8-133.1 38-194.6 24.4-59.5 59.4-113 104-159 44.6-46 96.5-82.1 154.2-107.3C709 359.2 772.4 346 838 346c65.6 0 129 13.2 188.7 39.2 57.7 25.2 109.6 61.3 154.2 107.3 44.6 46 79.6 99.5 104 159 25.2 61.5 38 126.9 38 194.6 0 67.7-12.8 133-38 194.5zm246.6-626.2c74.9 0 135.7 60.8 135.7 135.7v592.2c0 74.9-60.8 135.7-135.7 135.7-74.9 0-135.7-60.8-135.7-135.7V550.1c0-74.9 60.8-135.7 135.7-135.7zm0 40c52.8 0 95.7 42.8 95.7 95.7v583.6c0 52.8-42.8 95.7-95.7 95.7-52.9 0-95.7-42.8-95.7-95.7V550.1c0-52.9 42.9-95.7 95.7-95.7zm-1389.9-40c74.9 0 135.7 60.8 135.7 135.7v592.2c0 74.9-60.8 135.7-135.7 135.7C66.7 1278 5.9 1217.2 5.9 1142.3V550.1c0-74.9 60.8-141.6 141.6-141.6zm0 40c52.8 0 95.7 42.8 95.7 95.7v583.6c0 52.8-42.8 95.7-95.7 95.7-52.9 0-95.7-42.8-95.7-95.7V550.1c0-52.9 42.9-95.7 95.7-95.7z" }) })] }));
}
export function OneTapPrompt({ config, onSuccess, onDismiss, siteName, privacyUrl = 'https://binrc.com/legal/privacy', termsUrl = 'https://binrc.com/legal/terms', autoCloseMs = 8000, windowMode, }) {
    const [visible, setVisible] = React.useState(false);
    const [busy, setBusy] = React.useState(false);
    const [hint, setHint] = React.useState(null);
    const timerRef = React.useRef(null);
    const clientRef = React.useRef(null);
    if (!clientRef.current)
        clientRef.current = new AuthClient(config);
    const site = siteName ?? (typeof window !== 'undefined' ? window.location.hostname : '');
    React.useEffect(() => {
        if (typeof window === 'undefined')
            return;
        if (sessionStorage.getItem(SESSION_DISMISS_KEY))
            return;
        const h = readHintCookie();
        if (h?.email || h?.name) {
            setHint(h);
            setVisible(true);
            if (autoCloseMs > 0) {
                timerRef.current = setTimeout(() => dismiss(), autoCloseMs);
            }
        }
        return () => { if (timerRef.current)
            clearTimeout(timerRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    function dismiss() {
        if (timerRef.current)
            clearTimeout(timerRef.current);
        sessionStorage.setItem(SESSION_DISMISS_KEY, '1');
        setVisible(false);
        onDismiss?.();
    }
    async function handleContinue() {
        if (busy)
            return;
        setBusy(true);
        if (timerRef.current)
            clearTimeout(timerRef.current);
        try {
            await clientRef.current.signIn({ windowMode });
            setVisible(false);
            onSuccess?.();
        }
        finally {
            setBusy(false);
        }
    }
    if (!visible || !hint)
        return null;
    const displayName = hint.name || hint.email?.split('@')[0] || '';
    return (_jsxs("div", { role: "dialog", "aria-modal": "false", "aria-label": `使用 binrc 账号登录 ${site}`, style: {
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            width: 360,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.08)',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            overflow: 'hidden',
            animation: 'binrc_onetap_in 220ms cubic-bezier(0.22,1,0.36,1)',
        }, children: [_jsx("style", { children: `
        @keyframes binrc_onetap_in {
          from { opacity: 0; transform: translateY(-12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)     scale(1);    }
        }
      ` }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 12px', borderBottom: '1px solid #f0f0f0' }, children: [_jsx(BinrcLogo, { size: 20 }), _jsxs("span", { style: { flex: 1, fontSize: 13, color: '#444', fontWeight: 500, lineHeight: 1.3 }, children: ["\u4F7F\u7528 binrc \u8D26\u53F7\u767B\u5F55 ", _jsx("span", { style: { color: '#111', fontWeight: 600 }, children: site })] }), _jsx("button", { onClick: dismiss, "aria-label": "\u5173\u95ED", style: {
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#999', fontSize: 18, lineHeight: 1, padding: '2px 4px',
                            borderRadius: 4, flexShrink: 0,
                        }, onMouseEnter: e => { (e.currentTarget.style.color = '#333'); }, onMouseLeave: e => { (e.currentTarget.style.color = '#999'); }, children: "\u00D7" })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 12px' }, children: [_jsx(Avatar, { src: hint.avatar, name: displayName, size: 44 }), _jsxs("div", { style: { minWidth: 0 }, children: [displayName && (_jsx("div", { style: { fontSize: 14, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: displayName })), hint.email && (_jsx("div", { style: { fontSize: 13, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: hint.email }))] })] }), _jsx("div", { style: { padding: '0 16px 14px' }, children: _jsx("button", { onClick: handleContinue, disabled: busy, style: {
                        width: '100%', height: 42,
                        background: busy ? '#8a78f7' : '#6344F5',
                        color: '#fff', border: 'none', borderRadius: 8,
                        fontSize: 14, fontWeight: 600, cursor: busy ? 'wait' : 'pointer',
                        transition: 'background 120ms',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }, onMouseEnter: e => { if (!busy)
                        e.currentTarget.style.background = '#7c6af7'; }, onMouseLeave: e => { if (!busy)
                        e.currentTarget.style.background = '#6344F5'; }, children: busy ? '登录中…' : (displayName ? `以"${displayName}"的身份继续` : '继续登录') }) }), _jsxs("div", { style: { padding: '0 16px 16px', fontSize: 11, color: '#888', lineHeight: 1.6 }, children: ["\u5982\u679C\u60A8\u7EE7\u7EED\uFF0Cbinrc \u4F1A\u5C06\u60A8\u7684\u59D3\u540D\u3001\u90AE\u7BB1\u548C\u4E2A\u4EBA\u8D44\u6599\u7167\u7247\u5206\u4EAB\u7ED9\u6B64\u7F51\u7AD9\u3002 \u60A8\u53EF\u67E5\u770B\u6B64\u7F51\u7AD9\u7684", ' ', _jsx("a", { href: privacyUrl, target: "_blank", rel: "noreferrer", style: { color: '#6344F5', textDecoration: 'none' }, onMouseEnter: e => { (e.currentTarget.style.textDecoration = 'underline'); }, onMouseLeave: e => { (e.currentTarget.style.textDecoration = 'none'); }, children: "\u9690\u79C1\u653F\u7B56" }), "\u548C", ' ', _jsx("a", { href: termsUrl, target: "_blank", rel: "noreferrer", style: { color: '#6344F5', textDecoration: 'none' }, onMouseEnter: e => { (e.currentTarget.style.textDecoration = 'underline'); }, onMouseLeave: e => { (e.currentTarget.style.textDecoration = 'none'); }, children: "\u670D\u52A1\u6761\u6B3E" }), "\u3002"] })] }));
}
//# sourceMappingURL=OneTapPrompt.js.map