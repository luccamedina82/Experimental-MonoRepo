import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyRequest } from 'fastify';
import { PrismaService } from '@repo/database';
import * as bcrypt from 'bcrypt'; 
import { COOKIE_NAMES } from '../constants/cookie.constants';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private prisma: PrismaService,
    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: FastifyRequest): string | null => request?.cookies?.[COOKIE_NAMES.REFRESH_TOKEN] ?? null,
      ]),
      
      passReqToCallback: true,
    });
  }

  async validate(request: FastifyRequest, payload: any) {
    
    const refreshToken = request?.cookies?.[COOKIE_NAMES.REFRESH_TOKEN];
    if (!refreshToken) {
      throw new ForbiddenException('Refresh token no encontrado');
    }

    const { id: userId, sessionId } = payload; 
    if (!sessionId) {
      throw new UnauthorizedException('El token no tiene un ID de sesión válido');
    }

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: { select: { id: true, email: true } } },
    });

    if (!session || !session.user) {
      throw new ForbiddenException('Sesión no encontrada o revocada');
    }

    const isRefreshTokenValid = await bcrypt.compare(refreshToken, session.hashed_rt);

    if (!isRefreshTokenValid) {
      throw new ForbiddenException('El token no coincide (posible robo de token)');
    }

    return session.user;
  }
}