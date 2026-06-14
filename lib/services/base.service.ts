import { PrismaClient } from '@prisma/client'
import { handleError } from '../errors'

export abstract class BaseService {
  constructor(protected prisma: PrismaClient) {}

  protected handleError(error: unknown, operation: string): never {
    const appError = handleError(error)
    console.error(`Service error in ${operation}:`, {
      message: appError.message,
      code: appError.code,
      statusCode: appError.statusCode,
    })
    throw appError
  }

  protected async executeInTransaction<T>(
    callback: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$use' | '$extends'>) => Promise<T>
  ): Promise<T> {
    try {
      return await this.prisma.$transaction(callback)
    } catch (error) {
      throw handleError(error)
    }
  }
}
