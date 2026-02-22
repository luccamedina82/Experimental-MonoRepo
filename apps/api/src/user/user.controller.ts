import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import type { FastifyRequest } from 'fastify';

interface AuthenticatedRequest extends FastifyRequest {
  user?: { id: string; sessionId: string };
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMe(@Req() request: AuthenticatedRequest) {
    const userPayload = request?.user as { id: string; sessionId: string };
    return this.userService.getMe(userPayload.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.userService.findUser(id);
  }
}
