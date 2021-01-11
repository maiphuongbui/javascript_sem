/*** DEFINICE PROMĚNNÝCH ***/

/*seznam karet*/
let cards = [];
let cards_default = ["ion-social-octocat", "ion-android-bar", "ion-ios-paw", "ion-ios-nutrition", "ion-ios-rose", "ion-ios-game-controller-b", "ion-umbrella", "ion-planet", "ion-social-octocat", "ion-android-bar", "ion-ios-paw", "ion-ios-nutrition", "ion-ios-rose", "ion-ios-game-controller-b", "ion-umbrella", "ion-planet"];
let card_values = [];  //sem se bude ukládat hodnota karty
let card_val_id = []; //sem se ukládají id otočených karet
let cards_flipped = 0; //počet otočených karet, aby se vědělo, kdy hra skončí

let player_count; //počet hráčů

// počet odehraných kroků hráčů
let player_moves;

//výše skóre hráčů
let player_scores;

// číslo tahu
let turn_count;

const close_icon = document.getElementById('close');

$(document).ready(function () {
    // při každém načtení stránky se stane následující


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

            formNumber += '<div class="form-container"><label for="playerName">Player Name:</label> <input class="form-detail" type="text" id="player' + i + '"/></div>';

        }


        $('#playerForm>div').html(formNumber);
    });

    $('#playerForm #play').click(function (e) {
        e.preventDefault();

        // nahrání zapsaných jmen do jednotlivých player-containers
        let nameOutput = '';
        for (let i = 0; i < player_count; i++) {
            nameOutput += '<div id="p' + i + '"><h2>Name: <span class="name' + i + '">' + document.getElementById('player' + i).value + '</span></h2><p>Moves: <span class="moves' + i + '">0</span></p><p>Score: <span class="score' + i + '">0</span></p></div>';

            if (document.getElementById('player' + i).value == "") {
                alert("Name must be filled out");
                return false;
            }

        }

        $('#player-container').html(nameOutput);


        if ($('.list-item').hasClass('selected')) {
            hidePeople();
            newGame();
        } else {
            alert("You have to choose number of players!")
        }


    });

    // funkce na tlačítko restart
    $('#restart').click(function () {
        $('#gameBoard').html("");
        $('#playerForm>div').html("");
        $('#player-container').html("");
        showBoardSize();
        cards = [];
    });

    //funkce na tlačíko highscore board
    $('.highscore-board').click(function (e) {
        e.preventDefault();
        showScoreBoard();
        closerScoreBoard();
    });
});


/*** NOVÁ HRA ***/

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
    // nastavení čísla tahu
    turn_count = 0;
    $("#p0").addClass("onTurn"); // označení hráče 1, že je na tahu
    document.getElementById('gameBoard').innerHTML = output;
    cardSize();

    if (!retrievedScores) {
        retrievedScores = JSON.parse('[]');
    }
    else {
        retrievedScores = JSON.parse(localStorage.getItem('highscore'));
        getHighScoreBoard();

    }
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

                // zjistit, kdo udělal tento tah
                const player_on_turn = turn_count % player_count;
                const player_on_next_turn = (turn_count + 1) % player_count; // kvůli CSS určit kdo bude další na tahu


                setCardAsTurned(card, val);
                moveCounter(player_on_turn);
                $("#p" + player_on_turn).removeClass("onTurn");
                $("#p" + player_on_next_turn).addClass("onTurn");
                turn_count++;

                if (areCardsMatching()) { // otočily se dvě stejné karty
                    matchCards();
                    scoreCounter(player_on_turn);
                    if (isGameOver()) {
                        gameOver();
                    }
                } else { // otočily se dvě různé karty
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

    // počítání odehraných kroků hráčů
    // player = index hráče v poli player_moves

    function moveCounter(player) {
        $('.moves' + player).html(++player_moves[player]);
    }

    // počítání skóre hráčů
    function scoreCounter(player) {
        player_scores[player] += 10;
        $('.score' + player).html(player_scores[player]);
    }

    // kontrola, zda už je konec hry
    function isGameOver() {
        return cards_flipped == cards.length;
    }

    // je konec hry
    function gameOver() {

        // pole bude obsahovat informace o name, score, moves jednotlvých hráčů
        let gameResults = [];
        let scoreBoard = [];


        // pro každého hráče, co se účastnil hry potřebuju získat jeho jméno, skóre a počet tahů
        for (let i = 0; i < player_count; i++) {
            let playerResult = [];
            let highScoreResult = {};
            playerResult.playerName = $('.name' + i).html();
            playerResult.score = parseInt($('.score' + i).html());
            playerResult.moves = parseInt($('.moves' + i).html());
            gameResults.push(playerResult); // vložím pole do pole

            highScoreResult.playerName = $('.name' + i).html();
            highScoreResult.score = parseInt($('.score' + i).html());
            scoreBoard.push(highScoreResult);
        }

        // doplnění příslušného name/moves/score výherce do congrats popupu
        let winner = sortedHighscore(gameResults);
        let winnerName = winner[0].playerName;
        let winnerMoves = winner[0].moves;
        let winnerScore = winner[0].score;

        $('#playerName').html(winnerName);
        $('#finalScore').html(winnerScore);
        $('#finalMove').html(winnerMoves);

        showEndGame();

        scoreBoard.sort((a, b) => b.score - a.score);

        console.log(scoreBoard);

        let savedScores = JSON.parse(localStorage.getItem('highscore'));  // zavolám si hodnoty z localStorage
        let highscores = scoreBoard;

        if (!savedScores) { // v případě, že v localStorage ještě žádné hodnoty v highscore nejsou se vytvoří prázdné pole

            savedScores = JSON.parse('[]');
            savedScores.push(highscores);

        }

        else {

            // spojení dosavadního pole v localStorage s novým polem s novými výsledky, odstranění duplicit podle jména hráče
            let set = new Set();
            let mergedArray = [...savedScores, ...scoreBoard];
            highscores = mergedArray.filter(item => {
                if (!set.has(item.playerName)) {
                    set.add(item.playerName);
                    return true;
                }
                return false;
            }, set);
            highscores.sort((a, b) => b.score - a.score);
            highscores.splice(5);
            console.log(highscores);

        }

        localStorage.setItem('highscore', JSON.stringify(highscores));  // nahrání nových hodnot do localStorage

        retrievedScores = JSON.parse(localStorage.getItem('highscore'));
        getHighScoreBoard();


        document.getElementById('gameBoard').innerHTML = "";
        cards = [];
        closeModal();
        closerScoreBoard();
        playAgain();
    }

    // sem se uloží hodnoty z localStorage
    let retrievedScores;


    //funkce pro nahrání hodnot z localStorage do tabulky
    function getHighScoreBoard() {
        let scoreList = '';
        for (var j = 0; j < retrievedScores.length; j++) {

            scoreList += '<tr><td>' + retrievedScores[j].playerName + '</td><td>' + retrievedScores[j].score + '</td></tr>';
        }

        $('#scoreboard').html(scoreList);

    }


    function sortedHighscore(gameResults) {

        // vytvořím si kopii, kterou budu seřazovat
        let sortedGameResults = Array.from(gameResults);

        sortedGameResults.sort(function (a, b) {
            if (a.score === b.score) {
                // pokud je skóre stejný u dvou hráčů, vyhrává ten, kdo má menší počet kroků
                return a.moves - b.moves;
            }
            return b.score - a.score; // seřazení sestupně
        });

        return sortedGameResults;


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
            $('#playerForm>div').html("");
            $('#player-container').html("");
            showBoardSize();
            cards = [];
        });
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
        $('#16cards').addClass('selected');
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
        if (cards.length <= 16) {
            $('#gameBoard').children().css({ "width": "200px", "height": "200px" });
        } else if (cards.length === 36) {
            $('#gameBoard').children().css({ "width": "150px", "height": "150px" });
        } else {
            $('#gameBoard').children().css({ "width": "100px", "height": "100px" });
        }
    };
