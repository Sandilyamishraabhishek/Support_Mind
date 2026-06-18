import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');

      if (isOnAdmin) {
        if (!isLoggedIn) return false;
        if (userRole === 'ADMIN') return true;
        // If logged-in user is not admin, redirect to customer dashboard
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      if (isOnDashboard) {
        if (!isLoggedIn) return false;
        if (userRole === 'ADMIN') {
          // If logged-in admin goes to customer dashboard, redirect to admin dashboard
          return Response.redirect(new URL('/admin', nextUrl));
        }
        return true;
      }

      if (isLoggedIn) {
        const isAuthRoute = nextUrl.pathname === '/login' || nextUrl.pathname === '/register';
        if (isAuthRoute) {
          if (userRole === 'ADMIN') {
            return Response.redirect(new URL('/admin', nextUrl));
          }
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) session.user.id = token.id as string;
        session.user.role = (token.role as string) || 'USER';
      }
      return session;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;

