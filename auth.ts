import { SupabaseAdapter } from "@auth/supabase-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Kakao from "next-auth/providers/kakao";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Kakao, Google],
  ...(supabaseUrl && supabaseServiceRoleKey
    ? {
        adapter: SupabaseAdapter({
          url: supabaseUrl,
          secret: supabaseServiceRoleKey,
        }),
      }
    : {}),
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      // Protect specific routes
      if (
        pathname.startsWith("/profile") ||
        pathname.startsWith("/ai-recommendations")
      ) {
        return !!auth;
      }
      return true;
    },
    async session({ session, user }) {
      // When using database sessions (adapter), user is passed directly
      if (user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
});
