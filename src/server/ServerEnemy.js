
const GAMEFIELD_WIDTH = 960;
const GAMEFIELD_HEIGHT = 640;
const MASS_COUNT_X = 12;
const MASS_COUNT_Y = 8;
const MASS_SIZE = 80;

class ServerEnemy {
  constructor({id}) {
    this.id = id;

    // ランダムに場所を決める
    this.x = (Math.floor(Math.random() * MASS_COUNT_X) * 80) + 40;
    this.y = (Math.floor(Math.random() * MASS_COUNT_Y) * 80) + 40;

    const speed = 1.25;
    this.speed = speed;
    this.speed_1ms = (speed * 60 / 1000);

    this.launching = true;
    this.popTime = Date.now();
  }

  getEmitData() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      launching: this.launching
    }
  }

  update() {
    if (this.launching && (Date.now() - this.popTime) > 3000) {
      this.launching = false;
      this.lastMovedTime = Date.now();
    }
  }

  move(_players) {
    const now = Date.now();

    // 登場準備中は何もしない
    if (this.launching) {
      this.lastMovedTime = now;
      return;
    }

    if (_players.length === 0) {
      this.lastMovedTime = now;
      return;
    }
    const players = _players
      .filter(player => !player._launching)
      .filter(player => !player._invincibility)
      .filter(player => !player._death);
    if (players.length === 0) {
      this.lastMovedTime = now;
      return;
    }

    // 最も近いプレイヤーに最短距離で近づく
    // FIXME: 大量のプレイヤーがいると絶対ボトルネックになる

    const distances = players.map(player => {
      return {
        player: player,
        distance: Math.sqrt( Math.pow((this.x - player._x),2) + Math.pow((this.y - player._y), 2))
      };
    });

    distances.sort((a, b) => {
      if (a.distance < b.distance) {
        return -1;
      } else if (a.distance > b.distance) {
        return 1;
      }
      return 0;
    });

    const target = distances[0].player;

    const radian = Math.atan2(target._y - this.y, target._x - this.x);

    // 移動距離
    const moveX = Math.cos(radian) * ((now - this.lastMovedTime) * this.speed_1ms);
    const moveY = Math.sin(radian) * ((now - this.lastMovedTime) * this.speed_1ms);
    this.lastMovedTime = now;

    this.x += moveX;
    this.y += moveY;

    if (this.x < 0) {
      this.x = 0;
    }
    if (this.x > 960) {
      this.x = 960;
    }
    if (this.y < 0) {
      this.y = 0;
    }
    if (this.y > 640) {
      this.y = 640;
    }
  }

  getInvasionMass() {
    if (this.launching) {
      return [];
    }
    // TODO 4角見る
    const x = Math.floor(this.x / MASS_SIZE);
    const y = Math.floor(this.y / MASS_SIZE);

    if (x < 0 || MASS_COUNT_X <= x) {
      return [];
    }
    if (y < 0 || MASS_COUNT_Y <= y) {
      return [];
    }

    return [`${x}-${y}`];
  }
}

export default ServerEnemy;
