import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import prisma from "./db.js";

// Google OAuth Configuration
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("No email associated with this Google account."), null);
          }

          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            // Link Google account if not linked already
            const updateData = {};
            if (!user.googleId) {
              updateData.googleId = profile.id;
              updateData.emailVerified = true;
            }
            if (!user.avatar) {
              const incomingAvatar = profile.photos?.[0]?.value || profile._json?.picture || null;
              if (incomingAvatar) {
                updateData.avatar = incomingAvatar;
              }
            }
            if (Object.keys(updateData).length > 0) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: updateData,
              });
            }
          } else {
            // Register a new user via Google
            user = await prisma.user.create({
              data: {
                name: profile.displayName || profile.name?.givenName || "Google User",
                email,
                googleId: profile.id,
                emailVerified: true, // Google verifies emails
                role: "VISITOR",
                avatar: profile.photos?.[0]?.value || profile._json?.picture || null,
              },
            });
            user.isNew = true;
          }
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing. Google Social Login disabled.");
}

// GitHub OAuth Configuration
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/api/auth/github/callback",
        scope: ["user:email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let email = profile.emails?.[0]?.value;

          // Fallback: If primary email is private, fetch public/private emails using GitHub API
          if (!email && accessToken) {
            try {
              const res = await fetch("https://api.github.com/user/emails", {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "User-Agent": "StackVerse-Server",
                },
              });
              if (res.ok) {
                const emails = await res.json();
                const primaryEmail = emails.find((e) => e.primary) || emails[0];
                email = primaryEmail?.email;
              }
            } catch (err) {
              console.error("Error fetching private email from GitHub API:", err);
            }
          }

          if (!email) {
            return done(new Error("No email associated with this GitHub account."), null);
          }

          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            // Link GitHub account if not linked already
            const updateData = {};
            if (!user.githubId) {
              updateData.githubId = profile.id;
              updateData.emailVerified = true;
            }
            if (!user.avatar) {
              const incomingAvatar = profile.photos?.[0]?.value || profile._json?.avatar_url || null;
              if (incomingAvatar) {
                updateData.avatar = incomingAvatar;
              }
            }
            if (Object.keys(updateData).length > 0) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: updateData,
              });
            }
          } else {
            // Register a new user via GitHub
            user = await prisma.user.create({
              data: {
                name: profile.displayName || profile.username || "GitHub User",
                email,
                githubId: profile.id,
                emailVerified: true,
                role: "VISITOR",
                avatar: profile.photos?.[0]?.value || profile._json?.avatar_url || null,
              },
            });
            user.isNew = true;
          }
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn("GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET missing. GitHub Social Login disabled.");
}

// Passport serialization (required but unused in stateless JWT mode)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, null));

export default passport;
