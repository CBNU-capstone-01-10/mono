import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import prismaClient from '../../src/database';

jest.mock('../../src/database/', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

export const prismaClientMock =
  prismaClient as unknown as DeepMockProxy<PrismaClient>;
