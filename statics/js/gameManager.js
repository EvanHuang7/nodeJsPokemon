// declare player and enemy and socket.io
let player;
let enemy;
// const socket = io.connect('http://localhost:8080/');
const socket = io.connect();

let GameManager = {
	setGameStart(pokemon){
		// console.log(pokemon);
		// assign value to the player
		this.resetPlayer(pokemon);
		this.setPreFight();
	},

	// create player
	resetPlayer(pokemon){
		player = new Player(pokemon.name, pokemon.health, pokemon.defense, pokemon.strength, pokemon.rage, pokemon.speed);

		let getInterface = document.querySelector(".interface");
		getInterface.innerHTML = `<img src="../statics/img/${pokemon.name}.jpg" ><div><h3>${pokemon.name}</h3><p class="health-player"><i class="fas fa-tint"></i> ${player.health}</p><p><i class="fas fa-shield-alt"></i> ${player.defense} &nbsp <i class="fas fa-hammer"></i> ${player.strength}</p><p><i class="fas fa-fire-alt"></i> ${player.rage} &nbsp <i class="fas fa-wind"></i> ${player.speed}</p>`;

		// set the user for checking enemy purpose
		// and tracking front end user pokemon info
		socket.user = {
	    playerType: player.playerType,
	    health: player.health,
			defense: player.defense,
			strength: player.strength,
			rage: player.rage,
			speed: player.speed,
			skill1: pokemon.skill1,
			skill2: pokemon.skill2,
			skill3: pokemon.skill3,
			skill4: pokemon.skill4,
			quality: pokemon.quality,
			userP_id: pokemon.userP_id,
			user_id: pokemon.user_id
	  };

		// determine the user's orignal data in db
		socket.userInDb = {
	    playerType: player.playerType,
	    health: player.health,
			defense: player.defense,
			strength: player.strength,
			rage: player.rage,
			speed: player.speed,
			skill1: pokemon.skill1,
			skill2: pokemon.skill2,
			skill3: pokemon.skill3,
			skill4: pokemon.skill4,
			quality: pokemon.quality,
			userP_id: pokemon.userP_id,
			user_id: pokemon.user_id
	  };

		// send the pokemon info to server via socket
		socket.emit('addPokeinfo', socket.user, location.pathname);

		let getallUserInfo = document.querySelector(".allUserInfo");
		// add pokeon info to all users
		socket.on('showMsgAll', function(data) {
			getallUserInfo.innerHTML = '';
			for (i = 0; i < data.length; i++) {
			  getallUserInfo.innerHTML += '<p> '+data[i].playerType+' '+data[i].health+' '+data[i].defense+' '+data[i].strength+' '+data[i].rage+' '+data[i].speed+' </p>';
				if (JSON.stringify( data[i] ) !== JSON.stringify( socket.userInDb) ) {
					// determine the enemy's orignal data in db
					socket.enemyInDb = data[i];
				}
			}

			let getHeader = document.querySelector(".header");
			let getActions = document.querySelector(".actions");
      let getLeave = document.querySelector(".leave");

      // add leave room button
      getLeave.innerHTML = `<a href="/pvpRooms" id="leave" class="btn btn-outline-primary">Leave this room</a>`;
      let leave = document.getElementById('leave');
      leave.addEventListener('click', function() {
        // socket.emit("leave", location.pathname);
				socket.emit("disconnect");
      });

			// if only one pokemon user attend the game
			if (data.length <=1 ) {
				getHeader.innerHTML = `<h4>Waiting for the other user....</h4>`;
			}
			// if more than one pokemon user attend the game
			else{
				getHeader.innerHTML = `<h4>Fight time!</h4>`;
				getActions.innerHTML = `<a id="startG">Start Fight</a>`;
				// add event listener to button
				let startG = document.getElementById('startG');
				startG.addEventListener('click', function() {
					// tell server to start a game
				  socket.emit('startGame',location.pathname);
				});
			}
		});
	},

	// Whenever start game
	setPreFight(){
		// music
		// let getMusic = document.querySelector(".music");
		// getMusic.innerHTML = `<div class="embed-responsive embed-responsive-16by9">
		//   <iframe class="embed-responsive-item" src="../statics/music/fight.mp3" allowfullscreen></iframe>
		// </div>`;
		// Fighting party
		socket.on('skillsInfo', function(data) {
			socket.skillsInfo = data;
		});


		// Fighting party
		socket.on('startFight', function(data) {
			for (i = 0; i < data.length; i++) {
				if (JSON.stringify( data[i] ) !== JSON.stringify( socket.user) ) {
					// 2 users can not fight with exact same pokemen
					// determine who is enemy
					enemy = data[i];
				}
			}
			// update enemy info
			let getEnemy = document.querySelector(".enemy");
			getEnemy.innerHTML = `<img src="../statics/img/${enemy.playerType}.jpg" ><div><h3>${enemy.playerType}</h3><p class="health-enemy"><i class="fas fa-tint"></i> ${enemy.health}</p><p><i class="fas fa-shield-alt"></i> ${enemy.defense} &nbsp <i class="fas fa-hammer"></i> ${enemy.strength}</p><p><i class="fas fa-fire-alt"></i> ${enemy.rage} &nbsp <i class="fas fa-wind"></i> ${enemy.speed}</p>`;

			// if game is not over
			if (socket.user.health > 0 && enemy.health > 0) {
				let getHeader = document.querySelector(".header");
				let getActions = document.querySelector(".actions");
				let getArena = document.querySelector(".arena-img");


				getHeader.innerHTML = `<h4>Choose your move!</h4>`;
				getArena.style.visibility="visible";
				if (socket.user.rage >= 150) {
					getActions.innerHTML = `<a id="changePlayer" onclick="PlayerMoves.${socket.skillsInfo.skillType1}(${socket.skillsInfo.k1})">${socket.user.skill1}</a><span>&nbsp &nbsp<span><a id="changePlayer" onclick="PlayerMoves.${socket.skillsInfo.skillType2}(${socket.skillsInfo.k2})">${socket.user.skill2}</a><br><br><a id="changePlayer" onclick="PlayerMoves.${socket.skillsInfo.skillType3}(${socket.skillsInfo.k3})">${socket.user.skill3}</a><span>&nbsp &nbsp<span><a id="changePlayer" onclick="PlayerMoves.${socket.skillsInfo.skillType4}(${socket.skillsInfo.k4})">${socket.user.skill4}</a>`;
				}
				else if (socket.user.rage >= 130) {
					getActions.innerHTML = `<a id="changePlayer" onclick="PlayerMoves.${socket.skillsInfo.skillType1}(${socket.skillsInfo.k1})">${socket.user.skill1}</a><span>&nbsp &nbsp<span><a id="changePlayer" onclick="PlayerMoves.${socket.skillsInfo.skillType2}(${socket.skillsInfo.k2})">${socket.user.skill2}</a><br><br><a id="changePlayer" onclick="PlayerMoves.${socket.skillsInfo.skillType3}(${socket.skillsInfo.k3})">${socket.user.skill3}</a><span>&nbsp &nbsp<span><a class="text-muted">${socket.user.skill4}</a>`;
				}
				else if (socket.user.rage >= 120) {
					getActions.innerHTML = `<a id="changePlayer" onclick="PlayerMoves.${socket.skillsInfo.skillType1}(${socket.skillsInfo.k1})">${socket.user.skill1}</a><span>&nbsp &nbsp<span><a id="changePlayer" onclick="PlayerMoves.${socket.skillsInfo.skillType2}(${socket.skillsInfo.k2})">${socket.user.skill2}</a><br><br><a class="text-muted">${socket.user.skill3}</a><span>&nbsp &nbsp<span><a class="text-muted">${socket.user.skill4}</a>`;
				}
				else{
					getActions.innerHTML = `<a id="changePlayer" onclick="PlayerMoves.${socket.skillsInfo.skillType1}(${socket.skillsInfo.k1})">${socket.user.skill1}</a><span>&nbsp &nbsp<span><a class="text-muted">${socket.user.skill2}</a><br><br><a class="text-muted">${socket.user.skill3}</a><span>&nbsp &nbsp<span><a class="text-muted">${socket.user.skill4}</a>`;
				}

				// tell server to change player
				let startG =document.querySelectorAll('#changePlayer');
				for (var start of startG) {
					start.addEventListener('click', function() {
					  socket.emit('changePlayer',location.pathname);
					});
				}
			}


			// if game over
			else{
				let getHeader = document.querySelector(".header");
				getHeader.innerHTML = `<h4>Game over</h4>`;

				// if I die after enemy hit me last round
				if (socket.user.health == 0) {
					let getArena = document.querySelector(".arena");
				  let new_info = document.createElement("h4");
					let new_node = document.createTextNode(`oh, you lose the game!`);
					new_info.appendChild(new_node);
			    getArena.appendChild(new_info);
				}

				// if enemy die after it use boomself last round
				if (enemy.health == 0) {
					let getEnemyhealth = document.querySelector(".health-enemy");
					getEnemyhealth.innerHTML = 'health: 0'
					winGameAward()
				}
			}
		});



		// Rest party
		socket.on('secondFight', function(data) {
			for (i = 0; i < data.length; i++) {
				if (JSON.stringify( data[i] ) !== JSON.stringify( socket.user) ) {
						// determine who is enemy
					enemy = data[i];
				}
			}

			let getHeader = document.querySelector(".header");
			let getActions = document.querySelector(".actions");
			let getEnemy = document.querySelector(".enemy");
			let getArena = document.querySelector(".arena-img");

			getHeader.innerHTML = `<h4>Enemy is choosing move!</h4>`;
			getActions.innerHTML = ``;
			getEnemy.innerHTML = `<img src="../statics/img/${enemy.playerType}.jpg" ><div><h3>${enemy.playerType}</h3><p class="health-enemy"><i class="fas fa-tint"></i> ${enemy.health}</p><p><i class="fas fa-shield-alt"></i> ${enemy.defense} &nbsp <i class="fas fa-hammer"></i> ${enemy.strength}</p><p><i class="fas fa-fire-alt"></i> ${enemy.rage} &nbsp <i class="fas fa-wind"></i> ${enemy.speed}</p>`;
			getArena.style.visibility="visible";

			if (socket.user.health == 0 || enemy.health == 0) {
				let getHeader = document.querySelector(".header");
				getHeader.innerHTML = `<h4>Game over</h4>`;

				// if I die after I use boomself last round
				if (socket.user.health == 0) {
					let getArena = document.querySelector(".arena");
				  let new_info = document.createElement("h4");
					let new_node = document.createTextNode(`oh, you lose the game!`);
					new_info.appendChild(new_node);
			    getArena.appendChild(new_info);
				}
			}
		});



		// if boomSelf or recovery, we need to reduce itself health
		socket.on('myHpAfterRecOrBoom', function(attackType, totalValue) {
			// if the skill is recovery
			if (attackType == 'recovery')
			{
				socket.user.health += totalValue;
				if (socket.user.health > socket.userInDb.health) {
					socket.user.health = socket.userInDb.health;
				}
			}
			// if the skill is boomSelf
			else{
				socket.user.health -= totalValue;
				if (socket.user.health < 0) {
					socket.user.health = 0;
				}
			}
			let getInterface =document.querySelector(".interface");
			getInterface.innerHTML = `<img src="../statics/img/${player.playerType}.jpg" ><div><h3>${player.playerType}</h3><p class="health-player"><i class="fas fa-tint"></i> ${socket.user.health}</p><p><i class="fas fa-shield-alt"></i> ${player.defense} &nbsp <i class="fas fa-hammer"></i> ${player.strength}</p><p><i class="fas fa-fire-alt"></i> ${player.rage} &nbsp <i class="fas fa-wind"></i> ${player.speed}</p>`;
		});



		// Why we dont need to reduce the enemy's health?
		// since startFight and secondFight refresh it everytime
		// if player healthe reduced after enemy hit it
		socket.on('myHpAfterBeingHitted', function(data, addRage) {
			// we need to reduce this in front end, since we need
			// this to speficy which is enemy by comparing db users
			socket.user.health = data;
			socket.user.rage += addRage;
			let getInterface =document.querySelector(".interface");

			getInterface.innerHTML = `<img src="../statics/img/${player.playerType}.jpg" ><div><h3>${player.playerType}</h3><p class="health-player"><i class="fas fa-tint"></i> ${data}</p><p><i class="fas fa-shield-alt"></i> ${player.defense} &nbsp <i class="fas fa-hammer"></i> ${player.strength}</p><p><i class="fas fa-fire-alt"></i> ${socket.user.rage} &nbsp <i class="fas fa-wind"></i> ${player.speed}</p>`;
		});



		// append arena info to arena after enemey atack
	  socket.on('showInfoArena', function(data) {
	    let getArena = document.querySelector(".arena");
	    let new_info = document.createElement("p");
	    let new_node = document.createTextNode(data);
	    new_info.appendChild(new_node);
	    getArena.appendChild(new_info);
			let numberOfInfo = getArena.getElementsByTagName("P");
		  if (numberOfInfo.length % 2 == 0) {
		    new_bar = document.createElement("hr");
		    getArena.appendChild(new_bar);
		  }
	  });



		// show vedio
	  socket.on('showVedioAll', function(name) {
			let getallVedioInfo = document.querySelector(".allVedioInfo");
		  getallVedioInfo.innerHTML = `<video id="watchMe" autoplay="true">
		          <source src="../statics/music/${name}.mp4" type="video/mp4"></source>
		      </video>
		      <div id="overlay"></div>`;
		  // add vedio js
		  var video = document.getElementById('watchMe');
		  var overlay = document.getElementById('overlay');

		  video.addEventListener('ended', function(){
		      overlay.style.display = 'none';
		      video.style.display = 'none'
		  }, false);
	  });






	}








}
