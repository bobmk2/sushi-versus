import 'pixi';
import 'p2'
import Phaser from 'phaser';

import Player from './Player';
import RemotePlayer from './RemotePlayer';
import Bullet from './Bullet';
import Mass from './Mass';

import events from '../server/websocket/Events';
import Uuid from 'node-uuid';
import fetch from 'isomorphic-fetch';

var game = null;

var playerTypeName = null;

fetch('/api/players.json')
  .then(res => {
    return res.json();
  })
  .then(json => {
    // 同数ならランダム
    if (json.tamago === json.maguro) {
      playerTypeName = Date.now() % 2 === 0 ? 'maguro' : 'tamago';
    } else if (json.tamago < json.maguro) {
      playerTypeName = 'tamago';
    } else {
      playerTypeName = 'maguro';
    }

    game = new Phaser.Game(960, 640, Phaser.AUTO, 'game', { preload: preload, create: create, update:update});
  })
  .catch(err => {
    console.err('happend error :(', err);
  });


function preload() {
  game.stage.disableVisibilityChange = true

  game.load.image('tamago', 'img/tamago.png', 32, 21);
  game.load.image('maguro', 'img/maguro.png', 32, 21);
  game.load.image('dead-tamago', 'img/dead-tamago.png', 32, 32);
  game.load.image('dead-maguro', 'img/dead-maguro.png', 32, 32);
  game.load.spritesheet('ikura', 'img/ikura.png', 16, 16);
  game.load.spritesheet('mass', 'img/mass.png', 40, 40);
  game.load.image('overlay', 'img/overlay.png', 32, 32);
  game.load.spritesheet('retry-button', 'img/retry-button.png', 240, 80);
}

// socket.io
var socket;

// global
var player;

var anotherPlayers;
var playerMapping;
var bullets;
var bulletsMapping;
var myBullets;

var masses = null;

var friendsBulletsGroup;
var enemyBulletsGroup;
var massGroup;

var scoreText;

function create() {
  game.stage.disableVisibilityChange = true;
  game.physics.startSystem(Phaser.Physics.ARCADE);

  socket = io.connect();

  anotherPlayers = [];
  playerMapping = {};

  // 自分のだけ同期させるため別の入れ物を容易
  myBullets = [];
  bullets = [];
  bulletsMapping = {};

  massGroup = game.add.physicsGroup();
  massGroup.enableBody = true;
  massGroup.physicsBodyType = Phaser.Physics.ARCADE;

  // 12 * 8
  masses = [];
  for(let i = 0; i < 8; i++) {
    let line = [];
    for(let j=0;j<12;j++) {
      line.push(new Mass({game, group:massGroup}, {indexX: j, indexY: i, x: 40 + (j*80), y: 40 + (i*80)}))
    }
    masses.push(line);
  }

  // TODO セーフティに配置する
  const x = game.rnd.integerInRange(0, 11) * 80 + 40;
  const y = game.rnd.integerInRange(0, 7) * 80 + 40;
  player = new Player(game, playerTypeName, x, y);

  friendsBulletsGroup = game.add.physicsGroup();
  friendsBulletsGroup.enableBody = true;
  friendsBulletsGroup.physicsBodyType = Phaser.Physics.ARCADE;

  enemyBulletsGroup = game.add.physicsGroup();
  enemyBulletsGroup.enableBody = true;
  enemyBulletsGroup.physicsBodyType = Phaser.Physics.ARCADE;

  game.input.keyboard.onUpCallback = onKeyUp;

  scoreText = game.add.text(820, 600, `SCORE:${score}`, {font:'20px Arial', fill:'#FFFFFF', align:'left'})

  setSocketEventHandlers(socket);
}

var lastScore = 0;
function update() {
  onKeyboardInput();
  updateAnotherPlayers();
  updateBullets();
  player.update();

  game.physics.arcade.overlap(player.image, enemyBulletsGroup, playerAndBulletCollisionHandler, null, this);
  game.physics.arcade.overlap(friendsBulletsGroup, massGroup, bulletAndMassCollisionHandler, null, this);
  game.physics.arcade.overlap(enemyBulletsGroup, massGroup, bulletAndMassCollisionHandler, null, this);
  game.physics.arcade.overlap(friendsBulletsGroup, enemyBulletsGroup, bulletsCollisionHandler, null, this);

  game.physics.arcade.overlap(player.image, massGroup, playerAndMassCollisionHandler, null, this);

  if (player.isRequiredEmit()) {
    console.log('[EMIT]')
    console.log(player.getEmitData());
    socket.emit(events.UPDATE_PLAYER_STATUS, player.getEmitData());
    player.emitted();
  }

  emitDestroyedBullets();

  if (lastScore !== score) {
    scoreText.text = `SCORE:${score}`
    lastScore = score;
  }
  endRoll();
}

function getScore() {return score;}

var raunchedEndRoll = false;
var score = 0;
function endRoll() {
  if (!player.isDead() || raunchedEndRoll) {
    return;
  }
  if (!player.image.alive) {
    raunchedEndRoll = true;

    const overlay = game.add.sprite(0, 0, 'overlay');
    overlay.scale.setTo(30, 20);
    overlay.alpha = 0;

    const tween = game.add.tween(overlay).to({alpha:1}, 1000, Phaser.Easing.Linear.None, true, 0, 0, false);
    tween.onComplete.add(() => {
      game.add.text(320, 160, 'Game Over', {font:'60px Arial', fill:'#FFFFFF', align:'left'})
      game.add.text(310, 230, 'Thank you for playing :)', {font:'32px Arial', fill:'#FFFFFF', align:'left'})

      const sushi = game.add.sprite(480, 330, player.typeName);
      sushi.scale.set(3);
      sushi.anchor.set(0.5);
      game.add.tween(sushi).to({angle:360}, 250, Phaser.Easing.Linear.None, true, 0, 0, false).loop(true);
      const sushiEffect = game.add.sprite(sushi.x, sushi.y, player.typeName);
      sushiEffect.scale.set(4);
      sushiEffect.anchor.set(0.5);
      sushiEffect.alpha = 0.5
      game.add.tween(sushiEffect).to({angle:360}, 250, Phaser.Easing.Linear.None, true, 0, 0, false).loop(true);

      const retryButton = game.add.button(game.world.centerX - 120, 500, 'retry-button', actionOnClick, this, 1, 0, 2);

      game.add.text(350, 400, `SCORE: ${score}`, {font:'40px Arial', fill:'#FFFFFF', align:'left'})
    });
  }
}

function actionOnClick() {
  location.reload(true);
}

function playerAndMassCollisionHandler(_player, _mass) {
  const idx = _mass.name.split('-').map(s => parseInt(s));
  const mass = masses[idx[0]][idx[1]];
  const current = mass.typeName;

  if (current !== player.typeName) {
    if (player.isInvincibility()) {
      // 無敵のときだけ触れている床の色を変える
      // ただ結局移動制限かかって移動できない
      masses[idx[0]][idx[1]].changeTypeName(player.typeName);
      socket.emit(events.CHANGE_MASS_TYPENAME, [{x:idx[0],y:idx[1],typeName:player.typeName}]);
    } else if (!player.isDead()){
      // 敵のマスにいるので死ぬ
      console.log("[DIED]")
      player.die();
    }
  }
}

function playerAndBulletCollisionHandler(_player, bullet) {
  // ここは弾だけ消せばOK
  bulletsMapping[bullet.name].destroy();
}

function bulletAndMassCollisionHandler(bullet, mass) {
  const collisionBullet = bulletsMapping[bullet.name];
  if (typeof collisionBullet === 'undefined' || collisionBullet.isDestroyed()) {
    return;
  }

  const idx = mass.name.split('-').map(s => parseInt(s));
  const m = masses[idx[0]][idx[1]];
  if (m.typeName !== collisionBullet.typeName) {
    m.changeTypeName(collisionBullet.typeName);
    if (myBullets.indexOf(collisionBullet) !== -1) {
      score ++;
    }
  }
}

function bulletsCollisionHandler(fBullet, eBullet) {
  if (bulletsMapping.hasOwnProperty(fBullet.name)) {
    bulletsMapping[fBullet.name].destroy();
  }
  if (bulletsMapping.hasOwnProperty(eBullet.name)) {
    bulletsMapping[eBullet.name].destroy();
  }
}

function updateAnotherPlayers(){
  anotherPlayers.filter(player => player.image.alive).forEach(player => {
    player.update();
  });
}

function updateBullets() {
  // 自分の弾丸だけ動かしてemitする
  var bullets = myBullets.filter(bullet => !bullet.isDestroyed());
  if (bullets.length === 0) {
    return;
  }
  bullets.forEach(bullet => {
    bullet.update();
  });
  socket.emit(events.MOVE_BULLETS, bullets.map(b => {return {uuid: b.uuid, x: b.image.x, y: b.image.y};}));
}

function emitDestroyedBullets() {
  const uuids = bullets.filter(bullet => bullet.isDestroyed())
    .map(bullet => {
      const uuid = bullet.uuid;
      cleanBullet(bullet.uuid);
      return uuid;
    });
  if (uuids.length > 0) {
    console.log('[DESTROY EMIT] => ', uuids);
    socket.emit(events.DESTROY_BULLETS, uuids);
  }
}

/**
 * ============
 *   keyboard
 * ============
 */
function onKeyboardInput() {
  if (typeof player === 'undefined') {
    return;
  }

  // move
  let up = game.input.keyboard.isDown(Phaser.Keyboard.W);
  let down = game.input.keyboard.isDown(Phaser.Keyboard.S);
  let left = game.input.keyboard.isDown(Phaser.Keyboard.A);
  let right = game.input.keyboard.isDown(Phaser.Keyboard.D);

  // 同時押しは相殺
  if (up && down) {
    up = false;
    down = false;
  }
  if (left && right) {
    left = false;
    right = false;
  }

  const playerSpeed = player.getSpeed();
  const angledSpeed = playerSpeed * 0.70710678118;

  let moved = false;
  let movedX = 0;
  let movedY = 0;

  if (up) {
    if (left) {
      movedY -= angledSpeed;
      movedX -= angledSpeed;
    } else if (right) {
      movedY -= angledSpeed;
      movedX += angledSpeed;
    } else {
      movedY -= playerSpeed
    }
    moved = true;
  } else if (down) {
    if (left) {
      movedY += angledSpeed;
      movedX -= angledSpeed;
    } else if (right) {
      movedY += angledSpeed;
      movedX += angledSpeed;
    } else {
      movedY += playerSpeed
    }
    moved = true;
  } else if (left) {
    movedX -= playerSpeed;
    moved = true;
  } else if (right) {
    movedX += playerSpeed;
    moved = true;
  }

  if (moved) {

    // 移動先のマス目を確認
    let {top, bottom, left, right} = player.getDivisionLine();
    let nextPos = {top: top + movedY, bottom: bottom + movedY, left: left + movedX, right: right + movedX};

    if (nextPos.top < 0) {
      movedY = 0;
    }
    if (nextPos.bottom > 640) {
      movedY = 0;
    }
    if (nextPos.left < 0) {
      movedX = 0;
    }
    if (nextPos.right > 960) {
      movedX = 0;
    }

    // ぶつかるのならそちらの移動量を0にする
    if (movedX < 0) {
      let l1 = detectMass(nextPos.left, top);
      let l2 = detectMass(nextPos.left, bottom);
      if ((l1 && player.typeName !== l1.typeName) || (l2 && player.typeName !== l2.typeName)) {
        // ぶつかっている
        movedX = 0;
      }
    }
    if (movedX > 0) {
      let r1 = detectMass(nextPos.right, top)
      let r2 = detectMass(nextPos.right, bottom)
      if ((r1 && player.typeName !== r1.typeName) || (r2 && player.typeName !== r2.typeName)) {
        // ぶつかっている
        movedX = 0;
      }
    }
    if (movedY < 0) {
      let t1 = detectMass(left, nextPos.top);
      let t2 = detectMass(right, nextPos.top);
      if ((t1 && player.typeName !== t1.typeName) || (t2 && player.typeName !== t2.typeName)) {
        // ぶつかっている
        movedY = 0;
      }
    }
    if (movedY > 0) {
      let b1 = detectMass(left, nextPos.bottom);
      let b2 = detectMass(right, nextPos.bottom);
      if ((b1 && player.typeName !== b1.typeName) || (b2 && player.typeName !== b2.typeName)) {
        // ぶつかっている
        movedY = 0;
      }
    }

    if (movedX !== 0 || movedY !== 0) {
      player.move(movedX, movedY)
    }
  }

  // shoot
  let upShoot = game.input.keyboard.isDown(Phaser.Keyboard.UP);
  let downShoot = game.input.keyboard.isDown(Phaser.Keyboard.DOWN);
  let leftShoot = game.input.keyboard.isDown(Phaser.Keyboard.LEFT);
  let rightShoot = game.input.keyboard.isDown(Phaser.Keyboard.RIGHT);
  player.charging({up: upShoot, down: downShoot, left: leftShoot, right: rightShoot});
}

function detectMass(x, y) {
  if (x < 0 || x > 960 || y < 0 || y > 640) {return null;}

  const _x = Math.floor(x / 80);
  const _y = Math.floor(y / 80);
  return masses[_y][_x];
}

function onKeyUp(event) {
  const keyCode = event.keyCode;

  let left = keyCode === Phaser.Keyboard.LEFT;
  let right = keyCode === Phaser.Keyboard.RIGHT;
  let up = keyCode === Phaser.Keyboard.UP;
  let down = keyCode === Phaser.Keyboard.DOWN;

  if (!left && !right && !up && !down) {
    return;
  }

  if (!player.isDead()){
    const bulletsData = player.shoot({left, right, up, down});
    if (bulletsData === null || bulletsData.length === 0) {
      return;
    }

    console.log("[SHOOT]");
    console.log(bulletsData);
    const shootBullets = bulletsData.map(data => {
      let s = new Bullet({game, group: friendsBulletsGroup}, Uuid.v4(), data.typeName, data.x, data.y, data.moveX, data.moveY);
      s.shoot();
      myBullets.push(s);
      bullets.push(s);
      bulletsMapping[s.uuid] = s;
      return s;
    });

    socket.emit(events.CREATE_BULLETS, shootBullets.map(b => b.getEmitData()));
  }
}


/**
 * =============
 *   websocket
 * =============
 */
function setSocketEventHandlers(socket) {
  socket.on(events.CONNECT, onSocketConnected);
  socket.on(events.DISCONNECT, onSocketDisconnected);
  socket.on(events.NEW_PLAYER, onNewPlayer);
  socket.on(events.REMOVE_PLAYER, onPlayerRemoved);
//  socket.on(events.MOVE_PLAYER, onPlayerMoved);
  socket.on(events.UPDATE_PLAYER_STATUS, onPlayerStatusUpdated);
  socket.on(events.CREATE_BULLETS, onBulletsCreated);
  socket.on(events.DESTROY_BULLETS, onBulletsDestroyed);
  socket.on(events.MOVE_BULLETS, onBulletsMoved);
  socket.on(events.INITIAL_MASSES, onInitialMasses);
  socket.on(events.CHANGE_MASS_TYPENAME, onMassTypeNameChanged);
}

function onSocketConnected() {
  console.log('Connected to socket server ', player.getPos());

  // Send local player data to the game server
  socket.emit(events.NEW_PLAYER, player.getEmitData());
}

function onSocketDisconnected() {
  console.log('Disconnected from socket server');

  // 弾を消す
  socket.emit(events.DESTROY_BULLETS, myBullets.map(b => b.uuid))
}

function onNewPlayer(data) {
  console.log('New player connected:', data.id, data.x, data.y);

  const remotePlayer = RemotePlayer.fromEmitData(game, data)//new RemotePlayer(data.id, game, data.x, data.y);
  anotherPlayers.push(remotePlayer);
  playerMapping[data.id] = remotePlayer;
}

//function onPlayerMoved(data) {
//  console.log('Player moved: ', data);
//
//  const movedPlayer = playerMapping[data.id];
//
//  if (typeof movedPlayer === 'undefined') {
//    console.warn('Player not found');
//    return;
//  }
//
//  movedPlayer.setPos(data.x, data.y);
//}

function onPlayerStatusUpdated(data) {
//  console.log('Player Status Updated: ', data);

  const updatedPlayer = playerMapping[data.id];
  if (typeof updatedPlayer === 'undefined') {
    console.warn('Player not found');
    return;
  }

  updatedPlayer.updateStatus(data);
}

function onPlayerRemoved(data) {
//  console.log('Player removed:', data.id);

  const removedPlayer = playerMapping[data.id];

  if (typeof removedPlayer === 'undefined') {
    console.warn('Player not found');
    return;
  }

  removedPlayer.remove();

  anotherPlayers.splice(anotherPlayers.indexOf(removedPlayer), 1);
  delete playerMapping[data.id];
}

function onBulletsCreated(data) {
  // console.log('New bullets created:');

  data
    .filter(d => !bulletsMapping.hasOwnProperty(d.uuid)) // ここで作成した弾は再処理しない
    .map(d => Bullet.fromEmitData({game, group:
      player._typeName === d.typeName ? friendsBulletsGroup : enemyBulletsGroup
    }, d)) // 弾丸に変換
    .forEach(bullet => {
      bullets.push(bullet);
      bulletsMapping[bullet.uuid] = bullet;
    });
}

function onBulletsDestroyed(data) {
  console.log('onBulletsDestroyed =>', data);
  data
    .filter(uuid => bulletsMapping.hasOwnProperty(uuid))
    .forEach(uuid => {
      bulletsMapping[uuid].destroy();
      //cleanBullet(uuid)
    });
}

function onBulletsMoved(data) {
  data
    .filter(d => bulletsMapping.hasOwnProperty(d.uuid))
    .forEach(d => {
      let bullet = bulletsMapping[d.uuid];
      if (!bullet.isDestroyed()) {
        bullet.setPos(d.x, d.y);

        let mass = detectMass(d.x, d.y);
        if (mass) {
          mass.changeTypeName(bullet.typeName);
        }
      }
    });

  //console.log("CURRENT BULLES => ", bullets);
}

function cleanBullet(uuid) {
  let destroyBullet = bulletsMapping[uuid];
  destroyBullet.kill();

  bullets.splice(bullets.indexOf(destroyBullet), 1);

  if (myBullets.indexOf(destroyBullet) !== -1) {
    myBullets.splice(myBullets.indexOf(destroyBullet), 1);
  }
  delete bulletsMapping[uuid];
}

function onInitialMasses(data) {
  let line = 0;
  let vertical = 0;
  for(let i=0;i<data.length;i++) {
    var mass = masses[line][vertical];

    switch(data.charAt(i)) {
      case 'd':
        mass.changeTypeName('default');
        break;
      case 't':
        mass.changeTypeName('tamago');
        break;
      case 'm':
        mass.changeTypeName('maguro');
        break;
    }

    vertical ++;
    if (vertical % 12 === 0) {
      line ++;
      vertical = 0;
    }
  }
}

function onMassTypeNameChanged(data) {
  if (masses === null) {
    return;
  }
  data.forEach(d => {
    masses[d.x][d.y].changeTypeName(d.typeName);
  })
}

function onGameStarted(data) {

}

function onGameFinished(data) {

}

function onResultStarted(data) {

}

function onResultFinished(data) {}
