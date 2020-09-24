(() => {
    //canvasの幅
    const CANVAS_WIDTH = 640;
    //canvasの高さ
    const CANVAS_HEIGHT = 480;

    //Canvas2D API をラップしたユーティリティクラス
    let util = null;
    //描画対象となる Canvas Element
    let canvas = null;
    //Canvas2D API のコンテキスト
    let ctx = null;
    //イメージのインスタンス
    let image = null;


    /**
     * ページのロードが完了したときに発火する load イベント
     */
    window.addEventListener('load', () => {
        // ユーティリティクラスを初期化
        util = new Canvas2DUtility(document.body.querySelector('#main_canvas'));
        // ユーティリティクラスから canvas を取得
        canvas = util.canvas;
        // ユーティリティクラスから 2d コンテキストを取得
        ctx = util.context;

        // まず最初に画像の読み込みを開始する
        util.imageLoader('./image/viper.png', (loadedImage) => {
            // 引数経由で画像を受け取り変数に代入しておく
            image = loadedImage;
            // 初期化処理を行う
            initialize();
            // 描画処理を行う
            render();
        });
    }, false);

    //canvas やコンテキストを初期化する
    function initialize(){
        // canvas の大きさを設定
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
    }

    //描画処理を行う
    function render(){
        // 描画前に画面全体を不透明な明るいグレーで塗りつぶす
        util.drawRect(0, 0, canvas.width, canvas.height, '#eeeeee');
        // 画像を描画する
        ctx.drawImage(image, 345, 156);
    }

    //特定の範囲におけるランダムな整数の値を生成する
    function generateRandomInt(range){
        let random = Math.random();
        return Math.floor(random * range);
    }
})();