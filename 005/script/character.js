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
      life - キャラクターのライフ（生存フラグを兼ねる）
      image - キャラクターの画像
     */
    constructor(ctx, x, y, life, image){
        
        this.ctx = ctx;
        this.position = new Position(x, y);
        this.life = life;
        this.image = image;
    }

    //キャラクターの描画
    draw(){
        this.ctx.drawImage(
            this.image,
            this.position.x,
            this.position.y
        );
    }
}

//Characterクラスを継承したviper（自分の操作キャラ）クラス
class Viper extends Character {
    
    constructor(ctx, x, y, image){
        // Character クラスを継承しているので、まずは継承元となる
        // Character クラスのコンストラクタを呼び出すことで初期化する
        // （super が継承元のコンストラクタの呼び出しに相当する）
        super(ctx, x, y, 0, image);
        //viper が登場中かどうかを表すフラグ
        this.isComing = false;
        //登場演出を開始した際のタイムスタンプ
        this.comingStart = null;
        //登場演出を完了とする座標
        this.comingEndPosition = null;
    }

    /**
     * 登場演出に関する設定を行う
     *  startX - 登場開始時の X 座標
     *  startY - 登場開始時の Y 座標
     *  endX - 登場終了とする X 座標
     *  endY - 登場終了とする Y 座標
     */
    setComing(startX, startY, endX, endY){
        // 登場中のフラグを立てる
        this.isComing = true;
        // 登場開始時のタイムスタンプを取得する
        this.comingStart = Date.now();
        // 登場開始位置に自機を移動させる
        this.position.set(startX, startY);
        // 登場終了とする座標を設定する
        this.comingEndPosition = new Position(endX, endY);
    }
}

