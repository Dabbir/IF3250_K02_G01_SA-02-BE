const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userService = require('../services/user.service');

passport.use(new GoogleStrategy({
    clientID: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      console.log("Google profile received:", {
        id: profile.id,
        displayName: profile.displayName,
        emails: profile.emails,
        photos: profile.photos
      });
      
      if (!profile.emails || profile.emails.length === 0) {
        return done(new Error("No email found"), null);
      }

      const email = profile.emails[0].value;
      const name = profile.displayName || email.split('@')[0];
      const googleId = profile.id;
      let profilePhoto = null;
      
      if (profile.photos && profile.photos.length > 0) {
        profilePhoto = profile.photos[0].value;
      }
      
      const oauthData = {
        nama: name,
        email: email,
        auth_provider: 'google',
        auth_provider_id: googleId,
        foto_profil: profilePhoto
      };
      
      const user = await userService.findOrCreateByOAuth(oauthData);
      
      return done(null, user);
    } catch (error) {
      console.error("Error during Google authentication:", error);
      return done(error, null);
    }
  }
));

module.exports = passport;