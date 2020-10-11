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
      image - キャラクターの画像
     */
    constructor(ctx, x, y, w, h, life, image){

        this.ctx = ctx;
        this.position = new Position(x, y);
        this.width = w;
        this.height = h;
        this.life = life;
        this.image = image;
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
    constructor(ctx, x, y, w, h, image){
        // 継承元の初期化
        super(ctx, x, y, w, h, 0, image);

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
        }

        // 自機キャラクターを描画する
        this.draw();

        // 念の為グローバルなアルファの状態を元に戻す
        this.ctx.globalAlpha = 1.0;
    }
}