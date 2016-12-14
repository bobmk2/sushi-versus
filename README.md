# SUSHI-VERSUS

- I wrote this code in [Node Knockout 2016](https://www.nodeknockout.com/) in 2 days.
  - Entry Page: https://www.nodeknockout.com/entries/80-team-kuramae
- This is multi-play shooting game with sushi.

## About Code

### Environment

- node `4.6.0` or `6.7.0`.

### Intro

```shell
# Clone
$ git clone git@github.com:bobmk2/sushi-versus.git && cd sushi-versus
$ npm install

# Build server and client codes for prod
$ npm run build

# Run game server
npm run start:server

# 🎉 Let's play game 🎉
# Access => http://localhost:5000
```

### Known Issue

- maintenance dependencies
- buggy
- required test
- required lint

## About Game

> Copy from entry page

### Description

This is multiplay shooting game with sushi.

You can control your sushi, and battle another team.

Shoot your bullet(this is salmon-caviar), and drawing another team's mass.

### Instructions

There are three teams, Maguro-Sushi(Tsuna), Tamago-Sushi(Egg) and Dish(NPC).

Your sushi can draw another team's mass by shooting bullet, and move in only your team color. (maguro is red, tamago is yellow).

Dish(NPC) is invader, closing your sushi with drawing your area by void area.

#### Intro

1. Move only to your team area
  * ![intro1](https://cloud.githubusercontent.com/assets/1858949/20252102/a78e21c2-aa62-11e6-820e-4034fb6c2355.png)
2. Drawing to another team area by bullets
  * ![intro2](https://cloud.githubusercontent.com/assets/1858949/20252100/a57274f6-aa62-11e6-9645-af60a156b1b6.png)
3. Dead when you are in another team area
  * ![intro3](https://cloud.githubusercontent.com/assets/1858949/20252098/a3a53140-aa62-11e6-8819-9ed0049a05b2.png)
4. Dish is incoming to you with drawing void area
  * ![intro4](https://cloud.githubusercontent.com/assets/1858949/20252096/a19b96aa-aa62-11e6-9c10-43f05b8b51e0.png)

#### Directed

- **Move**: [A][W][S][D] keys
- **Shot**: [←][↑][↓][→] keys
- **Multiple-Shot**: Holding shot button and release

#### Characters

- ![Tamago](https://github.com/bobmk2/sushi-versus/blob/master/public/img/tamago.png?raw=true) Tamago(egg) Sushi (**Player**)
- ![Maguro](https://github.com/bobmk2/sushi-versus/blob/master/public/img/maguro.png?raw=true) Maguro(tuna) Sushi (**Player**)
- ![Dish](https://github.com/bobmk2/sushi-versus/blob/master/public/img/dish.png?raw=true) Dish (**NPC**)
- ![Ikura](https://github.com/bobmk2/sushi-versus/blob/master/public/img/full-ikura.png?raw=true) Ikura(salmon-caviar) Bullet

#### Tips

- Your sushi has max 5 bullets.
- Your sushi **dose not** replenish bullets when shot keys is holding-pressed.

### Build With

#### client

- Phaser: https://phaser.io/
- socket.io: http://socket.io/
- webpack: https://webpack.github.io/
- babel: https://babeljs.io/

#### server

- nodejs: https://nodejs.org/ja/
- express: http://expressjs.com/
- socket.io: http://socket.io/
- gulp: http://gulpjs.com/
- babel: https://babeljs.io/

#### respects

- INVERSUS: http://www.inversusgame.com/
