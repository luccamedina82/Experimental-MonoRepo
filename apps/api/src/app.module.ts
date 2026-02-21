import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@repo/database';
import { AuthModule } from './auth/auth.module';
import * as path from 'path';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, '..', '..', '..', '.env'),
    }),
    PrismaModule,
    AuthModule,
    UserModule
  ],  
  controllers: [],
  providers: [],
})
export class AppModule {}
