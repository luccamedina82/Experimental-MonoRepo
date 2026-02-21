import type { FastifyCookieOptions } from '@fastify/cookie'

const baseCookieConfig: FastifyCookieOptions = {
    parseOptions: {
        httpOnly: true,
        secure: process.env.STAGE === 'production',
        sameSite: 'lax',
        path: '/',
    }
};

export const ACCESS_TOKEN_COOKIE_CONFIG: FastifyCookieOptions = {
    parseOptions: {
        ...baseCookieConfig.parseOptions,
        maxAge: 15 * 60, 
    },
};

export const REFRESH_TOKEN_COOKIE_CONFIG: FastifyCookieOptions = {
    parseOptions: {
        ...baseCookieConfig.parseOptions,
        maxAge: 7 * 24 * 60 * 60,
    }
};

export const COOKIE_NAMES = {
    ACCESS_TOKEN: 'token',
    REFRESH_TOKEN: 'refresh_token',
} as const;