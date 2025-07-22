import passport from "passport";
import GitHubStrategy from "passport-github2";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();
console.log(process.env.GITHUB_CLIENT_ID);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ githubId: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        }

        console.log("PROFILE: ",profile);
        
        const newUser = new User({
          githubId: profile.id,
          username: profile.username,
          email: profile.email ? profile.email : 'test@test.com', 
        });

        await newUser.save();
        done(null, newUser);
      } catch (err) {
        done(err);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
