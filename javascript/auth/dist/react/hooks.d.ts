import type { AuthClientConfig, Identity, AuthStage } from '../types.js';
import { AuthClient } from '../client.js';
export declare function useAuth(config: AuthClientConfig): {
    identity: Identity | null;
    stage: AuthStage;
    loginRequired: boolean;
    loading: boolean;
    signIn: (opts?: Parameters<AuthClient["signIn"]>[0]) => void;
    signOut: (opts?: {
        returnTo?: string;
    }) => void;
    refresh: () => Promise<Identity | null>;
    login: (opts?: Parameters<AuthClient["signIn"]>[0]) => void;
    logout: (opts?: {
        returnTo?: string;
    }) => void;
};
//# sourceMappingURL=hooks.d.ts.map