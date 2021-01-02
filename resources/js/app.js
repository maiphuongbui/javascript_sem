/*** DEFINICE PROMĚNNÝCH ***/

/*seznam karet*/
const cards = ['ion-social-octocat', 'ion-social-snapchat', 'ion-android-plane', 'ion-android-star', 'ion-android-favorite', 'ion-android-bar', 'ion-android-car', 'ion-ios-paw', 'ion-ios-nutrition', 'ion-ios-rose', 'ion-ios-flower', 'ion-ios-lightbulb', 'ion-ios-tennisball', 'ion-ios-football', 'ion-ios-game-controller-b', 'ion-ios-americanfootball', 'ion-ios-bolt', 'ion-ios-cart', 'ion-ios-home', 'ion-umbrella', 'ion-planet', 'ion-university', 'ion-ribbon-b', 'ion-music-note', 'ion-bug', 'ion-beer', 'ion-pizza', 'ion-icecream', 'ion-coffee', 'ion-flag', 'ion-help-buoy', 'ion-camera', 'ion-social-octocat', 'ion-social-snapchat', 'ion-android-plane', 'ion-android-star', 'ion-android-favorite', 'ion-android-bar', 'ion-android-car', 'ion-ios-paw', 'ion-ios-nutrition', 'ion-ios-rose', 'ion-ios-flower', 'ion-ios-lightbulb', 'ion-ios-tennisball', 'ion-ios-football', 'ion-ios-game-controller-b', 'ion-ios-americanfootball', 'ion-ios-bolt', 'ion-ios-cart', 'ion-ios-home', 'ion-umbrella', 'ion-planet', 'ion-university', 'ion-ribbon-b', 'ion-music-note', 'ion-bug', 'ion-beer', 'ion-pizza', 'ion-icecream', 'ion-coffee', 'ion-flag', 'ion-help-buoy', 'ion-camera'];

/*počet otočení karet hráčů*/
var p1_flipped = 0;

$(document).ready(function () {
  sessionStorage.clear();
  showPeople();

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
});


/*výběr velikosti karetní sady*/


/*** NOVÁ HRA ***/

/*1 hráč*/


function newGame() {
  p1_flipped = 0;
  let output = '';
  const shuffledCards = shuffle(cards);

  for (let i = 0; i < cards.length; i++) {
    output += '<div class="card-"' + i + '" onclick="flipCard(this,\'' + cards[i] + '\')"></div>';
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

/*BASE HERNÍ SYSTÉM*/

// function flipCard()


/*



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
