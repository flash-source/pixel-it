import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { authConfig } from './auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // prisma's type can be incompatible with the adapter signature in some setups;
  // cast to any to satisfy the adapter's parameter type
  adapter: PrismaAdapter(prisma as any),
  session: { strategy: 'jwt' },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = z.object({ email: z.string().email(), password: z.string().min(6) }).safeParse(credentials)
        if (!parsed.success) return null
        const user = await (prisma as any).user.findUnique({ where: { email: parsed.data.email } })
        if (!user || !user.password) return null
        const valid = await bcrypt.compare(parsed.data.password, user.password)
        if (!valid) return null
        return user
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
})