import { createAuthClient } from '@neondatabase/neon-js/auth';

const authUrl = import.meta.env.VITE_NEON_AUTH_URL || 'https://fallback.neonauth.tech';

export const authClient = createAuthClient(authUrl);
