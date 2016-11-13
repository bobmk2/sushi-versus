import Bullet from './Bullet';

export const DIFF_X = 28;
export const DIFF_Y = 26;

class BulletChamber {

  constructor(game, parentPlayer, typeName, startX, startY) {
    this.game = game;
    this.parentPlayer = parentPlayer;

    var bullets = [
      new Bullet({game}, null, typeName, startX - DIFF_X, startY + DIFF_Y),
      new Bullet({game}, null, typeName, startX - (DIFF_X / 2), startY + DIFF_Y),
      new Bullet({game}, null, typeName, startX, startY + DIFF_Y),
      new Bullet({game}, null, typeName, startX + (DIFF_X / 2), startY + DIFF_Y),
      new Bullet({game}, null, typeName, startX + DIFF_X, startY + DIFF_Y)
    ];
    this.bullets = bullets;

    this.updateRest();
  }

  getRest() {
    return this.rest;
  }

  setVisible(visible) {
    this.bullets.forEach(bullet => {
      bullet.image.visible = visible;
    })
  }

  setPos(x, y) {

    this.bullets.forEach((bullet, index) => {
      bullet.setPos(x - DIFF_X + ((DIFF_X/2) * index), y + DIFF_Y);
    });

    this.x = x;
    this.y = y;
  }

  shoot() {
    if (this.rest === 0) {
      return;
    }
    this.rest --;

    // 最初の要素の位置を入れ替える
    const shotBullet = this.bullets[0];
    shotBullet.empty();
    this.bullets.splice(0, 1);
    this.bullets.push(shotBullet);
    this.bullets.forEach((bullet, index) => {
      bullet.setPos(this.x - DIFF_X + ((DIFF_X/2) * index), this.y + DIFF_Y);
    });
    shotBullet.image.revive();

    // fullじゃない要素の先頭をチャージング状態にする
    this.bullets.filter(bullet => !bullet.isFull())[0].charging();
  }

  update() {
    // 満タンなら特にやることはないはず
    if (this.rest === this.bullets.length) {
      return;
    }
    const lastRest = this.rest;
    this.bullets.forEach(bullet => {
      bullet.update();
    });
    this.updateRest();

    // 一つのチャージが終わったら次のチャージを始める
    if (this.rest !== this.bullets.length && this.rest !== lastRest) {
      this.bullets.filter(bullet => !bullet.isFull())[0].charging();
    }
    if (this.rest !== lastRest) {
      this.parentPlayer.requiredEmit();
    }
  }

  updateRest() {
    this.rest = this.bullets.filter(bullet => bullet.isFull()).length;
  }

  burst() {
    this.bullets.forEach(bullet => {
      bullet.startBurstEffect();
      bullet.kill();
    })
  }


  getEmitData() {
    return {
      rest :this.rest
    }
  }

  kill() {
    this.bullets.forEach(bullet => {
      bullet.kill();
    })
  }
}

export default BulletChamber
