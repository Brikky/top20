//To Do:
//store score in local memory
//include download/play/buy button

function shake(elementID) {
    var div = document.getElementById(elementID);
    var interval = 100;
    var distance = 10;
    var times = 4;

    $(div).css('position', 'relative');

    for (var iter = 0; iter < (times + 1); iter++) {
        $(div).animate({
            left: ((iter % 2 == 0 ? distance : distance * -1))
        }, interval);
    }
    $(div).animate({
        left: 0
    }, interval);
}

function bounce(elementID) {
    var div = document.getElementById(elementID);
    var interval = 100;
    var distance = 10;
    var times = 4;

    $(div).css('position', 'relative');

    for (var iter = 0; iter < (times + 1); iter++) {
        $(div).animate({
            top: ((iter % 2 == 0 ? distance : distance * -1))
        }, interval);
    }
    $(div).animate({
        top: 0
    }, interval);
}

//Song Constructor
function Song(options) {
    this.name = options.name; //string
    this.preview_url = options.url || options.preview_url; //string url
};

//Player Constructor
function Player(name = "") {
    this.name = name;
    this.guess = "";
    this.score = 0;
};

//Game Constructor
function Game(playerObjectArray, songObjectArray) {
    this.roundCount = 0;
    this.roundStart = $.now() / 1000;
    this.roundTime = 0;
    this.players = playerObjectArray || [];
    this.songs = songObjectArray || [];
    this.winStatements = ["You got it!",
        "Watch out, Adele!",
        "I thought it was The Beatles...",
        "Keep it going!",
        "Highest score EVER?",
        "Lightning Round!",
        "That's my favorite song!",
        "Rockstar!",
        "Notice me Senpai.",
        "Call 911! 'Cuz you are on FIRE",
        "You're my hero.",
        "Making Beyonce proud!",
        "Grand Prize!",
        "That one took me a second.",
        "OK. But can you get the next one?",
        "I bet you make babies smile.",
        "Stylin'!",
        "DANCE BREAK",
        "Me 'What's your number?' You: 'Number 1.'",
        "Annie are you OK?!" //20
    ]
};

//GAME METHODS
Game.prototype.currentPlayer = function() {
    return this.players[this.roundCount % this.players.length];
}

//Returns the win statement for current round
//Note: game.roundCount should be iterated to get the next item
Game.prototype.currentWinStatement = function() {
    return this.winStatements[this.roundCount % this.winStatements.length];
}

//Returns the song for current round
//Note: game.roundCount should be iterated to get the next item
Game.prototype.currentSong = function() {
    return this.songs[this.roundCount % this.songs.length];
}

//Returns the song name for current round
//Note: game.roundCount should be iterated to get the next item
Game.prototype.currentSongName = function() {
    return this.currentSong()["name"];
}

//Cleans up player's guess and song name and searches for name in guess
Game.prototype.checkGuess = function() {
    if (this.players.length > 0) {
        var cleanedSong = (this.currentSongName()).replace(/\s*\(.*?\)\s*/g, '')
        //removes secondary song titles in parenthesis
        cleanedSong = (cleanedSong).replace(/[^\w\s]|_/g, "");
        var cleanedGuess = ($('#song-guess').val()).replace(/[^\w\s]|_/g, "");
        //removes punctuation
        cleanedSong = cleanedSong.replace(/feat.*$/g, "");
        //removes anything after "feat. "
        cleanedSong = cleanedSong.trim();
        //removes leading and trailing whitespace
        return (new RegExp(cleanedSong, "i").test(cleanedGuess));
        //ignores case
    }
}

//Checks if final song has been reached
Game.prototype.checkEnd = function() {
    return this.roundCount == this.songs.length && this.roundCount > 0;
}

//Ends game if final song has been reached, updates view
Game.prototype.endGame = function() {
    if (this.checkEnd()) {
        $("#song-name").html(this.currentWinStatement());
        $("#song-element").attr("src", "#");
        $("#song-guess").hide();
        $("#restart").show();
        $("#visualizer").hide();
        clearInterval(endInterval);
        clearInterval(timeInterval);
    }
}

//Handles logic for one 30 second round
//While there is at least one player, check the guess on keyup
//the window has an interval to check if the timer has expired
//which prevents the user from getting stuck if they don't know
//the song and don't press any keys
Game.prototype.handleRound = function() {
    if (this.players.length > 0) {
        this.roundTime = $.now() / 1000 - this.roundStart;
        if (this.checkGuess() && this.roundTime <= 30.0) {
            (this.currentPlayer()).incrementScore(); //WINNER
            $("#song-name").html(this.currentWinStatement());
            bounce("song-name");
            this.newRound();
        } else if (this.roundTime > 30.0) {
            this.newRound();
        }
    }
}

//Iterates the song and game.roundCount, resetting timer
//updates view
Game.prototype.newRound = function() {
    this.roundCount++;
    this.roundStart = $.now() / 1000;
    $("#song-guess").val("");
    $("#song-element").attr("src", myGame.currentSong()["preview_url"]);

};

//updates view to pre-game state, initalizes player
Game.prototype.prepareGame = function() {
    this.players.push(new Player($("#song-guess").val()));
    this.winStatements = this.winStatements.shuffle();
    $("#start").hide();
    $("#song-guess").val("");
    $("#song-guess").focus();
    $("#song-guess").attr("placeholder", "guess the song name");
    this.songs = this.songs.shuffle();
    $("#song-element").attr("src", this.currentSong()["preview_url"]);
    $("#visualizer").show();
    this.roundStart = $.now() / 1000;
    $("#song-name").html("You have 30 seconds for each song.");
}

//background function to check if time has exceeded 30 second allotment
Game.prototype.checkTime = function() {
    if (this.players.length > 0 && $.now() / 1000 - this.roundStart > 30.0) {
        $("#song-name").html("You missed '" + this.currentSongName() + "'");
        shake("song-name");
        this.newRound();
    }
    if (this.players.length > 0 && $.now() / 1000 - this.roundStart > 25) {
        $("#song-name").html(30 - Math.trunc($.now() / 1000 - this.roundStart));
    }
}

//PLAYER METHODS
//Increments player.score and updates view
Player.prototype.incrementScore = function() {
    this.score++;
    $('#score-value').html(this.score);
}

//Array method to shuffle items using built in RNG
//Fisher-Yates (Knuth) Shuffle
Array.prototype.shuffle = function() {
    var currentIndex = this.length,
        temporaryValue, randomIndex;

    //until shuffled
    while (0 !== currentIndex) {

        //randomly grab an element
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        //swap grabbed element with current element
        temporaryValue = this[currentIndex];
        this[currentIndex] = this[randomIndex];
        this[randomIndex] = temporaryValue;
    }

    return this;
}

//#########################################################
//################# ___ ___ ___ ___ _  _###################
//################ | _ ) __/ __|_ _| \| |##################
//################ | _ \ _| (_ || || .` |##################
//################ |___/___\___|___|_|\_|##################
//#########################################################

var myGame = new Game();
$.ajax({
        type: "GET",
        url: "https://api.spotify.com/v1/search?q=year:2016&type=track",
        success: function(spotifyJSON) {
            myGame.songs = spotifyJSON.tracks.items;
        }
    })
    //Returns                    Data Type
    //Object                   Object
    //|->Tracks                Object
    //|-->items                Array
    //|--->[0-20]              Object
    //|---->name               String (*Song Name)
    //|---->preview_url        String (*30 second clip)

//Hide graphics that are used later
$("#visualizer").hide();
$("#restart").hide();

//Set background processes to check for user loss by timeout and by progression
//This makes both of these processes occur independantly of user input despite
//the game relying on event listeners for instantiation and winning progression
var timeInterval = setInterval(myGame.checkTime.bind(myGame), 100);
var endInterval = setInterval(myGame.endGame.bind(myGame), 100);


$(document).ready(function() {
    //Event listeners to begin game, play game, and restart game
    $("#start").on("click touchstart", myGame.prepareGame.bind(myGame));
    $(document).on('keyup', myGame.handleRound.bind(myGame));
    $("#restart").on("click touchstart", function() {
        window.location.reload();
    });


    //
    //PLAY HERE
    //

    //</>PLAYGROUND

});
