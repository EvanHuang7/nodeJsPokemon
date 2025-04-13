var LocalStrategy = require("passport-local").Strategy;
var bcrypt = require('bcrypt-nodejs');


module.exports = function(passport, connection) {
 passport.serializeUser(function(user, done){
  done(null, user.id);
 });
 passport.deserializeUser(function(id, done){
  connection.query("SELECT * FROM users WHERE id = ? ", [id],
   function(err, rows){
    done(err, rows[0]);
   });
 });

 // do the register
 passport.use(
  'local-signup',
  new LocalStrategy({
   usernameField : 'email',
   passwordField: 'password',
   passReqToCallback: true
  },
  function(req, email, password, done){
   connection.query("SELECT * FROM users WHERE email = ? ",
   [email], function(err, rows){
    if(err)
     return done(err);
    // if user exist
    if(rows.length){
     return done(null, false, req.flash('signupMessage', 'That is already taken'));
    }
    // if we can add this user to db
    else{
     var newUserMysql = {
      email: email,
      password: bcrypt.hashSync(password, null, null)
     };
     var insertQuery = "INSERT INTO users (email, password) values (?, ?)";

     connection.query(insertQuery, [newUserMysql.email, newUserMysql.password],
      function(err, rows){
       // rows is a object contain some inserted query info
       newUserMysql.id = rows.insertId;
       // insert package row
       var packageQuery = "INSERT INTO packages (user_id) values (?)";
       connection.query(packageQuery, [newUserMysql.id],
        function(err, rows){
          return done(null, newUserMysql);
        });
      });
    }
   });
  })
 );


 // do the login
 passport.use(
  'local-login',
  new LocalStrategy({
   usernameField : 'email',
   passwordField: 'password',
   passReqToCallback: true
  },
  function(req, email, password, done){
   connection.query("SELECT * FROM users WHERE email = ? ", [email],
   function(err, rows){
    if(err)
     return done(err);
    // if no user
    if(!rows.length){
     return done(null, false, req.flash('loginMessage', 'No User Found'));
    }
    // if password is incorrect
    if(!bcrypt.compareSync(password, rows[0].password))
     return done(null, false, req.flash('loginMessage', 'Wrong Password'));
    // if successful authentication
    return done(null, rows[0]);
   });
  })
 );






};
