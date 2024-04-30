import NextAuth from "next-auth"
import { DiscordProfile } from "next-auth/providers/discord"
import { Geolocation } from ""

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */

  interface Session {
    user: {
        name: string,
        image?: string,
        email?: string,
        geolocation?: Geolocation,
        discord?: DiscordProfile,
        store?: Record<string, any>,
    }
  }
}