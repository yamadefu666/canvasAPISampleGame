
(() => {
    /*
     キーの押下状態を調べるためのオブジェクト
     このオブジェクトはプロジェクトのどこからでも参照できるように
     */
    window.isKeyDown = {};

    //canvas の幅
    const CANVAS_WIDTH = 640;
    //canvas の高さ
    const CANVAS_HEIGHT = 480;
    //ショットの最大個数
    const SHOT_MAX_COUNT = 10;

    //Canvas2D API をラップしたユーティリティクラス
    let util = null;
    //描画対象となる Canvas Element
    let canvas = null;
    //Canvas2D API のコンテキスト
    let ctx = null;
    //実行開始時のタイムスタンプ
    let startTime = null;
    //自機キャラクターのインスタンス
    let viper = null;
    //ショットのインスタンスを格納する配列
    let shotArray = [];
    //シングルショットのインスタンスを格納する配列
    let singleShotArray = [];

    //ページのロードが完了したときに発火する load イベント
    window.addEventListener('load', () => {
        // ユーティリティクラスを初期化
        util = new Canvas2DUtility(document.body.querySelector('#main_canvas'));
        // ユーティリティクラスから canvas を取得
        canvas = util.canvas;
        // ユーティリティクラスから 2d コンテキストを取得
        ctx = util.context;

        // 初期化処理を行う
        initialize();
        // インスタンスの状態を確認する
        loadCheck();
    }, false);

    //canvas やコンテキストを初期化する
    function initialize(){
        // canvas の大きさを設定
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        // 自機キャラクターを初期化する
        viper = new Viper(ctx, 0, 0, 64, 64, './image/viper.png');
        // 登場シーンからスタートするための設定を行う
        viper.setComing(
            CANVAS_WIDTH / 2,   // 登場演出時の開始 X 座標
            CANVAS_HEIGHT + 50, // 登場演出時の開始 Y 座標
            CANVAS_WIDTH / 2,   // 登場演出を終了とする X 座標
            CANVAS_HEIGHT - 100 // 登場演出を終了とする Y 座標
        );

        // ショットを初期化する
        for(let i = 0; i < SHOT_MAX_COUNT; ++i){
            shotArray[i] = new Shot(ctx, 0, 0, 32, 32, './image/viper_shot.png');
        }

        // ショットを自機キャラクターに設定する
        viper.setShotArray(shotArray, singleShotArray);
    }

    //インスタンスの準備が完了しているか確認する
    function loadCheck(){
        // 準備完了を意味する真偽値
        let ready = true;
        // AND 演算で準備完了しているかチェックする
        ready = ready && viper.ready;
        // 同様にショットの準備状況も確認する
        shotArray.map((v) => {
            ready = ready && v.ready;
        });
        //シングルショットも
        singleShotArray.map((v) =>{
            ready = ready && v.ready;
        });

        // 全ての準備が完了したら次の処理に進む
        if(ready === true){
            // イベントを設定する
            eventSetting();
            // 実行開始時のタイムスタンプを取得する
            startTime = Date.now();
            // 描画処理を開始する
            render();
        }else{
            // 準備が完了していない場合は 0.1 秒ごとに再帰呼出しする
            setTimeout(loadCheck, 100);
        }
    }

    //イベントを設定する
    function eventSetting(){
        // キーの押下時に呼び出されるイベントリスナーを設定する
        window.addEventListener('keydown', (event) => {
            // キーの押下状態を管理するオブジェクトに押下されたことを設定する
            isKeyDown[`key_${event.key}`] = true;
        }, false);
        // キーが離された時に呼び出されるイベントリスナーを設定する
        window.addEventListener('keyup', (event) => {
            // キーが離されたことを設定する
            isKeyDown[`key_${event.key}`] = false;
        }, false);
    }

    //描画処理を行う
    function render(){
        // グローバルなアルファを必ず 1.0 で描画処理を開始する
        ctx.globalAlpha = 1.0;
        // 描画前に画面全体を不透明な明るいグレーで塗りつぶす
        util.drawRect(0, 0, canvas.width, canvas.height, '#eeeeee');
        // 現在までの経過時間を取得する（ミリ秒を秒に変換するため 1000 で除算）
        let nowTime = (Date.now() - startTime) / 1000;

        // 自機キャラクターの状態を更新する
        viper.update();

        // ショットの状態を更新する
        shotArray.map((v) => {
            v.update();
        });

        //シングルショットも
        singleShotArray.map((v) =>{
            v.update();
        });

        // 恒常ループのために描画処理を再帰呼出しする
        requestAnimationFrame(render);
    }

    
    //特定の範囲におけるランダムな整数の値を生成する
    function generateRandomInt(range){
        let random = Math.random();
        return Math.floor(random * range);
    }
})();
