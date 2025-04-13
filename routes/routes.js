const middleWares = require('../helperFunctions/middleWares');

module.exports = function(app, passport, connection) {
  app.get('/', function(req, res) {
    res.render('home.ejs');
  });


  app.get('/login', function(req, res) {
    res.render('login.ejs', {
      loginMessage: req.flash('loginMessage')
    });
  });


  app.post('/login', middleWares.LoginCheckMiddleware, passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  }));


  app.get('/signup', function(req, res) {
    res.render('signup.ejs', {
      signupMessage: req.flash('signupMessage')
    });
  });


  app.post('/signup', middleWares.SignupCheckMiddleware, passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
  }));


  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });


  app.get('/profile', middleWares.IsLoggedIn, function(req, res) {
    var newPokemons = ['小火龙', '杰尼龟', '妙蛙种子'];
    var sql = `SELECT * FROM usersPokemons WHERE user_id = ${req.user.id}`;
    connection.query(sql, function(err, rows) {
      if (err) throw err;
      else {
        res.render('profile.ejs', {
          user: req.user,
          pokemons: rows,
          newPokemons: newPokemons
        });
      }
    });
  });


  app.get('/package', middleWares.IsLoggedIn, function(req, res) {
    var sql = `SELECT * FROM packages WHERE user_id = ${req.user.id}`;
    connection.query(sql, function(err, rows) {
      if (err) throw err;
      else {
        res.render('package.ejs', {
          user: req.user,
          items: rows[0]
        });
      }
    });
  });


  app.post('/newPokemon/:name', middleWares.ChooseStarter, function(req, res) {
    connection.query(sql1, function(err, result) {
      if (err) throw err;
      else {
        connection.query(sql2,
          [req.params.name, req.user.id, quality],
          function(err, rows) {
            if (err) throw err;
            else {
              res.redirect('/profile');
            }
          });
      }
    });
  });



  /** pvp rooms ***/
  app.get('/pvpRooms', middleWares.IsLoggedIn, function(req, res) {
    var sql = "SELECT * FROM rooms WHERE player1 IS null OR player2 IS null";
    connection.query(sql, function(err, emptyRooms) {
      if (err) throw err;
      else {
        var sql = "SELECT * FROM rooms WHERE player1 IS NOT null AND player2 IS NOT null";
        connection.query(sql, function(err, fullRooms) {
          if (err) throw err;
          else {
            res.render('pvpRooms', {
              emptyRooms: emptyRooms,
              fullRooms: fullRooms,
              userId: req.user.id
            });
          }
        });
      }
    });
  });


  app.post('/pvpRooms', function(req, res) {
    var sql = "INSERT INTO rooms (creator_id ) VALUES (?)";
    connection.query(sql, [req.user.id], function(err, rows) {
      if (err) throw err;
      else {
        res.redirect('/pvpRooms');
      }
    });
  });


  app.delete('/pvpRooms', function(req, res) {
    let room_id = parseInt(req.body.roomNumber);
    var sql = "DELETE FROM rooms WHERE room_id = ?";
    connection.query(sql, [room_id], function(err, rows) {
      if (err) throw err;
      else {
        res.redirect('/pvpRooms');
      }
    });
  });


  app.get('/pvp/:id', middleWares.IsLoggedIn, function(req, res) {
    // console.log('Room number: ' + req.params.id);
    var sql = `SELECT * FROM usersPokemons WHERE user_id = ${req.user.id}`;
    connection.query(sql, function(err, rows) {
      if (err) throw err;
      else {
        res.render('pvp', {
          user: req.user,
          pokemons: rows
        });
      }
    });
  });
  /** rooms ***/






};
