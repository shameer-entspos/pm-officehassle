import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      email?: string | null;
      access?: string | null;
      refresh?: string | null;
    };
  }

  interface JWT {
    email?: string | null;
    access?: string | null;
    refresh?: string | null;
  }

  interface User {
    email?: string | null;
    access?: string | null;
    refresh?: string | null;
  }
}
