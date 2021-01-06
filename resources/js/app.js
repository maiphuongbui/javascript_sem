/*** DEFINICE PROMĚNNÝCH ***/

/*seznam karet*/
let cards = [];
let cards_default = ["ion-social-octocat", "ion-android-bar", "ion-ios-paw", "ion-ios-nutrition", "ion-ios-rose", "ion-ios-game-controller-b", "ion-umbrella", "ion-planet", "ion-social-octocat", "ion-android-bar", "ion-ios-paw", "ion-ios-nutrition", "ion-ios-rose", "ion-ios-game-controller-b", "ion-umbrella", "ion-planet"];
let card_values = [];  //sem se bude ukládat hodnota karty
let card_val_id = []; //sem se ukládají id otočených karet
let cards_flipped = 0; //počet otočených karet, aby se vědělo, kdy hra skončí

// počet odehraných kroků hráče
let p1_moves = 0;
let p2_moves = 0;
let p3_moves = 0;
let p4_moves = 0;

let moves = [];
moves.push(p1_moves);
moves.push(p2_moves);
moves.push(p3_moves);
moves.push(p4_moves);


//výše skóre hráče
let p1_score = 0;
let p2_score = 0;
let p3_score = 0;
let p4_score = 0;

let score = [];
score.push(p1_score);
score.push(p2_score);
score.push(p3_score);
score.push(p4_score);

const close_icon = document.getElementById('close');

$(document).ready(function () {

    sessionStorage.clear();


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
        let players = parseInt($(this).text());
        let formNumber = '';

        sessionStorage.playersCnt = JSON.stringify(players);

        for (let i = 0; i < players; i++) {
            formNumber += '<div class="form-container"><label for="playerName">Player Name:</label> <input class="form-detail" type="text" id="player' + i + '"></div>';
        }

        $('#playerForm>div').html(formNumber);
    });

    $('#playerForm #play').click(function (e) {
        e.preventDefault();
        const players = parseInt(JSON.parse(sessionStorage.playersCnt));

        console.log('players: ' + players);


        // nahrání zapsaných jmen do jednotlivých player-containers


        let nameOutput = '';
        for (let i = 0; i < players; i++) {
            nameOutput += '<div id="p' + i + '"><h2>Name:' + document.getElementById('player' + i) + '</h2><p>Move(s):' + '</p><p>Score:' + ' </p></div>';
        }
        $('#player-container>div').html(nameOutput);

        console.log($('#player-container>div').html(nameOutput));




        hidePeople();
        newGame();

    });
});


/*** NOVÁ HRA ***/

/*1 hráč*/


function newGame() {

    cards_flipped = 0;
    p1_moves = 0;
    p1_score = 0;
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

/*1PLAYER HERNÍ SYSTÉM*/

function memoryTurnCard(card, val) {
    if (canTurnCard(card)) {                   //sekvence se spustí jen, když počet otočených karet je < 2
        turnCard(card, val);
        if (areNoCardsTurned()) {
            setCardAsTurned(card, val);
        }
        else if (isOneCardTurned()) {
            setCardAsTurned(card, val);
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
function showScoreBoard(){
    $('#popup4').removeClass('hidden');
 
}

function hideScoreBoard() {
    $('#popup4').addClass('hidden');
}

function closerScoreBoard() {
    $('#close2').click(function(){
        hideScoreBoard();
    });
}

function cardSize() {
    if (cards.length === 16) {
        $('#gameBoard').children().css({ "width": "200px", "height": "200px" });
    }
    else if (cards.length === 36) {
        $('#gameBoard').children().css({ "width": "150px", "height": "150px" });
    }
    else {
        $('#gameBoard').children().css({ "width": "100px", "height": "100px" });
    }
};