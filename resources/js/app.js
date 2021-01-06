/*** DEFINICE PROMĚNNÝCH ***/

/*seznam karet*/
let cards = [];
let cards_default = ["ion-ios-game-controller-b", "ion-umbrella", "ion-planet", "ion-ios-game-controller-b", "ion-umbrella", "ion-planet"];
let card_values = [];  //sem se bude ukládat hodnota karty
let card_val_id = []; //sem se ukládají id otočených karet
let cards_flipped = 0; //počet otočených karet, aby se vědělo, kdy hra skončí

let player_count;

// počet odehraných kroků hráče
let player_moves;

//výše skóre hráče
let player_scores;

let turn_count;

const close_icon = document.getElementById('close');

$(document).ready(function () {
    // pri kazdym nacteni stranky


  showBoardSize();

  /*výběr velikosti karetní sady*/

  $('#16cards').click(function (data) {
    $(this).parent().children().removeClass('selected');
    $(this).addClass('selected');
    cards = [];
    $.getJSON('small.json', function (data) {
      JSON.stringify(data);
      cards = data;

    });
  })


  $('#36cards').click(function (data) {
    $(this).parent().children().removeClass('selected');
    $(this).addClass('selected');
    cards = [];
    $.getJSON('medium.json', function (data) {
      JSON.stringify(data);
      cards = data;

    });


  });

  $('#64cards').click(function (data) {
    $(this).parent().children().removeClass('selected');
    $(this).addClass('selected');
    cards = [];
    $.getJSON('large.json', function (data) {
      JSON.stringify(data);
      cards = data;

    });

  });

  $('#next').click(function (e) {
    e.preventDefault();
    hideBoardSize();
    showPeople();


  });


  /* POČET HRÁČŮ*/
  //zobrazení příslušný počet textových polí na jméno při kliknutí
  $('.list-item').click(function () {
    $(this).parent().children().removeClass('selected');
    $(this).addClass('selected');
    player_count = parseInt($(this).text());
    let formNumber = '';

    for (let i = 0; i < player_count; i++) {
      formNumber += '<div class="form-container"><label for="playerName">Player Name:</label> <input class="form-detail" type="text" id="player' + i + '"></div>';
    }

    $('#playerForm>div').html(formNumber);
  });

  $('#playerForm #play').click(function (e) {
    e.preventDefault();

    // nahrání zapsaných jmen do jednotlivých player-containers
    let nameOutput = '';
    for (let i = 0; i < player_count; i++) {
      nameOutput += '<div id="p' + i + '"><h2>Name: <span class="name'+ i +'">' + document.getElementById('player' + i).value + '</span></h2><p>Moves: <span class="moves' + i + '">0</span></p><p>Score: <span class="score' + i + '">0</span></p></div>';
    }

    $('#player-container').html(nameOutput);

    hidePeople();
    newGame();

  });
});


/*** NOVÁ HRA ***/

/*1 hráč*/


function newGame() {

  cards_flipped = 0;

  player_scores = new Array(4).fill(0);
  player_moves = new Array(4).fill(0);

  let output = '';
  // pokud hráč nevybere žádnou velikost pole, automaticky se spustí 4x4 varianta
  if (cards.length === 0) {
    cards = cards_default;
  }
  document.getElementById('gameBoard').innerHTML = "";
  const shuffledCards = shuffle(cards);

  for (let i = 0; i < cards.length; i++) {
    output += '<div id="card' + i + '" onclick="memoryTurnCard(this,\'' + cards[i] + '\')"></div>';
  }

  turn_count = 0;
  $("#p0").addClass("onTurn"); // oznaci se 1. hrac jako ze je na tahu
  document.getElementById('gameBoard').innerHTML = output;
  cardSize();
  restartGame();
  $('.highscore-board').click(function (e) {
    e.preventDefault();
    showScoreBoard();
    closerScoreBoard();
  });
};


/* ZAMÍCHÁNÍ KARET V POLI*/
function shuffle(cards) {
  let currentIndex = cards.length, temporaryVal, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryVal = cards[currentIndex];
    cards[currentIndex] = cards[randomIndex];
    cards[randomIndex] = temporaryVal;
  }
}

/*HERNÍ SYSTÉM*/
function memoryTurnCard(card, val) {
  if (canTurnCard(card)) {                   //sekvence se spustí jen, když počet otočených karet je < 2
    turnCard(card, val);
    if (areNoCardsTurned()) {
      setCardAsTurned(card, val);
    } else if (isOneCardTurned()) {

      // zjistit, kdo udelal tento tah
      const player_on_turn = turn_count % player_count; // 1..n % 0 = 0   1..n % 4 = 0, 1, 2, 3, 0, 1, 2, 3, ...
      const player_on_next_turn = (turn_count + 1) % player_count;

      // pocet tahu - pocet hracu - jaky hrac odehral tah
      // 0 - 4 - 0
      // 1 - 4 - 1
      // 2 - 4 - 2
      // ...
      // 5 - 4 - 0
      // 6 - 4 - 1
      // ...
      // n % 4 - ???

      setCardAsTurned(card, val);
      moveCounter(player_on_turn);
      $("#p" + player_on_turn).removeClass("onTurn");
      $("#p" + player_on_next_turn).addClass("onTurn");
      turn_count++;

      if (areCardsMatching()) { // otocily se dve stejne karty
        matchCards();
        scoreCounter(player_on_turn);
        if (isGameOver()) {
          gameOver();
        }
      } else { // otocily se dve ruzne karty
        noCardsMatch();
      }
    }
  }
}

// kontrola, že počet otočených karet je < 2
function canTurnCard(card) {
  return card.innerHTML === "" && card_values.length < 2;
}

// kontrola, že počet otočených karet je 0
function areNoCardsTurned() {
  return card_values.length === 0;
}

// kontrola, že počet otočených karet je 1
function isOneCardTurned() {
  return card_values.length === 1;
}

// otočení karty

function turnCard(card, val) {
  card.style.background = 'none';
  card.innerHTML = '<div class="icons"><i class="' + val + '"></i></div>';
}

// uložení otočené karty do pole pro další porovnání
function setCardAsTurned(card, val) {
  card_values.push(val);
  card_val_id.push(card.id);
}

// je shoda karet?

function areCardsMatching() {
  return card_values[0] === card_values[1];
}

// funkce pro shodné karty, dojde k přičtení 2 políček, vymažou se hodnoty z pole

function matchCards() {
  cards_flipped += 2;
  card_values = [];
  card_val_id = [];
}

// když karty nesedí
function noCardsMatch() {
  setTimeout(turnCardBack, 500);
}

//otočení karet zpět na zadní stranu

function turnCardBack() {
  let card_1 = document.getElementById(card_val_id[0]);
  let card_2 = document.getElementById(card_val_id[1]);
  card_1.style.background = '#67313f';
  card_1.innerHTML = "";
  card_2.style.background = '#67313f';
  card_2.innerHTML = "";
  card_values = [];
  card_val_id = [];
}

// počítání odehraných kroků hráče
// player ... index hrace v poli player_moves
// player_moves.length == 4
// 0, 1, 2, 3
// hrac na tahu, u ktereho se inkrementuje
function moveCounter(player) {
  $('.moves' + player).html(++player_moves[player]);
}

// počítání skóre hráče
function scoreCounter(player) {
  player_scores[player] += 10;
  $('.score' + player).html(player_scores[player]);
}

// kontrola, zda už je konec hry
function isGameOver() {
  return cards_flipped == cards.length;
}

function getSortedGameResultsByScore(gameResults) {

  // vytvorim si kopii, kterou budu serazovat
  const sortedGameResults = Array.from(gameResults);

  sortedGameResults.sort(function(a, b) {
    return a[0].score > b[0].score; // COMPARE
  });

  return sortedGameResults;
}

// je konec hry
function gameOver() {

  const gameResults = new Array();
  // ... name, score, moves

  // pro kazdeho hrace, co se ucastnil hry potrebuji ziskat jeho jmeno, skore a pocet tahu
    for (let i = 0; i < player_count; i++) {
      const playerResult = new Array();
      playerResult.name = $('.name' + i).html();
      playerResult.score = parseInt($('.score' + i).html());
      playerResult.moves = parseInt($('.moves' + i).html());
      gameResults.push(playerResult);

      // playerResults  array
      // playerResults.score
    }

    // gameResults[0].score 


  console.info(gameResults);
  console.info(getSortedGameResultsByScore(gameResults));

  showEndGame();
  document.getElementById('gameBoard').innerHTML = "";
  closeModal();
  closerScoreBoard();
  playAgain();
}

function closeModal() {
  $('#close').click(function () {
    hideEndGame();
    showBoardSize();
  });
}

function playAgain() {
  $('#play-again').click(function (e) {
    e.preventDefault();
    hideEndGame();
    showBoardSize();
  });
}

function restartGame() {
  $('#restart').click(function () {
    document.getElementById('gameBoard').innerHTML = "";
    showBoardSize();
  })
}

/* POP-UP WINDOWS*/

function showPeople() {
  $('#popup2').removeClass('hidden');
  $('.list').children().removeClass('selected');
};

function hidePeople() {
  $('#popup2').addClass('hidden');
};

function showBoardSize() {
  $('#popup3').removeClass('hidden');
  $('.list').children().removeClass('selected');
};

function hideBoardSize() {
  $('#popup3').addClass('hidden');
};

function showEndGame() {
  $('#popup1').removeClass('hidden');
};

function hideEndGame() {
  $('#popup1').addClass('hidden');
};

function showScoreBoard() {
  $('#popup4').removeClass('hidden');

}

function hideScoreBoard() {
  $('#popup4').addClass('hidden');
}

function closerScoreBoard() {
  $('#close2').click(function () {
    hideScoreBoard();
  });
}

function cardSize() {
  if (cards.length === 16) {
    $('#gameBoard').children().css({"width": "200px", "height": "200px"});
  } else if (cards.length === 36) {
    $('#gameBoard').children().css({"width": "150px", "height": "150px"});
  } else {
    $('#gameBoard').children().css({"width": "100px", "height": "100px"});
  }
};
