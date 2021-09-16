'use strict';

// canvas の読み込み
const gameArea = document.getElementById('game-area');
const gameArea_ctx = gameArea.getContext('2d');

gameArea_ctx.font = "13px monospace"

// dealer Area
gameArea_ctx.fillStyle = "gray";
gameArea_ctx.fillRect(400, 230, 500, 300);

// user Area
gameArea_ctx.fillRect(400, 600, 500, 300);

// 画像サイズ
const dx = 712;
const dy = 1008;

// TODO choice card が読み込まれた後、new image() が一つ作成される。
// 画像読み込み
const srcs = [];

for(let i=1; i<=13; i++){
  srcs.push(`./trump-image/spade${i}.png`);
  srcs.push(`./trump-image/crab${i}.png`);
  srcs.push(`./trump-image/daia${i}.png`);
  srcs.push(`./trump-image/hart${i}.png`);
}

const dealer = new Image();
dealer.src = './trump-image/casino_dealer_man2.png';
dealer.onload = () => {
  gameArea_ctx.drawImage(dealer, 450, 10);
}



// 画像描画
function createImage(isUser){
  if(isUser){
    const userImages = [];

    for(let i in userCards){
      let drawUserImage = srcs.find((image) => {
        return image === `./trump-image/${userCards[i].mark}${userCards[i].value}.png`;
      });
      userImages[i] = new Image();
      userImages[i].src = drawUserImage;
      userImages[i].onload = () => {
        gameArea_ctx.drawImage(userImages[i], 150 * i + 500, 700, dx/7, dy/7);
      }
    }
    
  }else{
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
        if(i == 1){
          gameArea_ctx.drawImage(omote, 150 * i + 500, 280, dx/7, dy/7);
        }else{
          gameArea_ctx.drawImage(dealerImages[i], 150 * i + 500, 280, dx/7, dy/7);
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

// 表示用カード

const displayCards = decks.map(card => {
  const container = new Object;
  container.mark = card.mark;
  switch(card.value){
    case 1:
      container.value = "A" 
      break;
    case 11:
      container.value = "J" 
      break;
    case 12:
      container.value = "Q" 
      break;
    case 13:
      container.value = "K" 
      break;
    default:
      container.value = String(card.value);
      break;
  }
  return container;
});


// 計算用カード
const calculateCards = decks.map(card => {
  const temp = new Array();
  const isOverTen = card.value >= 10;
  isOverTen ? temp.value = 10: temp.value = card.value;
  return temp;
});


// 所持カード
const userCards = new Array;
const userDisplayCards = new Array;
const userCalculateCards = new Array;
const dealerCards = new Array;
const dealerDisplayCards = new Array;
const dealerCalculateCards = new Array;

// game over フラグ
let gameOver = false;
let nowScore = 0;

// 山札の何枚目か
let n = 0;
let stop = false;

// ヒット処理 
function drawCard(isUser) {
  $("#hit").on('click', () => {
    choiceCard(n, isUser);
    gameArea_ctx.clearRect(750, 0, 900, 150);
    gameArea_ctx.fillText(`現在のあなたの得点は、${calculate(true)} 点です。` , 750, 100);
    gameArea_ctx.fillText(`カードを引きますか？` , 750, 120);
    if( isOver(true) ) {
      Object.seal(userCards);
      Object.seal(dealerCards);
      gameArea_ctx.clearRect(750, 0, 900, 150);
      gameArea_ctx.fillText(`現在のあなたの得点は、${calculate(true)} 点です。` , 750, 100);
      gameArea_ctx.fillText(`21点を超えたのであなたの負けです` , 750, 120);
    }
  });
}

// スタンド処理
function stopCard() {
  return new Promise(resolve => {
    $("#stand").on('click', () => {
      Object.seal(userCards);
      resolve();
    });
  })
}

// バーストしたか判定する
function isOver(isUser) {
  if(calculate(isUser) > 21){
    return true;
  } 
}




function dealerTurn() {
    gameArea_ctx.clearRect(750, 0, 900, 150);
    gameArea_ctx.fillText(`ディーラーの番です。` , 750, 100);
    gameArea_ctx.fillText(`現在ディーラーの得点は、${calculate(false)}点です。` , 750, 120);

  while(calculate(false) < 17) {
    choiceCard(n, false);
    drawDelerSecondImage();
    gameArea_ctx.clearRect(750, 0, 900, 150);
    gameArea_ctx.fillText(`ディーラーの番です。` , 750, 100);
    gameArea_ctx.fillText(`現在ディーラーの得点は、${calculate(false)}点です。` , 750, 120);
  }
  if( isOver(false)){
    gameArea_ctx.clearRect(750, 0, 900, 150);
    gameArea_ctx.fillText(`ディーラーの得点は、${calculate(false)}点です。` , 750, 100);
    gameArea_ctx.fillText(`あなたの勝ちです。` , 750, 120);
  }
}

// main 部分
async function main(){
  // 初期値
  choiceCard(n, true);
  choiceCard(n, true);
  choiceCard(n, false);
  choiceCard(n, false);

  // your turn
  gameArea_ctx.fillText(`現在のあなたの得点は、${calculate(true)} 点です。` , 750, 100);
  gameArea_ctx.fillText(`カードを引きますか？` , 750, 120);
  drawCard(true);
  await stopCard();

  //TODO ディーラー処理
  if(!isOver(true)){
    drawDelerSecondImage();
    dealerTurn();
  }

  // TODO 勝負
  if (!isOver(false)) {
    setTimeout(() => {
      compareCard();
    }, 2000);
  }
}

main();

function drawDelerSecondImage() {
  const dealerSecond = new Image();
  dealerSecond.src = `./trump-image/${dealerCards[1].mark}${dealerCards[1].value}.png`;
  dealerSecond.onload = () =>{
    gameArea_ctx.drawImage(dealerSecond, 150 + 500, 280, dx/7, dy/7);
  } 
}

function compareCard() {
  gameArea_ctx.clearRect(750, 0, 900, 150);
  gameArea_ctx.fillText(`ディーラーの得点は、${calculate(false)}点です。` , 750, 100);
  gameArea_ctx.fillText(`あなたの得点は、${calculate(true)}点です。` , 750, 120);

  if(calculate(true) > calculate(false)){
    gameArea_ctx.fillText(`あなたの勝ちです。` , 750, 140);
  }else if(calculate(true) < calculate(false)){
    gameArea_ctx.fillText(`あなたの負けです。` , 750, 140);
  }else  {
    gameArea_ctx.fillText(`引き分けです` , 750, 140);
  }
}
    


// 点数計算
function calculate(isUser) {
  nowScore = 0;
  if(isUser) {
    userCalculateCards.forEach(card => {
      nowScore += card.value;
    });
    if(nowScore > 21) {gameOver = true};
  } else {
    dealerCalculateCards.forEach(card => {
      nowScore += card.value;
    });
  }
  return nowScore;
}

// カード選択
function choiceCard(i, isUser) {
  if(isUser) {
    userCards.push(decks[i]);
    userDisplayCards.push(displayCards[i]);
    userCalculateCards.push(calculateCards[i]);
  } else {
    dealerCards.push(decks[i]);
    dealerDisplayCards.push(displayCards[i]);
    dealerCalculateCards.push(calculateCards[i]);
  }
  createImage(isUser);
  n ++;
}


