import PrismaPkg from '@prisma/client'

const PrismaClient =
  ((PrismaPkg as unknown as { PrismaClient?: new () => unknown }).PrismaClient ??
    (PrismaPkg as unknown as { default?: new () => unknown }).default) as new () => unknown

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

const createPrismaClient = () => new PrismaClient()

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma