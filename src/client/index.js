import 'pixi';
import 'p2'
import Phaser from 'phaser';

var game = new Phaser.Game(960, 640, Phaser.AUTO, 'game', { preload: preload, create: create, update:update});

function preload() {
  game.load.image('tamago', 'img/tamago.png');
  game.load.image('maguro', 'img/maguro.png');
}

function create() {
  game.add.image(100, 100, 'tamago');
  game.add.image(200,200, 'maguro');
}

function update() {

}
