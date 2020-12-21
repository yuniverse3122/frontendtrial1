require('./env');
const path = require('path');
// const passport = require('passport');
// const bodyParser = require('body-parser');
// const session = require('express-session');
const express = require('express');
const app = express();

const appPort = process.env.PORT;
// const secret = process.env.SECRET;

// app.use(session({ secret, resave: false, saveUninitialized: false }));
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(passport.initialize());
// app.use(passport.session());

const staticPath = path.join(__dirname, '/');
app.use(express.static(staticPath));

// const {
//   localStrategy,
//   serializeUserByID,
//   deserializeUserByID,
// } = require('./utils/authorization');
// passport.use(localStrategy);
// passport.serializeUser(serializeUserByID);
// passport.deserializeUser(deserializeUserByID);

// app.post(
//   '/login',
//   passport.authenticate('local', {
//     successRedirect: '/',
//   })
// );

// app.get('/user', (req, res) => {
//   res.send(
//     req && req.session && req.session.passport && req.session.passport.user
//   );
// });

app.listen(appPort, () => {
  console.log(`Listening on port ${appPort}`);
});
