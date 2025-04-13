// Feb 27th, 23:30pm
// finish skill type system
// need to do: improve add rage system
// need to do: improve the css, add font awesome to fight place
var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override')
var port = process.env.PORT || 8080;
var passport = require('passport');
var flash = require('connect-flash');
var mysql = require('mysql2');
var dbconfig = require('./config/database');

// PVP Setup
const socket = require('socket.io');
users = {};
connections = {};

// make mysql db connection
var connection = mysql.createConnection(dbconfig.connection);
connection.connect(function(err){
  if (err) throw err;
  console.log("Database connected...");
});

// EJS
var app = express();
app.set('view engine', 'ejs');

// Static files
app.use('/statics', express.static('./statics'));

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))

// Passport config(we require passport just after top part)
require('./config/passport')(passport, connection);

// passport default middleware part
app.use(cookieParser());
app.use(bodyParser.urlencoded({
 extended: true
}));
app.use(session({
 secret: 'justasecret',
 resave:true,
 saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Connect to flash
app.use(flash());

// Routes(we require before at last part, just b4 lisen port)
require('./routes/routes.js')(app, passport, connection);

// Set server
const server = app.listen(8080, function() {
  console.log("Server started...");
});

/************** PVP ****************/
// Socket setup
const io = socket(server);
// When connection is made by client
io.on('connection', function(socket) {
  // join room, add user and connection, update pm info
  socket.on('addPokeinfo', function(data, room) {
    // set the username for deleteing purpose
    socket.user = data;
    socket.placeRoom = room;
    /********* add player to room in db *********/
    let room_id = room.substring(5, room.length);
    var sql = "SELECT * FROM rooms WHERE room_id = ?";
    connection.query(sql, [room_id], function(err, rows) {
      if (err) throw err;
      else {
        if (rows[0].player1 == null) {
          sql = "UPDATE rooms SET player1 = ? WHERE room_id = ?";
        }
        else if (rows[0].player2 == null) {
          sql = "UPDATE rooms SET player2 = ? WHERE room_id = ?";
        }
        connection.query(sql, ['occupied', room_id], function(err, rows) {
          if (err) throw err;
        });
      }
    });
    /********* add socket to that connection room *********/
    if (!connections[room] ) {
      connections[room] = [];
      connections[room].push(socket);
    }
    else{
      if ( !connections[room].includes(socket)) {
          connections[room].push(socket);
      }
    }
    /****************** join room ******************/
    socket.join(room, function() {
      console.log("Socket joins room:", socket.rooms);
      console.log("----------------------------------------");
    });
    console.log("----------------------------------------");
    console.log(socket.id, "joined room:", room);
    console.log("current room:",room, "=> connections numbers:",connections[room].length);
    var roomNum = 0;
    for (i in connections) {
      roomNum++;
    }
    console.log('connection room numbers:' + roomNum);
    console.log("----------------------------------------");
    /*********** add user to that user room ***********/
    if (!users[room] ) {
      users[room] = [];
      users[room].push(data);
    }
    else{
      users[room].push(data);
    }
    console.log("current room:",room, "=> user numbers:",users[room].length);
    console.log("----------------------------------------");
    io.in(room).emit('showMsgAll', users[room]);
  });



  socket.on('disconnect', function () {
    var room = socket.placeRoom;
    // only socekt is inside a room(have a Leave room btn)
    if (typeof room != 'undefined') {
      /********* remove player to room in db *********/
      let room_id = room.substring(5, room.length);
      var sql = "SELECT * FROM rooms WHERE room_id = ?";
      connection.query(sql, [room_id], function(err, rows) {
        if (err) throw err;
        else {
          if (rows[0].player2 != null) {
            sql = "UPDATE rooms SET player2 = ? WHERE room_id = ?";
          }
          else if (rows[0].player1 != null) {
            sql = "UPDATE rooms SET player1 = ? WHERE room_id = ?";
          }
          connection.query(sql, [null, room_id], function(err, rows) {
            if (err) throw err;
          });
        }
      });
      /******** remove user from users & conns room ********/
      console.log('connections room before disconnect:', connections[room].length);
      console.log('users room before disconnect:', users[room].length);
      users[room].splice(users[room].indexOf(socket.user), 1);
      connections[room].splice(connections[room].indexOf(socket), 1);
      // leave room
      socket.leave(room, function() {
        console.log("Socket now in rooms(after leave)", socket.rooms);
        console.log("----------------------------------------");
      });
      console.log('connections room after disconnect:', connections[room].length);
      console.log('users room after disconnect:', users[room].length);
      console.log("----------------------------------------");
      console.log(socket.id, "left room: ", room);
      var roomNum = 0;
      for (i in connections) {
        roomNum++;
      }
      console.log('connection room numbers:' + roomNum);
      console.log("----------------------------------------");

    }
  });



  // When client tell server to start a game
  socket.on('startGame', function(room) {
    // determine the enemy for comparing the speed
    for (i = 0; i < users[room].length; i++) {
      if (JSON.stringify( users[room][i] ) !== JSON.stringify( socket.user) ) {
        enemy = users[room][i];
      }
    }
    // send skills info to two users
    var sql = "SELECT * FROM pokemonsBook WHERE name = ?";
    connection.query(sql, [socket.user.playerType], function(err, userRows) {
      if (err) throw err;
      else {
        sql = "SELECT * FROM pokemonsBook WHERE name = ?";
        connection.query(sql, [enemy.playerType], function(err, enemyRows) {
          if (err) throw err;
          else {
            socket.emit('skillsInfo', userRows[0]);
            socket.broadcast.to(room).emit('skillsInfo', enemyRows[0]);
            // check who has faster speed
            if (socket.user.speed >= enemy.speed) {
              socket.emit('startFight', users[room]);
              socket.broadcast.to(room).emit('secondFight', users[room]);
            }
            else{
              socket.emit('secondFight', users[room]);
              socket.broadcast.to(room).emit('startFight', users[room]);
            }
          }
        });
      }
    });
  });


  // When client tell server to change player
  socket.on('changePlayer', function(room) {
      socket.emit('secondFight', users[room]);
      socket.broadcast.to(room).emit('startFight', users[room]);
  });


  // when client ask change enemy health enemyHealthAfterHit
  socket.on('enemyHealthAfterHit', function(data, enemyType, attackType, totalValue, room, userOrignalHp, enemyOrignalHp) {
    // modify the health of pokemon hitted in []
    for (var i = 0; i < users[room].length; i++) {
      if (users[room][i].playerType === enemyType) {
        var addRage = 10 + Math.round((users[room][i].health - data) * 100  / enemyOrignalHp);
        users[room][i].rage += addRage;
        users[room][i].health = data;
      }
      // if need to reduce myself health
      if (attackType == 'boomSelf' && users[room][i].playerType != enemyType) {
        users[room][i].health -= totalValue;
        if (users[room][i].health < 0) {
          users[room][i].health = 0;
        }
        socket.emit('myHpAfterRecOrBoom', attackType, totalValue);
      }
      // if need to add myself health
      if (attackType == 'recovery' && users[room][i].playerType != enemyType) {
        users[room][i].health += totalValue;
        if (users[room][i].health > userOrignalHp) {
          users[room][i].health = userOrignalHp;
        }
        socket.emit('myHpAfterRecOrBoom', attackType, totalValue);
      }
    }
    // Why we dont need to reduce the enemy's health?
    // since startFight and secondFight refresh it everytime
    socket.broadcast.to(room).emit('myHpAfterBeingHitted', data, addRage);
  });


  // updata arena info to enemy client
  socket.on('updataInfoArena', function(data, room) {
    socket.broadcast.to(room).emit('showInfoArena', data, room);
  });


  // updata vedio to the other clients
  socket.on('updataVedio', function(name, room) {
    io.in(room).emit('showVedioAll', name, room);
  });


  // updata package for this user
  socket.on('updataPackage', function(data) {
    if (data.item == 'no') {
      var sql = "SELECT * FROM packages WHERE user_id = ?";
      connection.query(sql, [data.user_id], function(err, rows) {
        if (err) throw err;
        else {
          var moneyNum = rows[0].goldCoin + data.money;
          sql = "UPDATE packages SET goldCoin = ? WHERE user_id = ?";
          connection.query(sql, [moneyNum, data.user_id], function(err, rows) {
            if (err) throw err;
          });
        }
      });
    }
    else if (data.item == 'diamond') {
      var sql = "SELECT * FROM packages WHERE user_id = ?";
      connection.query(sql, [data.user_id], function(err, rows) {
        if (err) throw err;
        else {
          var moneyNum = rows[0].goldCoin + data.money;
          var diamondNum = rows[0].diamond + 2;
          sql = "UPDATE packages SET goldCoin = ?, diamond = ? WHERE user_id = ?";
          connection.query(sql, [moneyNum, diamondNum, data.user_id], function(err, rows) {
            if (err) throw err;
          });
        }
      });
    }
    else{
      var sql = "SELECT * FROM packages WHERE user_id = ?";
      connection.query(sql, [data.user_id], function(err, rows) {
        if (err) throw err;
        else {
          var moneyNum = rows[0].goldCoin + data.money;
          var itemNum = rows[0][data.item] + 1;
          sql = "UPDATE packages SET goldCoin = ?, "+data.item+" = ? WHERE user_id = ?";
          connection.query(sql, [moneyNum, itemNum, data.user_id], function(err, rows) {
            if (err) throw err;
          });
        }
      });
    }
  });


  // updata pokemon exp for this user
  socket.on('updataPokemon', function(data) {
    var sql = "SELECT * FROM usersPokemons WHERE userP_id = ?";
    connection.query(sql, [data.userP_id], function(err, rows) {
      if (err) throw err;
      else {
        var expNum = rows[0].experience + data.exp;
        // if level increases
        if (expNum >= rows[0].level * 100 && rows[0].level < 100) {
          var levelNum = rows[0].level + 1;
          var quality = rows[0].quality;
          var healthNum = rows[0].health;
          var strengthNum = rows[0].strength;
          var defenseNum = rows[0].defense;
          var speedNum = rows[0].speed;
          expNum = expNum - rows[0].level * 100;

          // check increase health, strength.. numbers
          sql = "SELECT * FROM pokemonsBook WHERE name = ?";
          connection.query(sql, [data.name], function(err, rows) {
            if (err) throw err;
            else{
              healthNum = Math.floor( rows[0].health * 0.1 * quality + healthNum );
              strengthNum = Math.floor( rows[0].strength * 0.1 * quality + strengthNum );
              defenseNum = Math.floor( rows[0].defense * 0.1 * quality + defenseNum );
              speedNum = Math.floor( rows[0].speed * 0.1 * quality + speedNum );

              sql = "UPDATE usersPokemons SET level = ?, experience = ?, health = ?, strength = ?, defense = ?, speed = ? WHERE userP_id = ?";
              connection.query(sql, [levelNum ,expNum, healthNum, strengthNum, defenseNum, speedNum, data.userP_id], function(err, rows) {
                if (err) throw err;
              });
            }
          });
        }
        // if level not increases
        else{
          sql = "UPDATE usersPokemons SET experience = ? WHERE userP_id = ?";
          connection.query(sql, [expNum, data.userP_id], function(err, rows) {
            if (err) throw err;
          });
        }

      }
    });
  });



});

/***********************************/
