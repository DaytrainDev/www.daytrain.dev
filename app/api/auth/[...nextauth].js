import NextAuth from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
export const authOptions = {
  providers: [
    // GithubProvider({
    //   clientId: process.env.GITHUB_ID,
    //   clientSecret: process.env.GITHUB_SECRET,
    // }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET
    })
    // https://next-auth.js.org/providers
  ],
}

export default NextAuth(authOptions)