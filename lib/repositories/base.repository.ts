import { PrismaClient } from '@prisma/client'

export class BaseRepository {
  constructor(protected prisma: PrismaClient) {}

  protected handleError(error: unknown, operation: string): never {
    console.error(`Database error in ${operation}:`, error)
    throw error
  }
}
