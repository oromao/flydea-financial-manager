export const mockPrisma = {
  transaction: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  category: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  account: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  recurrence: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn((cb) => cb(mockPrisma)),
};

export const mockNextAuth = {
  getSession: jest.fn().mockResolvedValue({
    user: { id: "user-1", email: "test@example.com", role: "USER" },
  }),
  getServerSession: jest.fn().mockResolvedValue({
    user: { id: "user-1", email: "test@example.com", role: "USER" },
  }),
};

export const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
};

export const mockRateLimiter = {
  limit: jest.fn().mockResolvedValue({ success: true, remaining: 10 }),
};

export const infrastructureMocks = {
  prisma: mockPrisma,
  nextAuth: mockNextAuth,
  redis: mockRedis,
  rateLimiter: mockRateLimiter,
};