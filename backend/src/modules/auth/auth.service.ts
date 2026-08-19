import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma.js';
import { ConflictError, UnauthorizedError } from '../../utils/AppError.js';
import { signAccessToken, generateRefreshToken, getRefreshTokenExpiryDate } from './token.utils.js';
import type { LoginInput, RegisterInput } from './auth.schema.js';

// Toda la lógica de negocio vive en AuthService.
const SALT_ROUNDS = 12;

export class AuthService {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new ConflictError('Ya existe una cuenta registrada con este email');
    }

    const clienteRole = await prisma.role.upsert({
      where: { name: 'CLIENTE' },
      update: {},
      create: { name: 'CLIENTE' },
    });

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        fullName: input.fullName,
        phone: input.phone,
        roleId: clienteRole.id,
      },
      include: { role: true },
    });

    return this.issueTokens(user.id, user.email, user.role.name);
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    return this.issueTokens(user.id, user.email, user.role.name);
  }

  async refresh(refreshToken: string) {
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { role: true } } },
    });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token inválido o expirado');
    }

    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    return this.issueTokens(stored.user.id, stored.user.email, stored.user.role.name);
  }

  async logout(refreshToken: string) {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revoked: true },
    });
  }

  private async issueTokens(userId: string, email: string, role: 'CLIENTE' | 'ADMIN') {
    const accessToken = signAccessToken({ sub: userId, email, role });
    const refreshToken = generateRefreshToken();

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: getRefreshTokenExpiryDate(),
      },
    });

    return { accessToken, refreshToken, user: { id: userId, email, role } };
  }
}

export const authService = new AuthService();