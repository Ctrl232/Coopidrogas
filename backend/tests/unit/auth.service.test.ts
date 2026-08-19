import { jest } from '@jest/globals';

const prismaMock = {
  user: {
    findUnique: jest.fn<() => Promise<unknown>>(),
    create: jest.fn<() => Promise<unknown>>(),
  },
  role: {
    upsert: jest.fn<() => Promise<unknown>>(),
  },
  refreshToken: {
    create: jest.fn<() => Promise<unknown>>(),
    findUnique: jest.fn<() => Promise<unknown>>(),
    update: jest.fn<() => Promise<unknown>>(),
    updateMany: jest.fn<() => Promise<unknown>>(),
  },
};

jest.unstable_mockModule('../../src/config/prisma.js', () => ({ prisma: prismaMock }));

jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    hash: jest.fn(async () => 'hashed-password'),
    compare: jest.fn(async () => true),
  },
}));

const { AuthService } = await import('../../src/modules/auth/auth.service.js');
const { ConflictError, UnauthorizedError } = await import('../../src/utils/AppError.js');

describe('AuthService', () => {
  let authService: InstanceType<typeof AuthService>;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
  });

  describe('register', () => {
    it('lanza ConflictError si el email ya existe', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: '1', email: 'test@coopidrogas.com' });

      await expect(
        authService.register({
          email: 'test@coopidrogas.com',
          password: 'Password123',
          fullName: 'Test User',
        }),
      ).rejects.toThrow(ConflictError);
    });

    it('crea un usuario nuevo y devuelve tokens', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      prismaMock.role.upsert.mockResolvedValueOnce({ id: 1, name: 'CLIENTE' });
      prismaMock.user.create.mockResolvedValueOnce({
        id: 'user-1',
        email: 'nuevo@coopidrogas.com',
        role: { name: 'CLIENTE' },
      });
      prismaMock.refreshToken.create.mockResolvedValueOnce({});

      const result = await authService.register({
        email: 'nuevo@coopidrogas.com',
        password: 'Password123',
        fullName: 'Nuevo Usuario',
      });

      expect(result.user.email).toBe('nuevo@coopidrogas.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });

  describe('login', () => {
    it('lanza UnauthorizedError si el usuario no existe', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        authService.login({ email: 'noexiste@coopidrogas.com', password: 'cualquiera' }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('lanza UnauthorizedError si el usuario está inactivo', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: '1',
        isActive: false,
        passwordHash: 'hash',
        role: { name: 'CLIENTE' },
      });

      await expect(
        authService.login({ email: 'inactivo@coopidrogas.com', password: 'cualquiera' }),
      ).rejects.toThrow(UnauthorizedError);
    });
  });
});