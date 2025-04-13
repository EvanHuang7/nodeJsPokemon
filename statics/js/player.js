// let player;

class Player {
  constructor(playerType, health, defense, strength, rage, speed) {
    this.playerType = playerType;
    this.health = health;
    this.defense = defense;
    this.strength = strength;
    this.rage = rage;
    this.speed = speed;
  }
}

/****************** reuse functions *****************/
// function for award afater win a game
function winGameAward() {
  let money = Math.floor(Math.random() * 10) + 1;
  let randomNum = Math.floor((Math.random() * 100) + 1);
  let randomNum2 = Math.floor((Math.random() * 100) + 1);
  let item;
  let getArena = document.querySelector(".arena");
  let new_info = document.createElement("h4");

  // 1%
  if (randomNum <= 1) {
    if (randomNum2 <= 50) {
      item = 'superEvolutionStone';
    } else {
      item = 'magicalWater';
    }
  }
  // 2%
  else if (1 < randomNum && randomNum <= 3) {
    if (randomNum2 <= 50) {
      item = 'evolutionStone';
    } else {
      item = 'combinationPotion';
    }
  }
  // 7%
  else if (3 < randomNum && randomNum <= 10) {
    if (randomNum2 <= 50) {
      item = 'marioMushroom';
    } else {
      item = 'diamond';
    }
  }
  // 10%
  else if (10 < randomNum && randomNum <= 20) {
    if (1 < randomNum2 && randomNum2 <= 25) {
      item = 'healthPotion';
    } else if (25 < randomNum2 && randomNum2 <= 50) {
      item = 'strengthPotion';
    } else if (50 < randomNum2 && randomNum2 <= 75) {
      item = 'defensePotion';
    } else {
      item = 'moomooMilk';
    }
  }
  // 30%
  else if (20 < randomNum && randomNum <= 50) {
    item = 'candy';
  }
  // 50%
  else {
    item = 'no';
  }
  // emit items to server for this user
  socket.emit('updataPackage', {
    money: money,
    item: item,
    user_id: socket.user.user_id
  });

  // emit exp to server for this user pokemon
  socket.emit('updataPokemon', {
    exp: 80,
    userP_id: socket.user.userP_id,
    name: socket.user.playerType
  });

  alert(`Game over! You get ${money} money and item ${item}  from enemy`);
  // append info to arena info
  let new_node = document.createTextNode(`Game over! You get ${money} money and item ${item}  from enemy`);
  new_info.appendChild(new_node);
  getArena.appendChild(new_info);
}


// function for calculating player attack value
function PlayerAttack(attackFormula) {
  // let calcOutputDamage = Math.floor(attackFormula + Math.random() * 10);
  let calcOutputDamage = Math.floor(attackFormula);
  // number of hits
  let numberOfHits = 1;
  let attackValue = [calcOutputDamage, numberOfHits];
  return attackValue;
}


// function for results after player attack
function PlayerAttackResult(playerAttackValues, attackWay) {
  let totalDamage = playerAttackValues[0] * playerAttackValues[1];
  // change enemy health, and pass this value to server later
  enemy.health -= totalDamage;

  if (['火恐龙', '喷火龙', '超级喷火龙X', '杰尼龟', '卡咪龟', '水箭龟', '超级水箭龟', '妙蛙种子', '妙蛙草', '妙蛙花', '超级妙蛙花', '皮卡丘', '凤王', '超梦', '水君'].includes(socket.user.playerType)) {
    // emit vedio info to server for all user
    socket.emit('updataVedio', socket.user.playerType, location.pathname);
  }


  alert(`You hit enemy ${playerAttackValues[0]} damage ${playerAttackValues[1]} times using ${attackWay}`);

  // show arena info after I attack
  let getArena = document.querySelector(".arena");
  let new_info = document.createElement("p");
  let new_node = document.createTextNode(`You hit enemy  ${playerAttackValues[0]} damage ${playerAttackValues[1]} times using ${attackWay}`);
  new_info.appendChild(new_node);
  getArena.appendChild(new_info);
  let numberOfInfo = getArena.getElementsByTagName("P");
  if (numberOfInfo.length % 2 == 0) {
    new_bar = document.createElement("hr");
    getArena.appendChild(new_bar);
  }

  // emit arena info to server for the other user
  socket.emit('updataInfoArena', `Enemy hit you  ${playerAttackValues[0]} damage ${playerAttackValues[1]} times using ${attackWay}`, location.pathname);
}
/***********************************************/




/********************* Player actions **********************/
// player actions
let PlayerMoves = {
  // related to user strength, and enemy pm defense
  userStrEnemyDefRelated(k) {
    // Player attack
    let playerAttackValues = PlayerAttack((player.strength / enemy.defense) * 10 * k);
    PlayerAttackResult(playerAttackValues, "attack");
    // if enemy die
    if (enemy.health <= 0) {
      winGameAward();
      enemyHealthAfterHit = 0;
    } else {
      enemyHealthAfterHit = enemy.health;
    }
    // tell server change enemy health enemyHealthAfterHit
    socket.emit('enemyHealthAfterHit', enemyHealthAfterHit, enemy.playerType, 'userStrEnemyDefRelated', 0, location.pathname, socket.userInDb.health, socket.enemyInDb.health);
  },






  /************************************************************/
  // enemyHealthRelated ability(related to enemy pm health)
  enemyHealthRelated(k) {
    // Player attack
    let playerAttackValues = PlayerAttack( ((socket.enemyInDb.health / enemy.health) * (socket.enemyInDb.health * 0.02)) * k );
    PlayerAttackResult(playerAttackValues, "enemyHealthRelated");
    // if enemy die
    if (enemy.health <= 0) {
      winGameAward();
      enemyHealthAfterHit = 0;
    } else {
      enemyHealthAfterHit = enemy.health;
    }
    // tell server change enemy health enemyHealthAfterHit
    socket.emit('enemyHealthAfterHit', enemyHealthAfterHit, enemy.playerType, 'enemyHealthRelated', 0, location.pathname, socket.userInDb.health, socket.enemyInDb.health);
  },






  /************************************************************/
  // userHealthRelated ability(related to user pm health)
  userHealthRelated(k) {
    // Player attack
    let playerAttackValues = PlayerAttack( ((socket.userInDb.health / socket.user.health) * (socket.userInDb.health * 0.02)) * k );
    PlayerAttackResult(playerAttackValues, "userHealthRelated");
    // if enemy die
    if (enemy.health <= 0) {
      winGameAward();
      enemyHealthAfterHit = 0;
    } else {
      enemyHealthAfterHit = enemy.health;
    }
    // tell server change enemy health enemyHealthAfterHit
    socket.emit('enemyHealthAfterHit', enemyHealthAfterHit, enemy.playerType, 'userHealthRelated', 0, location.pathname, socket.userInDb.health, socket.enemyInDb.health);
  },







  /***********************************************************/
  // boom self ability(without look at the defense)
  boomSelf(k) {
    // Player attack
    let playerAttackValues = PlayerAttack(player.strength * k);
    PlayerAttackResult(playerAttackValues, "boom yourself");

    // if enemy die
    if (enemy.health <= 0) {
      winGameAward();
      enemyHealthAfterHit = 0;
    } else {
      enemyHealthAfterHit = enemy.health;
    }
    // tell server change enemy health enemyHealthAfterHit
    let totalDamage = playerAttackValues[0] * playerAttackValues[1];
    socket.emit('enemyHealthAfterHit', enemyHealthAfterHit, enemy.playerType, 'boomSelf', totalDamage, location.pathname, socket.userInDb.health, socket.enemyInDb.health);
  },





  /************************************************************/
  // recovery ability(related to enemy pm health)
  recovery(k) {
    // Player attack
    let playerAttackValues = PlayerAttack(enemy.health * 0.2 * k);
    let totalRecovery = playerAttackValues[0] * playerAttackValues[1];
    PlayerAttackResult(playerAttackValues, "recovery");
    // if enemy die
    if (enemy.health <= 0) {
      winGameAward();
      enemyHealthAfterHit = 0;
    } else {
      enemyHealthAfterHit = enemy.health;
    }
    // tell server change enemy health enemyHealthAfterHit
    socket.emit('enemyHealthAfterHit', enemyHealthAfterHit, enemy.playerType, 'recovery', totalRecovery, location.pathname, socket.userInDb.health, socket.enemyInDb.health);
  }






}
