const emailFormat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Signup error handlers middle ware
function SignupCheckMiddleware(req, res, next) {
  var { email, password, confirmPassword } = req.body;
  // Check required fields
  if (!email || !password || !confirmPassword) {
    req.flash('signupMessage', 'Please fill in all fields');
    res.redirect('/signup');
  }
  else{
    // if invalid email
    if ( !emailFormat.test(email) ) {
      req.flash('signupMessage', 'Email format is invalid');
      res.redirect('/signup');
    }
    else{
      // if password and confirm not equal
      if (password !== confirmPassword) {
        req.flash('signupMessage', 'confirm not equal');
        res.redirect('/signup');
      }
      else{
        next();
      }
    }
  }
};


// Login error handlers middle ware
function LoginCheckMiddleware(req, res, next) {
  var { email, password } = req.body;
  // Check required fields
  if (!email || !password ) {
    req.flash('loginMessage', 'Please fill in all fields');
    res.redirect('/login');
  }
  else{
    req.session.cookie.maxAge = 30*24*60*60*1000;
    next();
  }
};


// new user choose starter
function ChooseStarter(req, res, next) {
  /* why we do add var before variables? since we need to use thest variables in router.js, if we add var or let, these variables are only in this function scope */
  if (req.params.name == '小火龙') {
    sql2 = "INSERT INTO usersPokemons (name, level, experience, health, strength, defense, rage, speed, skill1, skill2, skill3, skill4, user_id, color, quality ) VALUES (?, 1, 0, 100, 20, 10, 100, 10, 'Scratch', 'Ember', 'Dragon Breath', 'Fire Fang', ?, 'grey', ?)";
  }
  if (req.params.name == '杰尼龟') {
    sql2 = "INSERT INTO usersPokemons (name, level, experience, health, strength, defense, rage, speed, skill1, skill2, skill3, skill4, user_id, color, quality ) VALUES (?, 1, 0, 100, 10, 20, 100, 10, 'Bubble', 'Aqua Jet', 'Aqua Tail', 'Water Pulse', ?, 'grey', ?)";
  }
  if (req.params.name == '妙蛙种子') {
    sql2 = "INSERT INTO usersPokemons (name, level, experience, health, strength, defense, rage, speed, skill1, skill2, skill3, skill4, user_id, color, quality ) VALUES (?, 1, 0, 200, 10, 10, 100, 10, 'Vine Whip', 'Power Whip', 'Razor Leaf', 'Seed Bomb', ?, 'grey', ?)";
  }
  sql1 = `UPDATE users SET pokemonNum = ${req.user.pokemonNum + 1} WHERE id = ${req.user.id}`;

  quality = ( Math.floor((Math.random() * 4000) + 1000) / 1000 );

  next();

};


// prevent get into some page without login middleware
function IsLoggedIn(req, res, next){
 if(req.isAuthenticated())
  return next();

 res.redirect('/');
}


module.exports = {
  SignupCheckMiddleware: SignupCheckMiddleware,
  LoginCheckMiddleware: LoginCheckMiddleware,
  IsLoggedIn: IsLoggedIn,
  ChooseStarter: ChooseStarter
};
