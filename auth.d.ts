import { DefaultJWT, DefaultSession } from "next-auth";

import "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extend the built-in session type to include custom properties
   */
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
    supabaseAccessToken?: string;
  }

  /**
   * Extend the built-in user type
   */
  interface User {
    id: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extend the JWT type to include custom properties
   */
  interface JWT extends DefaultJWT {
    id?: string;
    supabaseAccessToken?: string;
  }
}
