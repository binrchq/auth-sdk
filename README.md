# auth-sdk — 对外开放 SDK (Public IdP Integration)

供第三方应用和外部服务将 Binrc 作为 **IdP (Identity Provider)** 接入。所有包均公开发布，**绝不包含任何平台底层内部对称密钥与私密算法**。

---

## 仓库与分发地址

| 语言生态 | 源码目录 | 包名 / 使用地址 | 适用场景 |
|:---|:---|:---|:---|
| **JavaScript / TypeScript (Web)** | `javascript/auth` | `@binrc/auth` (npm) | 浏览器 SPA、React / Vue 登录按钮与组件 |
| **JavaScript / TypeScript (Native)** | `javascript/auth-native` | `@binrc/auth-native` (npm) | Electron / React Native / Node.js CLI |
| **JavaScript / TypeScript (Server)** | `javascript/auth-server` | `@binrc/auth-server` (npm) | Express / Next.js / Remix / Nest.js 服务端 |
| **JavaScript / TypeScript (Tools)** | `javascript/address-layout` | `@binrc/address-layout` (npm) | 240+ 国家/地区通用地址布局与邮编校验 |
| **Golang (Server)** | `go/auth` | `binrc.com/auth-sdk/go/auth` | Gin / Web 服务端 OIDC + PKCE 中间件 |
| **Golang (Native)** | `go/auth-native` | `binrc.com/auth-sdk/go/auth-native` | Go CLI 终端工具 Device Code 模式 |
| **Rust (Server)** | `rust/auth` | `binrc-auth` (crates.io) | Axum / Web 服务端 OIDC 中间件 |
| **Rust (Native)** | `rust/auth-native` | `binrc-auth-native` (crates.io) | Tauri 桌面应用 / Rust CLI |
| **Python** | `python/` | `binrc-auth` (PyPI) | FastAPI / Flask / Django 中间件及 CLI |

---

## 快速上手

### 1. Web 前端（React / Vanilla JS）

```tsx
import { AuthProvider, BinrcLoginButton, useAuth } from '@binrc/auth'

export function App() {
  return (
    <AuthProvider clientId="your-client-id" issuerUrl="https://auth.binrc.com">
      <MyHeader />
    </AuthProvider>
  )
}

function MyHeader() {
  const { user, isAuthenticated, signOut } = useAuth()

  if (isAuthenticated) {
    return <div>欢迎, {user?.name}! <button onClick={signOut}>退出</button></div>
  }
  return <BinrcLoginButton mode="popup" />
}
```

### 2. Node.js 服务端（Express / Next.js / Remix）

```typescript
import { BinrcAuthServer } from '@binrc/auth-server'

const auth = new BinrcAuthServer({
  clientId: process.env.BINRC_CLIENT_ID!,
  clientSecret: process.env.BINRC_CLIENT_SECRET!,
  redirectUri: 'https://app.example.com/auth/callback',
  sessionSecret: process.env.SESSION_SECRET!,
})

// 1. 发起登录
app.get('/auth/login', (req, res) => {
  const { verifier, challenge } = auth.generatePkce()
  req.session.verifier = verifier
  res.redirect(auth.getAuthorizationUrl({ codeChallenge: challenge }))
})

// 2. 回调处理
app.get('/auth/callback', async (req, res) => {
  const session = await auth.exchangeCode({
    code: req.query.code as string,
    codeVerifier: req.session.verifier,
  })
  res.cookie('app_session', auth.encryptSession(session), { httpOnly: true, secure: true })
  res.redirect('/')
})
```

### 3. Go Web 服务端（Gin）

```go
import auth "binrc.com/auth-sdk/go/auth"

sdk := auth.New(auth.Config{
    AdapterURL:    "https://auth.binrc.com",
    ClientID:      "your-client-id",
    ClientSecret:  os.Getenv("OAUTH_CLIENT_SECRET"),
    SessionSecret: os.Getenv("SESSION_SECRET"),
    FrontendURL:   "https://app.example.com",
    RedirectURI:   "https://app.example.com/auth/callback",
    RedisStore:    redisStore,
})

r.GET("/auth/login",     sdk.LoginHandler())
r.GET("/auth/callback",  sdk.CallbackHandler())
r.POST("/auth/refresh",  sdk.RefreshHandler())
r.POST("/auth/logout",   sdk.LogoutHandler())

protected := r.Group("/api", sdk.Middleware())
protected.GET("/me", sdk.MeHandler())
```

### 4. Python 服务端（FastAPI）

```python
from fastapi import FastAPI, Depends, Request
from binrc_auth import BinrcAuthClient

client = BinrcAuthClient(
    client_id="your-client-id",
    client_secret="your-client-secret",
    redirect_uri="https://app.example.com/auth/callback"
)

@app.get("/auth/login")
async def login():
    verifier, challenge = client.generate_pkce()
    # 存储 verifier 到 session/cookie
    return {"url": client.get_authorization_url(code_challenge=challenge)}

@app.get("/auth/callback")
async def callback(code: str, request: Request):
    session = await client.exchange_code_for_tokens(code=code, code_verifier=...)
    return {"user_id": session.sub}
```
