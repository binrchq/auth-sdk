import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { useAuth } from './hooks.js';
export function RequireAuth({ children, fallback = null, renderUnauthenticated, }) {
    const auth = useAuthContext();
    if (!auth)
        throw new Error('RequireAuth must be used inside <AuthProvider>');
    if (auth.loading)
        return _jsx(_Fragment, { children: fallback });
    if (!auth.identity) {
        if (renderUnauthenticated) {
            return _jsx(_Fragment, { children: renderUnauthenticated({ signIn: () => auth.signIn() }) });
        }
        return null;
    }
    return _jsx(_Fragment, { children: children });
}
const AuthContext = React.createContext(null);
export function AuthProvider({ children, config, fedcmConfig, windowMode }) {
    const mergedConfig = React.useMemo(() => ({
        ...config,
        ...(fedcmConfig && { fedcmConfig: { ...config.fedcmConfig, ...fedcmConfig } }),
        ...(windowMode !== undefined && { windowMode }),
    }), [config, fedcmConfig, windowMode]);
    const auth = useAuth(mergedConfig);
    return (_jsx(AuthContext.Provider, { value: auth, children: children }));
}
export function useAuthContext() {
    return React.useContext(AuthContext);
}
//# sourceMappingURL=RequireAuth.js.map