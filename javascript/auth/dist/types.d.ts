export interface FedCMConfig {
    /** Try silent FedCM (mediation:'silent') on page load — no UI. Default: true */
    silentOnLoad?: boolean;
    /** Show FedCM account picker (mediation:'optional') on page load. Default: false.
     *  Enable on login pages; leave off on home/app pages to avoid interrupting users. */
    promptOnLoad?: boolean;
}
export type WindowMode = 'popup' | 'tab' | 'redirect';
export interface AuthClientConfig {
    /** Auth service domain, e.g. "https://auth.binrc.com" */
    authDomain: string;
    /** OAuth client_id */
    clientId: string;
    /** Local session check endpoint (default: "/api/me") */
    sessionEndpoint?: string;
    /**
     * Local login entry point for top-level redirect (default: "/auth/login").
     * Supports ?passive=1 and ?return_to= query params.
     */
    loginEndpoint?: string;
    /**
     * Internal apps only: local endpoint that returns { intent_id, prepare_url }
     * for popup/tab flow. When set, signIn() uses popup/tab instead of redirect.
     * (default: "/auth/prepare")
     *
     * ⚠️ Do not expose this to external/third-party SDK consumers.
     */
    prepareEndpoint?: string;
    /**
     * Local endpoint that accepts a FedCM ID token and exchanges it for a
     * local session cookie. (default: "/auth/fedcm-exchange")
     */
    fedcmTokenExchangeEndpoint?: string;
    /**
     * Enable FedCM (browser-native credential picker). Default: true.
     * Set to false in dev environments with self-signed TLS certificates.
     */
    fedcm?: boolean;
    /** Fine-grained FedCM timing control. Ignored when fedcm=false. */
    fedcmConfig?: FedCMConfig;
    /**
     * How to open the login window. Default: 'popup' when prepareEndpoint is set,
     * 'redirect' otherwise.
     */
    windowMode?: WindowMode;
    /**
     * Enable passive redirect probe on cold start. Default: true.
     * Set to false if you don't want the URL bar to flash auth.binrc.com on load.
     */
    passive?: boolean;
}
export interface Identity {
    id: string;
    [key: string]: unknown;
}
export type AuthStage = 'checking' | 'authenticated' | 'unauthenticated';
//# sourceMappingURL=types.d.ts.map