class Enemy {
  constructor({game, group}, {id, x, y, launching}) {
    this.id = id;
    this.game = game;
    this.group = group;

    this.x = x;
    this.y = y;

    this.image = null;

    this.launching = launching;
    const launchingEffect = game.add.sprite(x, y, 'launching-effect');
    launchingEffect.scale.set(2.5);
    launchingEffect.anchor.set(0.5);
    launchingEffect.animations.add('default', [0], 1, false);
    launchingEffect.animations.play('default');
    game.add.tween(launchingEffect.scale).to({x: 2, y:2}, 500, Phaser.Easing.Linear.None, true, 0, 0, false).loop(true);
    game.add.tween(launchingEffect).to({alpha: 0.5}, 500, Phaser.Easing.Linear.None, true, 0, 0, false).loop(true);
    this.launchingEffect = launchingEffect;

    if (launching) {
      // 起動中なら画像も作らない
    } else {
      launchingEffect.kill();
      this.initImage();
    }

    this.deadFlag = false;

    this.initializedImage = false;
  }

  initImage() {
    if (this.initializedImage) {
      return;
    }
    console.log("INIT IMAGE");

    const image = this.group.create(this.x, this.y, 'dish');
    image.scale.set(2);
    image.name = this.id;
    image.anchor.set(0.5);
    this.game.add.tween(image).to({angle: 360}, 1000, Phaser.Easing.Linear.None, true, 0, 0, false).loop(true);
    this.image = image;

    this.initializedImage = true;
  }

  updateStatus(data) {
    if (this.deadFlag) {
      return;
    }

    if (this.launching && !data.launching) {
      if (this.launchingEffect.alive) {
        this.launchingEffect.kill();
      }

      this.initImage();
    }
    this.launching = data.launching;

    if (this.image !== null) {
      const tween = this.game.add.tween(this.image).to({x: data.x, y:data.y}, 100, Phaser.Easing.Linear.None, true, 0, 0, false);
      tween.onComplete.add(() => {
        this.image.x = data.x;
        this.image.y = data.y;
      });
    }
  }

  die() {
    if (this.deadFlag) {
      return;
    }
    this.deadFlag = true;

    // エフェクト
    const effect = this.game.add.sprite(this.image.x, this.image.y, 'dish');
    effect.scale.set(2);
    effect.anchor.setTo(0.5, 0.5);
    effect.smoothed = false;
    effect.angle = this.image.angle;
    this.game.add.tween(effect.scale).to({x:5, y:5}, 2000, Phaser.Easing.Exponential.Out, true, 0, 0, false);
    this.game.add.tween(effect).to({alpha:0}, 2000, Phaser.Easing.Exponential.Out, true, 0, 0, false);

    this.image.kill();
    if (this.launchingEffect.alive) {
      this.launchingEffect.kill()
    }
  }

  isDead() {
    return this.deadFlag;
  }

  static fromEmitData({game, group}, data) {
    return new Enemy({game, group}, data);
  }
}

export default Enemy;
