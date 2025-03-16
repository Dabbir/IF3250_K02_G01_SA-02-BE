const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userService = require('../services/user.service');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const name = profile.displayName;
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
      
      let user = await userService.getByEmail(email);
      
      if (user) {
        if (!user.auth_provider || !user.auth_provider_id) {
          await userService.updateUser(user.id, {
            auth_provider: 'google',
            auth_provider_id: googleId
          });
          
          user = await userService.getById(user.id);
        }
      } else {
        const userData = {
          nama: name,
          email: email,
          auth_provider: 'google',
          auth_provider_id: googleId,
          foto_profil: profilePhoto,
          peran: 'Editor' // Default role
        };
        
        const userId = await userService.createUser(userData);
        user = await userService.getById(userId);
      }
      
      return done(null, user);
    } catch (error) {
      console.error("Error during Google authentication:", error);
      return done(error, null);
    }
  }
));

module.exports = passport;