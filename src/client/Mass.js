
class Mass {
  constructor({game, group}, {indexX, indexY, x, y, typeName = 'default'}) {
    this.game = game;

    this.image = group.create(x, y, 'mass');
    this.image.name = `${indexY}-${indexX}`;
    this.image.scale.set(2);
    this.image.smoothed = false;
    this.image.anchor.setTo(0.5, 0.5);

    this.changeTypeName(typeName);

    this.image.animations.add('default', [0], 1, false);
    this.image.animations.add('maguro', [1], 1, false);
    this.image.animations.add('tamago', [2], 1, false);
  }

  changeTypeName(typeName) {
    this.typeName = typeName;
    this.image.animations.play(typeName);
  }
}

export default Mass;
