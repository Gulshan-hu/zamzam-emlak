import { PrismaClient } from '@prisma/client'

export class BaseRepository {
  constructor(protected prisma: PrismaClient) {}

  protected handleError(error: unknown, operation: string): never {
    throw error
  }
}
