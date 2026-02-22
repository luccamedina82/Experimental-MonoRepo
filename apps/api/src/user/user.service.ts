import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@repo/database';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findUser(id: string) {
    return await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        sessions: true,
      },
    });
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }
}
