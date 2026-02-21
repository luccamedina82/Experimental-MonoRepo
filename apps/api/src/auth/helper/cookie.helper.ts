import type { FastifyReply } from "fastify";
import { ACCESS_TOKEN_COOKIE_CONFIG, COOKIE_NAMES, REFRESH_TOKEN_COOKIE_CONFIG } from "../constants/cookie.constants";

export const setAuthCookies = (response: FastifyReply, tokens: { accessToken: string, refreshToken: string }) => {
        response.setCookie(COOKIE_NAMES.ACCESS_TOKEN, tokens.accessToken, {
            ...ACCESS_TOKEN_COOKIE_CONFIG.parseOptions,
        });

        response.setCookie(COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, {
            ...REFRESH_TOKEN_COOKIE_CONFIG.parseOptions,
        });
}

export const clearAuthCookies = (response: FastifyReply) => {
    response.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, {path: '/'});
    response.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, {path: '/'});
}