# auth-sdk — 对外开放 SDK

供第三方应用和外部服务接入 binrc 认证平台。所有包均公开发布。

## 仓库地址

| 语言 | 源码 | 使用地址 |
|------|------|----------|
| Go | `github.com/binrchq/auth-sdk/go/*` | `binrc.com/auth-sdk/go/*`（GOPROXY 自动代理） |
| Rust | `github.com/binrchq/auth-sdk/rust/*` | crates.io |
| JavaScript | `github.com/binrchq/auth-sdk/javascript/*` | npmjs.com (`@binrc/*`) |

---

## 包列表

### Go

```
binrc.com/auth-sdk/go/auth
```
外部应用服务端 SDK（Gin）。标准 OIDC + PKCE 流程，session cookie 管理，FedCM 兑换。适合第三方 Go Web 服务。

```
binrc.com/auth-sdk/go/auth-native
```
Native 客户端助手（CLI / IoT / sidecar）。PKCE 生成、授权 URL 构建、code 换 token、refresh、Device Authorization Grant 轮询。纯标准库，无外部依赖。

```
binrc.com/auth-sdk/go/auth-core
```
加密基础层。AES-256-GCM 加解密，与 Go/Rust/TS 各端 session 格式完全兼容。`auth` 和 `auth-handoff` 均依赖此包。

---

### Rust

```toml
binrc-auth = { git = "https://github.com/binrchq/auth-sdk", ... }
# 或 crates.io 发布后：
binrc-auth = "0.1"
```
外部应用服务端 SDK（Axum）。OIDC + PKCE，session cookie，FedCM，Redis state。

```toml
binrc-auth-native = "0.1"
```
Native 客户端助手（Tauri / CLI / IoT）。PKCE、授权 URL、code 换 token、refresh、Device flow。

```toml
binrc-auth-core = "0.1"
```
加密基础层。AES-256-GCM，与 Go 端 session 格式兼容。

---

### JavaScript / TypeScript

```
@binrc/auth
```
浏览器前端认证 SDK。`AuthClient`（signIn / signOut / checkSession），FedCM 三层降级（silent → prompt → OAuth），popup / tab / redirect 窗口模式，React 组件（`AuthProvider`、`BinrcLoginButton`、`OneTapPrompt`、`RequireAuth`）。

```
@binrc/auth-native
```
Native 客户端助手（Electron 主进程 / Node.js CLI）。无 DOM 依赖。PKCE、授权 URL、code 换 token、refresh、Device flow 轮询（含 AbortSignal 支持）。

```
@binrc/auth-dx
```
只读公开 cookie 访问。无加密能力，可安全用于第三方页面。读取 `clientAuthInfo`、`hlib`、`deviceId`、`lang`、`region`。

```
@binrc/address-layout
```
地址布局、字段排列、邮政编码格式校验，支持 240+ 国家/地区。

---

## 快速上手

### Go 外部应用（thirdparty 模式）

```go
import auth "binrc.com/auth-sdk/go/auth"

sdk := auth.New(auth.Config{
    AdapterURL:        "https://auth.binrc.com",
    ClientID:          "your-app",
    ClientSecret:      os.Getenv("OAUTH_CLIENT_SECRET"),
    SessionSecret:     os.Getenv("SESSION_SECRET"),
    CookieDomain:      ".your-domain.com",
    FrontendURL:       "https://your-domain.com",
    RedirectURI:       "https://your-domain.com/auth/callback",
    RedisStore:        redisStore,
})

r.GET("/auth/login",        sdk.LoginHandler())
r.POST("/auth/callback",    sdk.CallbackHandler())
r.POST("/auth/refresh",     sdk.RefreshHandler())
r.POST("/auth/logout",      sdk.LogoutHandler())
r.GET("/api/me",            sdk.Middleware(), sdk.MeHandler())
```

### Go Native CLI（device flow）

```go
import authnative "binrc.com/auth-sdk/go/auth-native"

tokens, err := authnative.PollUntilDone(ctx, authnative.DevicePollParams{
    AuthDomain: "https://auth.binrc.com",
    ClientID:   "binrc-cli",
    DeviceCode: session.DeviceCode,
    Interval:   session.Interval,
}, func() { fmt.Print(".") })
```

### TypeScript 浏览器（React）

```tsx
import { AuthProvider, BinrcLoginButton, useAuthContext } from '@binrc/auth/react'

const config = {
  authDomain: 'https://auth.binrc.com',
  clientId: 'your-app',
}

export default function App() {
  return (
    <AuthProvider config={config}>
      <AppShell />
    </AuthProvider>
  )
}

function AppShell() {
  const { identity, signIn } = useAuthContext()!
  if (!identity) return <BinrcLoginButton config={config} />
  return <div>Hello {identity.name}</div>
}
```

### Rust 外部应用（Axum）

```rust
use binrc_auth::{AuthSdk, Config};

let sdk = AuthSdk::new(Config {
    adapter_url: "https://auth.binrc.com".into(),
    client_id: "your-app".into(),
    client_secret: Some(env::var("OAUTH_CLIENT_SECRET").unwrap()),
    session_secret: env::var("SESSION_SECRET").unwrap(),
    cookie_domain: ".your-domain.com".into(),
    ..Default::default()
});
```

---

## 认证模式

| 模式 | 适用场景 | 推荐 SDK |
|------|----------|----------|
| thirdparty（标准 OIDC） | 第三方 Web 服务 | Go `auth` / Rust `binrc-auth` |
| 浏览器前端 | SPA / MPA | `@binrc/auth` |
| Native（Device flow） | CLI / IoT / 桌面 | Go `auth-native` / TS `@binrc/auth-native` / Rust `binrc-auth-native` |
| 只读 DX | 第三方页面读取用户信息 | `@binrc/auth-dx` |

详细流程见 [认证流程协作规范](../../docs/client-auth-flows.md)。
