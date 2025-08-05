import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { db } from '../db/index.js';

// Google OAuth Strategy - only configure if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await db
        .selectFrom('users')
        .selectAll()
        .where('google_id', '=', profile.id)
        .executeTakeFirst();

      if (user) {
        return done(null, user);
      }

      // Check if user exists with this email
      user = await db
        .selectFrom('users')
        .selectAll()
        .where('email', '=', profile.emails?.[0]?.value || '')
        .executeTakeFirst();

      if (user) {
        // Link Google account to existing user
        await db
          .updateTable('users')
          .set({
            google_id: profile.id,
            avatar_url: profile.photos?.[0]?.value || null,
            updated_at: new Date().toISOString(),
          })
          .where('id', '=', user.id)
          .execute();

        user.google_id = profile.id;
        return done(null, user);
      }

      // Create new user
      const newUser = await db
        .insertInto('users')
        .values({
          email: profile.emails?.[0]?.value || '',
          name: profile.displayName || '',
          google_id: profile.id,
          avatar_url: profile.photos?.[0]?.value || null,
          role: 'USER',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .returning(['id', 'email', 'name', 'location_lat', 'location_lng', 'role', 'google_id', 'avatar_url', 'created_at', 'updated_at'])
        .executeTakeFirstOrThrow();

      return done(null, newUser);
    } catch (error) {
      return done(error);
    }
  }));
} else {
  console.log('Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}

// Facebook OAuth Strategy - only configure if credentials are available
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/api/auth/facebook/callback",
    profileFields: ['id', 'emails', 'name', 'picture']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await db
        .selectFrom('users')
        .selectAll()
        .where('facebook_id', '=', profile.id)
        .executeTakeFirst();

      if (user) {
        return done(null, user);
      }

      user = await db
        .selectFrom('users')
        .selectAll()
        .where('email', '=', profile.emails?.[0]?.value || '')
        .executeTakeFirst();

      if (user) {
        await db
          .updateTable('users')
          .set({
            facebook_id: profile.id,
            avatar_url: profile.photos?.[0]?.value || null,
            updated_at: new Date().toISOString(),
          })
          .where('id', '=', user.id)
          .execute();

        user.facebook_id = profile.id;
        return done(null, user);
      }

      const newUser = await db
        .insertInto('users')
        .values({
          email: profile.emails?.[0]?.value || '',
          name: `${profile.name?.givenName} ${profile.name?.familyName}` || '',
          facebook_id: profile.id,
          avatar_url: profile.photos?.[0]?.value || null,
          role: 'USER',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .returning(['id', 'email', 'name', 'location_lat', 'location_lng', 'role', 'facebook_id', 'avatar_url', 'created_at', 'updated_at'])
        .executeTakeFirstOrThrow();

      return done(null, newUser);
    } catch (error) {
      return done(error);
    }
  }));
} else {
  console.log('Facebook OAuth not configured - missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET');
}

// GitHub OAuth Strategy - only configure if credentials are available
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/api/auth/github/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await db
        .selectFrom('users')
        .selectAll()
        .where('github_id', '=', profile.id)
        .executeTakeFirst();

      if (user) {
        return done(null, user);
      }

      user = await db
        .selectFrom('users')
        .selectAll()
        .where('email', '=', profile.emails?.[0]?.value || '')
        .executeTakeFirst();

      if (user) {
        await db
          .updateTable('users')
          .set({
            github_id: profile.id,
            avatar_url: profile.photos?.[0]?.value || null,
            updated_at: new Date().toISOString(),
          })
          .where('id', '=', user.id)
          .execute();

        user.github_id = profile.id;
        return done(null, user);
      }

      const newUser = await db
        .insertInto('users')
        .values({
          email: profile.emails?.[0]?.value || '',
          name: profile.displayName || profile.username || '',
          github_id: profile.id,
          avatar_url: profile.photos?.[0]?.value || null,
          role: 'USER',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .returning(['id', 'email', 'name', 'location_lat', 'location_lng', 'role', 'github_id', 'avatar_url', 'created_at', 'updated_at'])
        .executeTakeFirstOrThrow();

      return done(null, newUser);
    } catch (error) {
      return done(error);
    }
  }));
} else {
  console.log('GitHub OAuth not configured - missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET');
}

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'location_lat', 'location_lng', 'role', 'avatar_url', 'created_at', 'updated_at'])
      .where('id', '=', id)
      .executeTakeFirst();
    
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
