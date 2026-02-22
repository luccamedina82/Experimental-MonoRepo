import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginSchema, type LoginDto } from '@repo/shared';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { setAuthCookies } from './helper/cookie.helper';
import type { FastifyReply } from 'fastify/types/reply';
import type { FastifyRequest } from 'fastify';
import { AuthGuard } from '@nestjs/passport';
import { COOKIE_NAMES } from './constants/cookie.constants';

interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
    email: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: FastifyReply,
    @Req() request: FastifyRequest,
  ) {
    const userAgent =
      request.headers['user-agent'] || 'Dispositivo desconocido';

    const tokens = await this.authService.login(loginDto, userAgent);

    setAuthCookies(response, tokens);

    return { message: 'Login exitoso' };
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  async refreshToken(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    const refreshToken = request.cookies[COOKIE_NAMES.REFRESH_TOKEN];
    if (!refreshToken) {
      throw new ForbiddenException('Refresh token no encontrado');
    }
    const tokens = await this.authService.refreshTokens(user.id, refreshToken);
    setAuthCookies(response, tokens);
    return { message: 'Sesión renovada con éxito' };
  }
}
