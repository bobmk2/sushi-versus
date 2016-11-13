var path = require('path');
var webpack = require('webpack');

var phaserModule = path.join(__dirname, '/node_modules/phaser/');
var phaser = path.join(phaserModule, 'build/custom/phaser-split.js');
var pixi = path.join(phaserModule, 'build/custom/pixi.js');
var p2 = path.join(phaserModule, 'build/custom/p2.js');

module.exports = {
  entry: {
    app: [
      'babel-polyfill',
      path.resolve(__dirname, 'src/client/index.js')
    ]
  },
  output: {
    path: __dirname + '/dist',
    filename: 'client.js'
  },
  module: {
    loaders: [
      {
        test: /\.js[x]?$/,
        exclude: /node_modules/,
        loader: "babel",
        query:{
          presets: ['es2015', 'stage-3']
        }
      },
      {test: /pixi\.js/, loader: 'expose?PIXI'},
      {test: /phaser-split\.js$/, loader: 'expose?Phaser'},
      {test: /p2\.js/, loader: 'expose?p2'}
    ]
  },
  node: {
    fs: 'empty'
  },
  resolve: {
    alias: {
      'phaser': phaser,
      'pixi': pixi,
      'p2': p2
    }
  }
};
