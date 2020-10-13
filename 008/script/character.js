//座標の管理
class Position {

    constructor(x, y){
        //X座標
        this.x = x;
        // Y 座標
        this.y = y;
    }

    //各座標がnull出なかった場合、値を設定する
    set(x, y){
        if(x != null){this.x = x;}
        if(y != null){this.y = y;}
    }
}

//キャラクター管理のための基幹クラス
class Character {
    /*
      ctx - 描画などに利用する 2D コンテキスト
      x - X 座標
      y - Y 座標
      w - 幅
      h - 高さ
      life - キャラクターのライフ（生存フラグを兼ねる）
      image - キャラクターの画像のパス
     */
    constructor(ctx, x, y, w, h, life, imagePath){

        this.ctx = ctx;
        this.position = new Position(x, y);
        this.width = w;
        this.height = h;
        this.life = life;
        this.ready = false;
        this.image = new Image();
        this.image.addEventListener('load',() =>{
            //画像のロードが完了したら準備完了フラグを立てる
            this.ready = true;
        },false);
        this.image.src = imagePath;
    }

    //キャラクターの描画
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
}

//Characterクラスを継承したviper（自分の操作キャラ）クラス
class Viper extends Character {
    constructor(ctx, x, y, w, h, imagePath){
        // 継承元の初期化
        super(ctx, x, y, w, h, 0, imagePath);

        //移動速度(update1回あたりの移動量)
        this.speed = 3;

        //viper が登場中かどうかを表すフラグ
        this.isComing = false;
        //登場演出を開始した際のタイムスタンプ
        this.comingStart = null;
        //登場演出を開始する座標
        this.comingStartPosition = null;
        //登場演出を完了とする座標
        this.comingEndPosition = null;
    }

    /**
     * 登場演出に関する設定を行う
     * startX - 登場開始時の X 座標
     * startY - 登場開始時の Y 座標
     * endX - 登場終了とする X 座標
     * endY - 登場終了とする Y 座標
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

    //ショットを設定する
    setShotArray(shotArray){
        this.ShotArray = shotArray;
    }

    //キャラクターの状態を更新し描画を行う
     
    update(){
        // 現時点のタイムスタンプを取得する
        let justTime = Date.now();

        // 登場シーンの処理
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
            if(window.isKeyDown.key_ArrowLeft === true){
                this.position.x -= this.speed; //アローキーの左
            }
            if(window.isKeyDown.key_ArrowRight === true){
                this.position.x += this.speed; //アローキーの右
            }
            if(window.isKeyDown.key_ArrowUp === true){
                this.position.y -= this.speed; //アローキーの上
            }
            if(window.isKeyDown.key_ArrowDown === true){
                this.position.y += this.speed; //アローキーの下
            }

            // 移動後の位置が画面外へ出ていないか確認して修正する
            let canvasWidth = this.ctx.canvas.width;
            let canvasHeight = this.ctx.canvas.height;
            let tx = Math.min(Math.max(this.position.x, 0), canvasWidth);
            let ty = Math.min(Math.max(this.position.y, 0), canvasHeight);
            this.position.set(tx, ty);

            // キーの押下状態を調べてショットを生成する
            if(window.isKeyDown.key_z === true){
                //ショットの生存を確認し、非生存のものがあれば生成する
                for(let i = 0; i < this.shotArray.length; i++){
                    if(this.shotArray[i].life <= 0){
                        //自機キャラクターの座標にショットを生成する
                        this.shotArray[i].set(this.position.x, this.position.y);
                        //一つ生成したらループを抜ける
                        break;
                    }
                }
            }
        }
        

        // 自機キャラクターを描画する
        this.draw();

        // 念の為グローバルなアルファの状態を元に戻す
        this.ctx.globalAlpha = 1.0;
    }
}

//Characterクラスを継承したShotクラス
class Shot extends Character {
    
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
    }

    
    //キャラクターの状態を更新し描画を行う
    update(){
        // もしショットのライフが 0 以下の場合はなにもしない
        if(this.life <= 0){return;}
        // もしショットが画面外へ移動していたらライフを 0（非生存の状態）に設定する
        if(this.position.y + this.height < 0){
            this.life = 0;
        }
        // ショットを上に向かって移動させる
        this.position.y -= this.speed;
        // ショットを描画する
        this.draw();
    }
}