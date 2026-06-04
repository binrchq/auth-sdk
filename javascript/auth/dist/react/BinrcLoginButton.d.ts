import React from 'react';
import type { AuthClientConfig, WindowMode } from '../types.js';
export interface BinrcLoginButtonProps {
    config: AuthClientConfig;
    onSuccess?: () => void;
    /**
     * - "outline" (default) — white bg, border, logo + label inline
     * - "filled"            — brand purple bg, white text
     * - "icon"              — logo only
     */
    variant?: 'outline' | 'filled' | 'icon';
    /** Default: "使用 binrc 登录" */
    label?: string;
    block?: boolean;
    style?: React.CSSProperties;
    className?: string;
    /** Override the client-level windowMode for this button */
    windowMode?: WindowMode;
}
export declare function BinrcLoginButton({ config, onSuccess, variant, label, block, style, className, windowMode, }: BinrcLoginButtonProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=BinrcLoginButton.d.ts.map