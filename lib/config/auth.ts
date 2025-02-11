import DiscordProvider from "next-auth/providers/discord";
import GithubProvider from "next-auth/providers/github";

const config = { 
    providers: [ 
      GithubProvider({
        clientId: process.env.AUTH_GITHUB_ID ?? '',
        clientSecret: process.env.AUTH_GITHUB_SECRET ?? '',
      }),
      // DiscordProvider({
      //     clientId: process.env.AUTH_DISCORD_ID ?? '',
      //     clientSecret: process.env.AUTH_DISCORD_SECRET ?? '',
      // }),
    ],
  callbacks: {
    session({ session, token, user } : any) {
      return session; // The return type will match the one returned in `useSession()`
    },
    jwt({ token, trigger, session } : any) {
      if (trigger === "update" && session?.name) {
        // Note, that `session` can be any arbitrary object, remember to validate it!
        token.name = session.name
      }
      return token
    },
  },
};

export default config;
// https://next-auth.js.org/getting-started/example
