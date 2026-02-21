import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@repo/database"
import { FastifyRequest } from "fastify";
import { COOKIE_NAMES } from "../constants/cookie.constants";


@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private prisma: PrismaService,
        configService: ConfigService,
    ) {
        super({
            secretOrKey: configService.get<string>('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromExtractors([
                ExtractJwt.fromAuthHeaderAsBearerToken(),
                (request: FastifyRequest): string | null => {
                    return request?.cookies?.[COOKIE_NAMES.ACCESS_TOKEN] ?? null;
                }
            ]),
        });
    }

    async validate(payload: any) {
        const { id } = payload;

        const user = await this.prisma.user.findUnique({ 
            where: { id },
            select: { id: true, email: true }
        });

        if (!user) {
            throw new UnauthorizedException('Token no válido');
        }

        return user;
    }
}