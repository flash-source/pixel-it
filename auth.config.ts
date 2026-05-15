import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  pages: { signIn: '/login' },
  providers: [],

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user

      const protected_ = ['/create', '/generate', '/avatar']

      const isProtected = protected_.some((r) =>
        nextUrl.pathname.startsWith(r)
      )

      if (isProtected && !isLoggedIn) return false

      return true
    },
  },
}