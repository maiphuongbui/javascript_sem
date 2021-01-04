/*** DEFINICE PROMĚNNÝCH ***/

/*seznam karet*/
let cards = [];
let card_values = [];  //sem se bude ukládat hodnota karty
let card_val_id = []; //sem se ukládají id otočených karet
let cards_flipped = 0; //počet otočených karet, aby se vědělo, kdy hra skončí

// počet odehraných kroků hráče
let p1_moves = 0;

//výše skóre hráče
let p1_score = 0;


$(document).ready(function () {
  sessionStorage.clear();
  // showPeople();
  /* POČET HRÁČŮ*/
  //zobrazení příslušný počet textových polí na jméno při kliknutí
  $('.list-item').click(function () {
    $(this).parent().children().removeClass('selected');
    $(this).addClass('selected');
    const players = parseInt($(this).text());
    let formNumber = '';

    sessionStorage.playersCnt = JSON.stringify(players);

    for (let i = 0; i < players; i++) {
      formNumber += '<div class="form-container"><label for="playerName">Player Name:</label> <input class="form-detail" type="text" id="player-' + i + '"></div>';
    }

    $('#playerForm>div').html(formNumber);
  });

  $('#playerForm #play').click(function (e) {
    e.preventDefault();
    const players = parseInt(JSON.parse(sessionStorage.playersCnt));

    console.log('players: ' + players);
  });
  showBoardSize();

  /*výběr velikosti karetní sady*/

$('#16cards').click(function() {
    cards = [];
    $.getJSON("small.json", function(result){
        cards.push(result);
    })
    
    console.log(cards);
    
});

 $('#36cards').click(function() {
    cards = [];
    $.getJSON("medium.json", function(result){
        cards.push(result);
    })
    
    console.log(cards);
    
});

 $('#64cards').click(function() {
    cards = [];
    $.getJSON("large.json", function(result){
        JSON.stringify(result);
        cards.push(result);
    })
    
    console.log(cards);
}); 


});



/*** NOVÁ HRA ***/

/*1 hráč*/


function newGame() {
    cards_flipped = 0;
  p1_moves = 0;
  p1_score = 0;
  let output = '';
  document.getElementById('gameBoard').innerHTML= "";
  const shuffledCards = shuffle(cards);

  for (let i = 0; i < cards.length; i++) {
    output += '<div id="card' + i + '" onclick="memoryTurnCard(this,\'' + cards[i] + '\')"></div>';
  }
  document.getElementById('gameBoard').innerHTML = output;
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

/*1PLAYER HERNÍ SYSTÉM*/

function memoryTurnCard(card,val) {
 if (canTurnCard(card)) {                   //sekvence se spustí jen, když počet otočených karet je < 2
     turnCard(card,val);
     if(areNoCardsTurned()) {
         setCardAsTurned(card,val);
     }
     else if (isOneCardTurned()) {
         setCardAsTurned(card,val);
         p1MoveCounter();
         if (areCardsMatching()) {
             matchCards();
             p1ScoreCounter();
             if (isGameOver()) {
                 gameOver();
             }
            }
             else {
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

function turnCard(card,val) {
    card.style.background='none';
    card.innerHTML = '<div class="icons"><i class="' + val + '"></i></div>';
}

// uložení otočené karty do pole pro další porovnání
function setCardAsTurned(card,val) {
    card_values.push(val);
    card_val_id.push(card.id);
}

// je shoda karet?

function areCardsMatching() {
    return card_values[0] === card_values[1];
}

// funkce pro shodné karty, dojde k přičtení 2 políček, vymažou se hodnoty z pole

function matchCards() {
    cards_flipped +=2;
    card_values = [];
    card_val_id = [];
}

// když karty nesedí
function noCardsMatch() {
    setTimeout(turnCardBack,500);
   }

//otočení karet zpět na zadní stranu

function turnCardBack() {
let card_1 = document.getElementById(card_val_id[0]);
let card_2 = document.getElementById(card_val_id[1]);
card_1.style.background='#67313f';
card_1.innerHTML= "";
card_2.style.background='#67313f';
card_2.innerHTML= "";
card_values = [];
card_val_id = [];

}

// počítání odehraných kroků hráče

function p1MoveCounter() {
    p1_moves++;
    $('.moves').html(p1_moves);
}

// počítání skóre hráče

function p1ScoreCounter() {
p1_score += 10;
$('.score').html(p1_score);
}

// kontrola, zda už je konec hry

function isGameOver() {
    return cards_flipped == cards.length;
   }

// je konec hry

function gameOver() {
    showEndGame();
    document.getElementById('gameBoard').innerHTML= "";
    newGame();    
}



/* POP-UP WINDOWS*/

function showPeople() {
  $('#popup2').removeClass('hidden');
};

function hidePeople() {
  $('#popup2').addClass('hidden');
};

function showBoardSize() {
  $('#popup3').removeClass('hidden');
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
