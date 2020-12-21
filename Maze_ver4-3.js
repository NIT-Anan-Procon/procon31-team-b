'use strict';
 
// canvasの設定
const CANVAS = document.querySelector("canvas");
CANVAS.width = CANVAS.height = 512;
const ctx = CANVAS.getContext("2d");

let PLAY = true; //プレイしているかどうか

// 乱数生成
function rand(n) {
    return Math.floor(Math.random() * n);
}

// 迷路の横幅と高さを指定（奇数）
const width = 67, height = 67;
const maze = [];

// 迷路作成
// 迷路の2次元配列作成　壁は1、通路は0
function createMazeArray(height, width){
    // 迷路のベースを作る
    for(let y = 1; y < height+1; y++){
        maze[y] = [];
        for(let x = 1; x < width+1; x++){
            // 1行目と最終行、1列目と最終列は1
            if(y == 1 || y == height || x == 1 || x == width){
                maze[y][x] = 1;
            }
            // 奇数行の奇数列は1
            else if(y % 2 == 1 && x % 2 == 1){
                maze[y][x] = 1;
            }
            // そのほかは0
            else{
                maze[y][x] = 0;
            }
        }
    }
    // 奇数行の奇数列のみ処理
    for(let y = 3; y < height; y+=2){
        for(let x = 3; x < width; x+=2){
            // 棒を倒せる方向を配列にする
            // 右と下は全パターンでOK
            const direction = ["right", "down"];
            // 1回目なら上もOK
            if(y == 3){
                direction.push("up"); //upを一回目だけ追加
            }
            // 左が壁じゃなければ左もOK
            if(maze[y][x-1] == 0){
                direction.push("left");
            }
            switch (direction[rand(direction.length)]) {
                case "up":
                    maze[y-1][x] = 1;
                    break;
                case "right":
                    maze[y][x+1] = 1;
                    break;
                case "down":
                    maze[y+1][x] = 1;
                    break;
                case "left":
                    maze[y][x-1] = 1;
                    break;
            }
        }
    }
    // 入口と出口を作成
    maze[1][2] = 0;
    maze[height][width-1] = 0;
}


// 入力クラス
// up : 上キー
// left : 左キー
// down : 下キー
// right : 右キー
class Input{
	constructor() {
		this.up = false;
		this.left = false;
		this.down = false;
		this.right = false;
	}
	push_key(){
        //キーが押された時の処理
		addEventListener("keydown", () => {
			const key_code = event.keyCode;
			if(key_code === 37) this.left = true;
			if(key_code === 38) this.up = true;
			if(key_code === 39) this.right = true;
			if(key_code === 40) this.down = true;
			event.preventDefault();	//方向キーでブラウザがスクロールしないようにする
		}, false);
		addEventListener("keyup", () => {
            //キーを放した時の処理
			const key_code = event.keyCode;
			if(key_code === 37) this.left = false;
			if(key_code === 38) this.up = false;
			if(key_code === 39) this.right = false;
			if(key_code === 40) this.down = false;
		}, false);
	}
}

// inputオブジェクトの作成
let input = new Input();


//ゲームクラス
class Game{
    //ゴールしたときの処理
    gool_view(){
        ctx.clearRect(0,0,512,512);//迷路を消す
        clearInterval(time);　　　 //時間を止める

        //GOOLと表示
        ctx.font = "8pt Arial"; //フォントをきめる
        ctx.fillStyle = "red";  //塗りつぶす色を決める
        ctx.fillText("GOOL", 6, 20);

        //クリアまでにかかった時間を表示
        let min = 0, sec = 0;
        ctx.font = "4pt Arial";
        ctx.fillStyle = "black";
        ctx.fillText("TIME", 8, 30)
        if(count >= 60){
            min = (count / 60) | 0;
            ctx.fillText(min, 10, 40);
            ctx.fillText(":", 16, 40);
        }
        sec = count - min*60;
        ctx.fillText(sec, 22, 40);
        ctx.fillText("秒", 30, 40);
    }
}
//gameオブジェクトの生成
let game = new Game();


// プレイヤークラス
// x : プレイヤーのx座標
// y : プレイヤーのy座標
// r : プレイヤーの半径
// color : プレイヤーの色
class Player{
    constructor(canvas, x, y, r, color){
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.r = r;
        this.color = color || "orange";
        this.speed = 0.1;
    }
    //プレイヤーの描写
    draw(){
        ctx.globalCompositeOperation = "source-over";//描写モードにする
        this.canvas.beginPath(); //パスの初期化
        this.canvas.fillStyle = this.color;//決めた色で塗りつぶす
        this.canvas.arc(this.x,this.y,this.r,0,2*Math.PI,true);//円を描く
        this.canvas.closePath(); //パスを閉じる
        this.canvas.fill();
    }
    //プレイヤーの移動
    move(){
        input.push_key();       //入力クラスから情報をもらう
        let x_right = (this.x + this.r*1.1) | 0;    //円の右端の座標
        let x_left = (this.x - this.r*1.1) | 0;     //円の左端の座標
        let y_high = (this.y - this.r*1.1) | 0;     //円の上端の座標
        let y_low = (this.y + this.r*1.1) | 0;      //円の下端の座標

        //方向キーが押され、道(塗りつぶさないところ)の場合、playerが移動する
        if(input.up){
            y_high = (this.y - this.r*1.1 - this.speed) | 0;
            if(maze[y_high][x_right] == 0 && maze[y_high][x_left] == 0){
            this.y -= this.speed;   //移動
            //残像消し
            this.canvas.globalCompositeOperation = "destination-out";
            this.canvas.beginPath();
            this.canvas.arc(this.x,this.y+this.speed,this.r*1.1,0,2*Math.PI,true);                
            this.canvas.fill();
            }
        }
        if(input.down){
            y_low = (this.y + this.r*1.1 + this.speed) | 0;
            if(maze[y_low][x_right] == 0 && maze[y_low][x_left] == 0){
            this.y += this.speed;
            this.canvas.globalCompositeOperation = "destination-out";
            this.canvas.beginPath();
            this.canvas.arc(this.x,this.y-this.speed,this.r*1.1,0,2*Math.PI,true);
            this.canvas.fill();
            }
        }
        if(input.right){
            x_right = (this.x + this.r*1.1 + this.speed) | 0;
            if(maze[y_high][x_right] == 0 && maze[y_low][x_right] == 0){
            this.x += this.speed;
            this.canvas.globalCompositeOperation = "destination-out";
            this.canvas.beginPath();
            this.canvas.arc(this.x-this.speed,this.y,this.r*1.1,0,2*Math.PI,true);
            this.canvas.fill();
            }
        }
        if(input.left){
            x_left = (this.x - this.r*1.1 - this.speed) | 0;
            if(maze[y_high][x_left] == 0 && maze[y_low][x_left] == 0){
            this.x -= this.speed;
            this.canvas.globalCompositeOperation = "destination-out";
            this.canvas.beginPath();
            this.canvas.arc(this.x+this.speed,this.y,this.r*1.1,0,2*Math.PI,true);
            this.canvas.fill();
            }
        }
    }
    gool(){
        //ゴールの座標
        let x = this.x | 0;
        let y = this.y | 0;
        if(y == height && x == width-1){
            PLAY = false;    //プレイがを終わったのでやめる
            game.gool_view();//ゴールした後の画面処理
        }
    }
}

// プレイヤーのオブジェクトを作成
let player = new Player(ctx, 2.5, 1, 0.3, 'blue');


//時間のカウントを行う
//count:カウントを入れる変数
let count = 0;        
function counttimer(){
    count++;
}


let FRAME_RATE = 50; // フレームレート
let TIMER_ID = window.setInterval(main,1000/FRAME_RATE); // ループ処理(フレーム数はFRAME_RATE)
let time = setInterval('counttimer()', 1000);//1秒ごとにカウントを呼び出す

//プレイがはじまるので入れる
PLAY = true;

// メインループ
function main() {
    if(PLAY){
        //ゴール地点を塗りつぶす
        ctx.fillStyle = "red";
        ctx.fillRect(width-1, height, 1, 1);

        // 迷路を表示
        addEventListener("load", ev => {
        //迷路の座標を呼び出す
        createMazeArray(height, width);
        // カンバスの大きさに合わせてサイズを拡大
        ctx.scale(CANVAS.width / width-1 , CANVAS.width / width-1);
        for(let y = 1; y < maze.length; y++){
            for(let x = 1; x < maze[y].length; x++){
                if(maze[y][x] == 1){
                    ctx.fillStyle = "black";
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        }, false);


        player.move();
        player.draw();
        player.gool();
    }
}
//ページと依存している全てのデータが読み込まれたら、メインループ開始
addEventListener('load', main(), false);