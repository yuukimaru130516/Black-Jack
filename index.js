'use strict';
// canvas の読み込み
const gameArea = document.getElementById('game-area');
const gameArea_ctx = gameArea.getContext('2d');

// スクリーンサイズ
const SCREEN_W = gameArea.width;
const SCREEN_H = gameArea.height;

// Game Area
gameArea_ctx.fillStyle = "#006400";
gameArea_ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

// Game Area Stroke
gameArea_ctx.strokeStyle = "#583822";
gameArea_ctx.lineWidth = 30;
gameArea_ctx.strokeRect(0, 0, SCREEN_W, SCREEN_H);

// トランプ画像サイズ
const dx = 712;
const dy = 1008;

// トランプ縮小倍率
const shrink = 7;

// game tempo
const gameTempo = 1000;

// game over flag
let gameOver = false;

// 画像読み込み
const srcs = [];

for(let i=1; i<=13; i++){
  srcs.push(`./trump-image/spade${i}.png`);
  srcs.push(`./trump-image/crab${i}.png`);
  srcs.push(`./trump-image/daia${i}.png`);
  srcs.push(`./trump-image/hart${i}.png`);
}

// 画像描画
function createImage(isUser, isOmote){
  if(isUser){
    // user image
    const userImages = [];

    for(let i in userCards){
      let drawUserImage = srcs.find((image) => {
        return image === `./trump-image/${userCards[i].mark}${userCards[i].value}.png`;
      });
      userImages[i] = new Image();
      userImages[i].src = drawUserImage;
      userImages[i].onload = () => {
        gameArea_ctx.drawImage(userImages[i], dx/shrink * i + SCREEN_W/4, SCREEN_H/2 + 50, dx/shrink, dy/shrink);
      }
    }
    
  }else{
    // dealer image
    const dealerImages = [];
    
    // trump の表
    const omote = new Image();
    omote.src = "./trump-image/omote.png";

    for(let i in dealerCards){
      let drawDealerImage = srcs.find((image) => {
        return image === `./trump-image/${dealerCards[i].mark}${dealerCards[i].value}.png`;
      });
      dealerImages[i] = new Image();
      dealerImages[i].src = drawDealerImage;
      dealerImages[i].onload = () => {
        if(i == 1 && isOmote){
          gameArea_ctx.drawImage(omote, dx/shrink * i + SCREEN_W/4, SCREEN_H/2 - dy/5 + 10 , dx/shrink, dy/shrink);
        }else{
          gameArea_ctx.drawImage(dealerImages[i], dx/shrink * i + SCREEN_W/4, SCREEN_H/2 - dy/5 + 10 , dx/shrink, dy/shrink);
        }
      }
    }
  }
}

// suffle メソッド
Array.prototype.shuffle = function() {
  this.sort(() => Math.random() - 0.5);
}

// デックの作成
const marks = ["spade", "crab", "hart", "daia"];
const cards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
const decks = new Array;

marks.forEach(mark => {
  cards.forEach(val => {
    let deck = new Object;
    deck.mark = mark;
    deck.value = val;
    decks.push(deck);
  });
});

decks.shuffle();


// 計算用カード
const calculateCards = decks.map(card => {
  const temp = new Array();
  const isOverTen = card.value >= 10;
  isOverTen ? temp.value = 10: temp.value = card.value;
  return temp;
});

// 所持カード
const userCards = new Array;
const userCalculateCards = new Array;
const dealerCards = new Array;
const dealerCalculateCards = new Array;

// 山札の何枚目か
let n = 0;

// ヒット処理 
function drawCard(isUser) {
      $("#hit").on('click', async function(){
        await choiceCard(n, isUser);
        if( isOver(true) ) {
          Object.seal(userCards);
          Object.seal(dealerCards);
          await setText(`現在のあなたの得点は、${calculate(true)} 点です`);
          await setText(`21点を超えたのであなたの負けです`);
        } else if(calculate(true) === 21 ) {
          await setText(`現在のあなたの得点は${calculate(true)}点です。`);
          await setText(`スタンドを押すと、ディーラーのターンになります`);
        } else {
          await setText(`現在のあなたの得点は${calculate(true)}点です。`);
          await setText(`続けて、カードを引きますか？`);
        }
      });
}

// スタンド処理
function stopCard() {
  return new Promise(resolve => {
    $("#stand").on('click', () => {
      Object.seal(userCards);
      resolve();
      }
  )});
}

// バーストしたか判定する
function isOver(isUser) {
  if(calculate(isUser) > 21){
    return true;
  } 
}

// ディーラーの処理
async function dealerTurn() {
    await setText(`ディーラーのターンです`);
    await drawDelerSecondImage();
    await setText(`現在ディーラーの得点は、${calculate(false)}点です。`);

  while(calculate(false) < 17) {
    await choiceCard(n, false);
    await setText(`現在ディーラーの得点は、${calculate(false)}点です。`);
  }
  if( isOver(false) ){
    await setText(`ディーラーの得点は、${calculate(false)}点です`);
    await setText(`ディーラーが21点を超えたので、あなたの勝ちです`);
  }
}

// ディーラーのテキスト
function setText(content) {
  return new Promise((resolve) => {
    setTimeout(() => {
      $("p").text(content);
      resolve();
    }, gameTempo);
  })
}

// ディーラーの2枚目のカードを表示する
function drawDelerSecondImage() {
  return new Promise(resolve => {
    setTimeout(() => {
      const dealerSecond = new Image();
      dealerSecond.src = `./trump-image/${dealerCards[1].mark}${dealerCards[1].value}.png`;
      dealerSecond.onload = () =>{
      gameArea_ctx.drawImage(dealerSecond, dx/shrink + SCREEN_W/4, SCREEN_H/2 - dy/5 + 10 , dx/shrink, dy/shrink);
    };  
      resolve();
    }, gameTempo)
  })
}

// 勝敗判定
function compareCard() {
  return new Promise((resolve) => {
    setTimeout(() => {
      if(calculate(true) > calculate(false)){
        setText(`あなたの勝ちです`);
      }else if(calculate(true) < calculate(false)){
        setText(`あなたの負けです`);
      }else  {
        setText(`引き分けです`);
      } 
      resolve();
    }, gameTempo);
  });
}

// 点数計算
function calculate(isUser) {
  let nowScore = 0;
  let Ascore = 0;
  let inA = false;

  if(isUser) {
    userCalculateCards.forEach(card => {
      if(card.value === 1) inA = true;
      nowScore += card.value;
    });
    if( inA ) Ascore = nowScore + 10;
    if(nowScore > 21) gameOver = true;
  } else {
    dealerCalculateCards.forEach(card => {
      if(card.value === 1) inA = true;
      nowScore += card.value;
    });
    if( inA ) Ascore = nowScore + 10;
  }
  if(inA && Ascore <= 21){
    return Ascore;
  }else{
    return nowScore;
  }
}

// カード選択
function choiceCard(i, isUser, isOmote) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if(isUser) {
        userCards.push(decks[i]);
        userCalculateCards.push(calculateCards[i]);
      } else {
        dealerCards.push(decks[i]);
        dealerCalculateCards.push(calculateCards[i]);
      }
      createImage(isUser, isOmote);
      n ++;
      resolve();
    }, 500)
  })
}

// main 部分
async function main (){
  // 初期値
  await choiceCard(n, true);
  await choiceCard(n, true);
  await choiceCard(n, false, true);
  await choiceCard(n, false, true);

  // your turn
  await setText(`現在のあなたの得点は、${calculate(true)} 点です`);
  await setText(`カードを引きますか？`);
  drawCard(true);
  await stopCard();

  // ディーラー ターン
  if(!isOver(true)){
    await dealerTurn();
  }

  // 勝負
  if (!isOver(false) && !isOver(true)) {
    await compareCard();
  }
}

main();
