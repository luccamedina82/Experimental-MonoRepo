import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/rt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';

@Module({
  controllers: [
    AuthController
  ],
  providers: [
    AuthService, 
    AccessTokenStrategy, 
    RefreshTokenStrategy
  ],
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => { 
          return{
              secret: configService.get<string>('JWT_SECRET'),
              signOptions: { 
                expiresIn: '15m' 
              }
            }
          }
      }
    ),
  ],  
  exports: [
    AccessTokenStrategy, 
    RefreshTokenStrategy, 
    PassportModule, 
    JwtModule
  ]
})
export class AuthModule {}