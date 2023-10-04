import { db } from "@/lib/db";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

function getGoogleCredentials() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        throw new Error("Missing Google credentials");
    }
    return { clientId, clientSecret };
}

const handler = NextAuth({
    adapter: UpstashRedisAdapter(db),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        GoogleProvider({
            clientId: getGoogleCredentials().clientId,
            clientSecret: getGoogleCredentials().clientSecret,
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            const dbUser = (await db.get(`user:${token.id}`)) as User | null;
            if (!dbUser) {
                if(user){
                    token.id = user.id;
                }
                return token;
            }

            return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                picture: dbUser.image,
            };
        },
        async session({ session, token }) {
            if(token){
                session.user.id = token.id
                session.user.name = token.name
                session.user.email = token.email
                session.user.image = token.picture
            }

            return session
        },
        redirect(){
            return '/dashboard'
        },
    }
});

export { handler as GET, handler as POST };
