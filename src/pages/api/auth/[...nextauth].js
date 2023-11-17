import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from '@/lib/prisma'

const providers = []

if (process.env.GOOGLE_ID) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    })
  )
}

export const authOptions = {
  providers,
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ session, user }) {
      session.user.userId = user.id
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== 'production',
}

// Next-auth passes through all options gotten from keycloak, excessive ones must be removed.
const adapterOverwrite = PrismaAdapter(prisma)

authOptions.adapter = {
  ...adapterOverwrite,
  linkAccount: (account) => {
    delete account['not-before-policy']
    delete account['refresh_expires_in']
    return adapterOverwrite.linkAccount(account)
  },
}

export default NextAuth(authOptions)
