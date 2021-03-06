
/**
 * 座標を管理するためのクラス
 */
class Position {
    /*
      x - X 座標
      y - Y 座標
     */
    constructor(x, y){
        //X 座標
        this.x = x;
        //Y 座標
        this.y = y;
    }

    /*
      値を設定する
      [x] - 設定する X 座標
      [y] - 設定する Y 座標
    */
    set(x, y){
        if(x != null){this.x = x;}
        if(y != null){this.y = y;}
    }
}

// キャラクター管理のための基幹クラス
class Character {
    /*
      ctx - 描画などに利用する 2D コンテキスト
      x - X 座標
      y - Y 座標
      w - 幅
      h - 高さ
      life - キャラクターのライフ（生存フラグを兼ねる）
      imagePath - キャラクターの画像のパス
     */
    constructor(ctx, x, y, w, h, life, imagePath){

        this.ctx = ctx;
        this.position = new Position(x, y);
        this.vector = new Position(0.0, -1.0);
        this.angle = 270 * Math.PI / 180;
        this.width = w;
        this.height = h;
        this.life = life;
        this.ready = false;
        this.image = new Image();

        this.image.addEventListener('load', () => {
            // 画像のロードが完了したら準備完了フラグを立てる
            this.ready = true;
        }, false);
        this.image.src = imagePath;
    }

    /*
      進行方向を設定する
      x - X 方向の移動量
      y - Y 方向の移動量
     */
    setVector(x, y){
        // 自身の vector プロパティに設定する
        this.vector.set(x, y);
    }


    //進行方向を角度を元に設定する
    setVectorFromAngle(angle){
        // 自身の回転量を設定する
        this.angle = angle;
        // ラジアンからサインとコサインを求める
        let sin = Math.sin(angle);
        let cos = Math.cos(angle);
        // 自身の vector プロパティに設定する
        this.vector.set(cos, sin);
    }

    //キャラクターを描画する
    draw(){
        // キャラクターの幅を考慮してオフセットする量
        let offsetX = this.width / 2;
        let offsetY = this.height / 2;
        // キャラクターの幅やオフセットする量を加味して描画する
        this.ctx.drawImage(
            this.image,
            this.position.x - offsetX,
            this.position.y - offsetY,
            this.width,
            this.height
        );
    }

    //自身の回転量を元に座標系を回転させる
    rotationDraw(){
        // 座標系を回転する前の状態を保存する
        this.ctx.save();
        // 自身の位置が座標系の中心と重なるように平行移動する
        this.ctx.translate(this.position.x, this.position.y);
        // 座標系を回転させる（270 度の位置を基準にするため Math.PI * 1.5 を引いている）
        this.ctx.rotate(this.angle - Math.PI * 1.5);

        // キャラクターの幅を考慮してオフセットする量
        let offsetX = this.width / 2;
        let offsetY = this.height / 2;
        // キャラクターの幅やオフセットする量を加味して描画する
        this.ctx.drawImage(
            this.image,
            -offsetX, // 先に translate で平行移動しているのでオフセットのみ行う
            -offsetY, // 先に translate で平行移動しているのでオフセットのみ行う
            this.width,
            this.height
        );

        // 座標系を回転する前の状態に戻す
        this.ctx.restore();
    }
}

//characterクラスを継承したviperクラス
class Viper extends Character {
    /**
      ctx - 描画などに利用する 2D コンテキスト
      x - X 座標
      y - Y 座標
      w - 幅
      h - 高さ
      image - キャラクター用の画像のパス
     */
    constructor(ctx, x, y, w, h, imagePath){
        // 継承元の初期化
        super(ctx, x, y, w, h, 0, imagePath);

        //自身の移動スピード（update 一回あたりの移動量）
        this.speed = 3;
        //ショットを撃ったあとのチェック用カウンタ
        this.shotCheckCounter = 0;
        //ショットを撃つことができる間隔（フレーム数）
        this.shotInterval = 10;
        //viper が登場中かどうかを表すフラグ
        this.isComing = false;
        //登場演出を開始した際のタイムスタンプ
        this.comingStart = null;
        //登場演出を開始する座標
        this.comingStartPosition = null;
        //登場演出を完了とする座標
        this.comingEndPosition = null;
        //自身が持つショットインスタンスの配列
        this.shotArray = null;
        //自身が持つシングルショットインスタンスの配列
        this.singleShotArray = null;
    }

    /*
     登場演出に関する設定を行う
     startX - 登場開始時の X 座標
     startY - 登場開始時の Y 座標
     endX - 登場終了とする X 座標
     endY - 登場終了とする Y 座標
    */
    setComing(startX, startY, endX, endY){
        // 登場中のフラグを立てる
        this.isComing = true;
        // 登場開始時のタイムスタンプを取得する
        this.comingStart = Date.now();
        // 登場開始位置に自機を移動させる
        this.position.set(startX, startY);
        // 登場開始位置を設定する
        this.comingStartPosition = new Position(startX, startY);
        // 登場終了とする座標を設定する
        this.comingEndPosition = new Position(endX, endY);
    }

    /*
     ショットを設定する
     shotArray - 自身に設定するショットの配列
     singleShotArray - 自身に設定するシングルショットの配列
    */
    setShotArray(shotArray, singleShotArray){
        // 自身のプロパティに設定する
        this.shotArray = shotArray;
        this.singleShotArray = singleShotArray;
    }

    //キャラクターの状態を更新し描画を行う
    update(){
        // 現時点のタイムスタンプを取得する
        let justTime = Date.now();

        // 登場シーンかどうかに応じて処理を振り分ける
        if(this.isComing === true){
            // 登場シーンが始まってからの経過時間
            let comingTime = (justTime - this.comingStart) / 1000;
            // 登場中は時間が経つほど上に向かって進む
            let y = this.comingStartPosition.y - comingTime * 50;
            // 一定の位置まで移動したら登場シーンを終了する
            if(y <= this.comingEndPosition.y){
                this.isComing = false;        // 登場シーンフラグを下ろす
                y = this.comingEndPosition.y; // 行き過ぎの可能性もあるので位置を再設定
            }
            // 求めた Y 座標を自機に設定する
            this.position.set(this.position.x, y);

            // 自機の登場演出時は点滅させる
            if(justTime % 100 < 50){
                this.ctx.globalAlpha = 0.5;
            }
        }else{
            // キーの押下状態を調べて挙動を変える
            if(window.isKeyDown.key_ArrowLeft === true){
                this.position.x -= this.speed; // アローキーの左
            }
            if(window.isKeyDown.key_ArrowRight === true){
                this.position.x += this.speed; // アローキーの右
            }
            if(window.isKeyDown.key_ArrowUp === true){
                this.position.y -= this.speed; // アローキーの上
            }
            if(window.isKeyDown.key_ArrowDown === true){
                this.position.y += this.speed; // アローキーの下
            }
            // 移動後の位置が画面外へ出ていないか確認して修正する
            let canvasWidth = this.ctx.canvas.width;
            let canvasHeight = this.ctx.canvas.height;
            let tx = Math.min(Math.max(this.position.x, 0), canvasWidth);
            let ty = Math.min(Math.max(this.position.y, 0), canvasHeight);
            this.position.set(tx, ty);

            // キーの押下状態を調べてショットを生成する
            if(window.isKeyDown.key_z === true){
                // ショットを撃てる状態なのかを確認する
                // ショットチェック用カウンタが 0 以上ならショットを生成できる
                if(this.shotCheckCounter >= 0){
                    let i;
                    // ショットの生存を確認し非生存のものがあれば生成する
                    for(i = 0; i < this.shotArray.length; ++i){
                        // 非生存かどうかを確認する
                        if(this.shotArray[i].life <= 0){
                            // 自機キャラクターの座標にショットを生成する
                            this.shotArray[i].set(this.position.x, this.position.y);
                            // ショットを生成したのでインターバルを設定する
                            this.shotCheckCounter = -this.shotInterval;
                            // ひとつ生成したらループを抜ける
                            break;
                        }
                    }
                    // シングルショットの生存を確認し非生存のものがあれば生成する
                    // このとき、2 個をワンセットで生成し左右に進行方向を振り分ける
                    for(i = 0; i < this.singleShotArray.length; i += 2){
                        // 非生存かどうかを確認する
                        if(this.singleShotArray[i].life <= 0 && this.singleShotArray[i + 1].life <= 0){
                            // 真上の方向（270 度）から左右に 10 度傾いたラジアン
                            let radCW = 280 * Math.PI / 180;  // 時計回りに 10 度分
                            let radCCW = 260 * Math.PI / 180; // 反時計回りに 10 度分
                            // 自機キャラクターの座標にショットを生成する
                            this.singleShotArray[i].set(this.position.x, this.position.y);
                            this.singleShotArray[i].setVectorFromAngle(radCW); // やや右に向かう
                            this.singleShotArray[i + 1].set(this.position.x, this.position.y);
                            this.singleShotArray[i + 1].setVectorFromAngle(radCCW); // やや左に向かう
                            // ショットを生成したのでインターバルを設定する
                            this.shotCheckCounter = -this.shotInterval;
                            // 一組生成したらループを抜ける
                            break;
                        }
                    }
                }
            }
            // ショットチェック用のカウンタをインクリメントする

            ++this.shotCheckCounter;
        }

        // 自機キャラクターを描画する
        this.draw();

        // 念の為グローバルなアルファの状態を元に戻す
        this.ctx.globalAlpha = 1.0;
    }
}

//characterクラスを継承したenemyクラス
class Enemy extends Character {
    /*
      ctx - 描画などに利用する 2D コンテキスト
      x - X 座標
      y - Y 座標
      w - 幅
      h - 高さ
      image - キャラクター用の画像のパス
     */
    constructor(ctx, x, y, w, h, imagePath){
        // 継承元の初期化
        super(ctx, x, y, w, h, 0, imagePath);

        //自身のタイプ
        this.type = 'default';
        //自身が出現してからのフレーム数
        this.frame = 0;
        //自身の移動スピード（update 一回あたりの移動量）
        this.speed = 3;
        //自身がもつショットインスタンスの配列
        this.shotArray = null;
    }

    /*
     敵を配置する
     x - 配置する X 座標
     y - 配置する Y 座標
     [life=1] - 設定するライフ
     [type='default']-設定するタイプ
    */
    set(x, y, life = 1, type = 'default'){
        // 登場開始位置に敵キャラクターを移動させる
        this.position.set(x, y);
        // 敵キャラクターのライフを 0 より大きい値（生存の状態）に設定する
        this.life = life;
        //敵キャラクターのタイプを設定する
        this.type = type;
        //敵キャラクターのフレームをリセットする
        this.frame = 0;
    }

    //ショットを設定する
    setShotArray(shotArray){
        //自身のプロパティに設定する
        this.shotArray = shotArray;
    }

    //キャラクターの状態を更新し描画を行う
    update(){
        // もし敵キャラクターのライフが 0 以下の場合はなにもしない
        if(this.life <= 0){return;}

        // タイプに応じて挙動を変える
        // タイプに応じてライフを 0 にする条件も変える
        switch(this.type){
            // default タイプは設定されている進行方向にまっすぐ進むだけの挙動
            case 'default':
            default:
                // 配置後のフレームが 50 のときにショットを放つ
                if(this.frame === 50){
                    this.fire();
                }
                // 敵キャラクターを進行方向に沿って移動させる
                this.position.x += this.vector.x * this.speed;
                this.position.y += this.vector.y * this.speed;
                // 画面外（画面下端）へ移動していたらライフを 0（非生存の状態）に設定する
                if(this.position.y - this.height > this.ctx.canvas.height){
                    this.life = 0;
                }
                break;
        }

        // 描画を行う（いまのところ特に回転は必要としていないのでそのまま描画）
        this.draw();
        // 自身のフレームをインクリメントする
        ++this.frame;
    }

    //自身から指定された方向にショットを放つ
    fire(x =0.0, y = 1.0){
        // ショットの生存を確認し非生存のものがあれば生成する
        for(let i = 0; i < this.shotArray.length; ++i){
            // 非生存かどうかを確認する
            if(this.shotArray[i].life <= 0){
                // 敵キャラクターの座標にショットを生成する
                this.shotArray[i].set(this.position.x, this.position.y);
                // ショットのスピードを設定する
                this.shotArray[i].setSpeed(5.0);
                // ショットの進行方向を設定する（真下）
                this.shotArray[i].setVector(x, y);
                // ひとつ生成したらループを抜ける
                break;
            }
        }
    }
}

//characterクラスを継承したshotクラス
class Shot extends Character {
    /**
      ctx - 描画などに利用する 2D コンテキスト
      x - X 座標
      y - Y 座標
      w - 幅
      h - 高さ
      image - キャラクター用の画像のパス
     */
    constructor(ctx, x, y, w, h, imagePath){
        // 継承元の初期化
        super(ctx, x, y, w, h, 0, imagePath);

        //自身の移動スピード（update 一回あたりの移動量）
        this.speed = 7;
    }

    /*
     ショットを配置する
     x - 配置する X 座標
     y - 配置する Y 座標
     */
    set(x, y){
        // 登場開始位置にショットを移動させる
        this.position.set(x, y);
        // ショットのライフを 0 より大きい値（生存の状態）に設定する
        this.life = 1;
        // スピードの設定
        this.setSpeed(speed);
    }

    //↑のショットのスピードを設定する関数
    setSpeed(speed){
        if(speed != null && speed > 0){
            this.speed = speed;
        }
    }

    //キャラクターの状態を更新し描画を行う
    update(){
        // もしショットのライフが 0 以下の場合はなにもしない
        if(this.life <= 0){return;}
        // もしショットが画面外へ移動していたらライフを 0（非生存の状態）に設定する
        if(
            this.position.y + this.height < 0 ||
            this.position.y - this.height > this.ctx.canvas.height
        ){
            this.life = 0;
        }
        // ショットを進行方向に沿って移動させる
        this.position.x += this.vector.x * this.speed;
        this.position.y += this.vector.y * this.speed;

        // 座標系の回転を考慮した描画を行う
        this.rotationDraw();
    }
}

