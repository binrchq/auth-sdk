import type { AuthClientConfig, Identity } from './types.js';
export interface SignInOptions {
    /**
     * passive=true: top-level passive redirect chain.
     * If not logged in, redirects back to returnTo?login_required=1.
     */
    passive?: boolean;
    /** Path to return to after login. Defaults to current URL. */
    returnTo?: string;
    /** Override the client-level windowMode for this call. */
    windowMode?: import('./types.js').WindowMode;
}
export declare class AuthClient {
    private config;
    constructor(config: AuthClientConfig);
    checkSession(): Promise<Identity | null>;
    /**
     * Initiate sign-in.
     *
     * FedCM is a page-level concern handled by useAuth() on mount — it runs
     * concurrently and independently of the login button. signIn() is the pure
     * OAuth path: popup/tab (handoff) or top-level redirect (thirdparty).
     *
     * Degradation:
     *   1. windowMode='popup'/'tab' + prepareEndpoint → open window, postMessage on done
     *   2. popup/tab blocked → fall back to redirect
     *   3. windowMode='redirect' → top-level navigate to /auth/login
     */
    signIn(opts?: SignInOptions): Promise<void>;
    signOut(opts?: {
        returnTo?: string;
    }): void;
    onSessionExpired(callback: () => void): () => void;
    destroy(): void;
    private _signInWindow;
    private _loginUrl;
    private _supportsFedCM;
    trySilentSignIn(): Promise<boolean>;
    triggerFedCMPrompt(): Promise<boolean>;
    private _fedcmPromise;
    private _tryFedCM;
    private _exchangeFedcmToken;
    private _makeNonce;
}
//# sourceMappingURL=client.d.ts.map