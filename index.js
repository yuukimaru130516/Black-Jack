'use strict';

// canvas の読み込み
/* const gameArea = document.getElementById('game-area');
const gameArea_ctx = gameArea.getContext('2d');

gameArea_ctx.fillRect(0,0,100,100); */

// suffle メソッド
Array.prototype.shuffle = function() {
  this.sort(() => Math.random() - 0.5);
}

// デックの作成
const marks = ["♠", "♣", "♥", "♦"];
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


// ゲームの実装部分
function main () {
  console.log("★☆★☆★☆★☆ ブラックジャックへようこそ! ★☆★☆★☆★☆");
  console.log('ゲームを開始します');
  // 1 ターン目
  choiceCard(n, true);
  console.log('あなたの引いた1枚目のカードは' + userDisplayCards[n-1].mark + userDisplayCards[n-1].value + 'です。');
  choiceCard(n, true);
  console.log('あなたの引いた2枚目のカードは' + userDisplayCards[n-1].mark + userDisplayCards[n-1].value + 'です。');
  choiceCard(n, false);
  console.log('ディーラーの引いたカードは' + dealerDisplayCards[n-userCards.length - 1].mark + dealerDisplayCards[n-userCards.length - 1].value + 'です。');
  choiceCard(n, false);
  console.log('ディーラーの2枚目のカードは分かりません。');
  
  // ユーザからのキーボード入力を取得する Promise を生成する
  function readUserInput(question) {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      readline.question(question, (answer) => {
        resolve(answer);
        readline.close();
      });
    });
  }
  (async function stdout() {
    console.log(`現在のあなたの得点は、${calculate(true)} です。`);
    while(calculate(true) < 21 && stop === false && gameOver === false){
      const ques = await readUserInput('カードを引きますか?   y/n  ');
      if(ques === "y") {
        choiceCard(n, true);
        console.log(`あなたの引いた${n-dealerCards.length}枚目のカードは ${userDisplayCards[n-dealerCards.length-1].mark} ${userDisplayCards[n-dealerCards.length-1].value} です。`);
        console.log(`あなたの得点は、${calculate(true)} です`);
        if(gameOver === true){ 
          console.log('あなたの負けです' );
          return false;
       }
      }else if(ques === "n") {
        stop = true;
      }else {
        console.log('無効な入力です。');
      }
    }
    // TODO ディーラーの処理に移行
    console.log(`ディーラーの2枚目は、${dealerDisplayCards[1].mark} ${dealerDisplayCards[1].value} でした。`)
    console.log(`現在のディーラーの得点は、${calculate(false)} です。`);
    while(calculate(false) < 17) { 
      choiceCard(n, false);
      console.log(`ディーラーの引いた${n-userCards.length}枚目のカードは、${dealerDisplayCards[n-userCards.length-1].mark} ${dealerDisplayCards[n-userCards.length-1].value}`);
      console.log(`ディーラーの現在の得点は、${calculate(false)} 点です`);
    }
    
    // 勝負フェーズ
    if(calculate(true) > calculate(false)){
      console.log('あなたの勝ちです');
    }else if(calculate(true) < calculate(false)){
      console.log('あなたの負けです')
    }else {
      console.log('引き分けです')
    }
    
  })();
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
  n ++;
}

main();