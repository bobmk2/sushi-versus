class ServerMass {
  constructor({indexX, indexY}) {
    this.indexX = indexX;
    this.indexY = indexY;
    //this.bulletStack = [];
    //this.bulletMapping = {};
    this.typeName = "default";
  }

//  detectTypeName() {
//    if (this.bulletStack.length === 0) {
//      return null;
//    }
//
//    console.log("++++ DETECT TYPE NAME ++++")
//    console.log(this.bulletStack)
//
//    // 2つのときは早いものを優先
//    const maguroBullets = this.bulletStack.filter(b => b.typeName === 'maguro');
//    const tamagoBullets = this.bulletStack.filter(b => b.typeName === 'tamago');
//
//    console.log("-------------------")
//    console.log(maguroBullets.length, tamagoBullets.length);
//    if (maguroBullets.length > 0 && tamagoBullets.length > 0) {
//      console.log("###################")
//      console.log("###################")
//      console.log("###################")
//      console.log("###################")
//      console.log("###################")
//      console.log("###################")
//
//    }
////    console.log(maguroBullets)
////    console.log("----")
////    console.log(tamagoBullets)
//    console.log("-------------------")
//
//    let destroyBulletUUids = {};
//
//    // どっちか片方しかないのならそちらを採用
//    if (maguroBullets.length === 0) {
//      this.typeName = 'tamago'
//    } else if (tamagoBullets.length === 0) {
//      this.typeName = 'maguro';
//    } else {
//      // 相殺処理
//
//      // 数の差を計算
//      let diff = maguroBullets.length - tamagoBullets.length;
//
//      // 0なら早い者勝ち
//      if (diff === 0) {
//        this.typeName = this.bulletStack[0].typeName;
//
//        // 全部消す
//        maguroBullets.forEach(bullet => {
//          destroyBulletUUids[bullet.uuid] = true;
//        });
//        tamagoBullets.forEach(bullet => {
//          destroyBulletUUids[bullet.uuid] = true;
//        });
//      } else if (diff < 0) {
//        // tamagoのほうが多い
//        this.typeName = 'tamago';
//
//        // maguroを全部入れて、差だけ削ったtamagoを入れる
//        maguroBullets.forEach(bullet => {
//          destroyBulletUUids[bullet.uuid] = true;
//        });
//        tamagoBullets.splice(0, Math.abs(diff)).forEach(bullet => {
//          destroyBulletUUids[bullet.uuid] = true;
//        });
//
//      } else {
//        // maguroのほうが多い
//        this.typeName = 'maguro';
//
//        // tamagoを全部入れて、差だけ削ったmaguroを入れる
//        tamagoBullets.forEach(bullet => {
//          destroyBulletUUids[bullet.uuid] = true;
//        });
//        maguroBullets.splice(0, Math.abs(diff)).forEach(bullet => {
//          destroyBulletUUids[bullet.uuid] = true;
//        });
//      }
//    }
//
//    // 空にする
//    this.bulletStack = [];
//    this.bulletMapping = {};
//
//    console.log('------------------');
//    console.log(destroyBulletUUids);
//    console.log("++++ DETECTED ++++ >>> " + this.typeName)
//
//    return destroyBulletUUids;
//  }


  //addBullet(bullet) {
  //  console.log("[ADD BULLET] uuid:", bullet.uuid);
  //  console.log(">>> " + this.bulletStack.length);
  //
  //  // すでにあるのなら何もしない
  //  if (this.bulletMapping.hasOwnProperty(bullet.uuid)) {
  //    return;
  //  }
  //  console.log(">>> ADD ######+++++ " + bullet.typeName)
  //
  //  this.bulletStack.push(bullet);
  //  this.bulletMapping[bullet.uuid] = bullet;
  //
  //  console.log(">>> " + this.bulletStack.length);
  //}
}

export default ServerMass;
