export async function checkSession(config) {
    const endpoint = config.sessionEndpoint ?? '/api/me';
    try {
        const res = await fetch(endpoint, { credentials: 'include' });
        if (!res.ok)
            return null;
        return await res.json();
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=session.js.map