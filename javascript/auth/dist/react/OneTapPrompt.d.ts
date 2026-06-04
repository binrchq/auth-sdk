import type { AuthClientConfig, WindowMode } from '../types.js';
export interface OneTapPromptProps {
    config: AuthClientConfig;
    /** Called after successful sign-in */
    onSuccess?: () => void;
    /** Called when the user dismisses the prompt */
    onDismiss?: () => void;
    /** Site name shown in the header, e.g. "app-int.ipseek.cc" */
    siteName?: string;
    /** Privacy policy URL */
    privacyUrl?: string;
    /** Terms of service URL */
    termsUrl?: string;
    /** Auto-dismiss after N ms (default 8000, set 0 to disable) */
    autoCloseMs?: number;
    /** Override the client-level windowMode for the CTA button */
    windowMode?: WindowMode;
}
export declare function OneTapPrompt({ config, onSuccess, onDismiss, siteName, privacyUrl, termsUrl, autoCloseMs, windowMode, }: OneTapPromptProps): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=OneTapPrompt.d.ts.map