import React from 'react';
import type { AuthClientConfig, FedCMConfig, WindowMode } from '../types.js';
export interface RequireAuthProps {
    children: React.ReactNode;
    /** Shown while checking session (default: null) */
    fallback?: React.ReactNode;
    /** Custom render when not authenticated — receives signIn handler */
    renderUnauthenticated?: (ctx: {
        signIn: () => void;
    }) => React.ReactNode;
}
export declare function RequireAuth({ children, fallback, renderUnauthenticated, }: RequireAuthProps): import("react/jsx-runtime").JSX.Element | null;
export interface AuthProviderProps {
    children: React.ReactNode;
    config: AuthClientConfig;
    /** Convenience override for fedcmConfig — merged with config.fedcmConfig */
    fedcmConfig?: FedCMConfig;
    /** Convenience override for windowMode */
    windowMode?: WindowMode;
}
export declare function AuthProvider({ children, config, fedcmConfig, windowMode }: AuthProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useAuthContext(): {
    identity: import("../types.js").Identity | null;
    stage: import("../types.js").AuthStage;
    loginRequired: boolean;
    loading: boolean;
    signIn: (opts?: Parameters<import("../client.js").AuthClient["signIn"]>[0]) => void;
    signOut: (opts?: {
        returnTo?: string;
    }) => void;
    refresh: () => Promise<import("../types.js").Identity | null>;
    login: (opts?: Parameters<import("../client.js").AuthClient["signIn"]>[0]) => void;
    logout: (opts?: {
        returnTo?: string;
    }) => void;
} | null;
//# sourceMappingURL=RequireAuth.d.ts.map