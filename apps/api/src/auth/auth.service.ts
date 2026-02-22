import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@repo/database';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '@repo/shared';
import { randomUUID } from 'crypto';
import { UAParser } from 'ua-parser-js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto, userAgent: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }
    const newSessionId = randomUUID();
    const tokens = await this.generateTokens(user.id, newSessionId);
    const hashedRt = await bcrypt.hash(tokens.refreshToken, 10);

    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    const browser = result.browser.name || 'Navegador desconocido';
    const os = result.os.name || 'OS desconocido';
    const deviceType = result.device.type === 'mobile' ? '📱 Móvil' : '💻 PC';

    const deviceInfo = `${deviceType} - ${browser} en ${os}`;

    await this.prisma.session.create({
      data: {
        id: newSessionId,
        user_id: user.id,
        hashed_rt: hashedRt,
        device_info: deviceInfo,
      },
    });

    return tokens;
  }

  private async generateTokens(userId: string, sessionId: string) {
    const payload = {
      id: userId,
      sessionId: sessionId,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const session = await this.prisma.session.findFirst({
      where: { user_id: user.id },
    });

    if (!session || !session.hashed_rt) {
      throw new Error('Sesión no encontrada');
    }

    const rtMatches = await bcrypt.compare(refreshToken, session.hashed_rt);

    if (!rtMatches) {
      throw new Error('Refresh token inválido');
    }

    const tokens = await this.generateTokens(user.id, session.id);

    const newHashedRt = await bcrypt.hash(tokens.refreshToken, 10);

    await this.prisma.session.update({
      where: { id: session.id },
      data: { hashed_rt: newHashedRt },
    });

    return tokens;
  }
}
