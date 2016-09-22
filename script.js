//To Do:
//store score in local memory
//include download/play/buy button

function reload() {
    window.location.reload();
}

//animation functions
function shake(elementID) {
    var element = document.getElementById(elementID);
    var interval = 100;
    var distance = 10;
    var times = 4;

    this.$(element).css('position', 'relative');

    for (var i = 0; i < (times + 1); i++) {
        this.$(element).animate({
            left: ((i % 2 == 0 ? distance : distance * -1))
        }, interval);
    }
    this.$(element).animate({
        left: 0
    }, interval);
}

function bounce(elementID) {
    var element = document.getElementById(elementID);
    var interval = 100;
    var distance = 10;
    var times = 4;

    this.$(element).css('position', 'relative');

    for (var i = 0; i < (times + 1); i++) {
        this.$(element).animate({
            top: ((i % 2 == 0 ? distance : distance * -1))
        }, interval);
    }
    this.$(element).animate({
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
    this.$score_value = $("#score-value");
};

//Game Constructor
function Game(playerObjectArray, songObjectArray) {
    this.maxRoundLength = 30;
    this.roundCount = 0;
    this.roundStart = this.now();
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
    ].shuffle();

};

//GAME METHODS

Game.prototype.cacheDom = function() {
    this.$document = $(document);
    this.$display = this.$document.find("#display");
    this.$audio = this.$document.find("audio");
    this.$song_guess = this.$document.find("#song-guess");
    this.$start_button = this.$document.find("#start");
    this.$restart_button = this.$document.find("#restart");
    this.$visualizer = this.$document.find("#visualizer");
}

Game.prototype.currentPlayer = function() {
    return this.players[this.roundCount % this.players.length];
}

//Note: game.roundCount should be iterated to get the next item
Game.prototype.currentWinStatement = function() {
    return this.winStatements[this.roundCount % this.winStatements.length];
}

//Note: game.roundCount should be iterated to get the next item
Game.prototype.currentSong = function() {
    return this.songs[this.roundCount % this.songs.length];
}

//Note: game.roundCount should be iterated to get the next item
Game.prototype.currentSongName = function() {
    return this.currentSong()["name"];
}

Game.prototype.cleanString = function(string) {
    var cleanedString = string
        .replace(/\s*\(.*?\)\s*/g, '')
        //removes secondary song titles in parenthesis
        .replace(/[^\w\s]|_/g, "")
        //removes punctuation
        .replace(/feat.*this.$/g, "")
        //removes anything after "feat. "
    cleanedString.trim();
    //removes leading and trailing whitespace

    return cleanedString;
}

Game.prototype.checkGuess = function() {
    if (this.players.length > 0) {
        var cleanedSong = this.cleanString(this.currentSongName());
        var cleanedGuess = this.cleanString(this.$song_guess.val());

        console.log(cleanedSong);
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
        this.$display.html(this.currentWinStatement());
        this.$audio.attr("src", "#");
        this.$song_guess.hide();
        this.$visualizer.hide();
        this.$restart_button.show();
        clearInterval(endInterval);
        clearInterval(timeInterval);
        this.$restart_button.on("click touchstart", reload);
    }
}

Game.prototype.handleCorrect = function() {
    this.currentPlayer().incrementScore();
    this.$display.html(this.currentWinStatement());
    bounce("display");
}

Game.prototype.handleMissed = function() {
    this.$display.html("You missed '" + this.currentSongName() + "'");
    shake("display");
}

Game.prototype.handleRound = function() {
    this.roundTime = this.getRoundLength();
    if (this.checkGuess() && this.roundTime <= this.maxRoundLength) {
        this.handleCorrect();
        this.newRound();
    } else if (this.roundTime > this.maxRoundLength) {
        this.handleMissed();
        this.newRound();
    }
}

//Iterates the song and game.roundCount, resetting timer
//updates view
Game.prototype.newRound = function() {
    this.roundCount++;
    this.roundStart = this.now();
    this.$song_guess.val("");
    this.$audio.attr("src", this.currentSong()["preview_url"]);
};

//updates view to pre-game state, initalizes player
Game.prototype.beginGame = function() {
    this.$document.on('keyup', this.handleRound.bind(this));
    this.players.push(new Player(this.$song_guess.val()));
    this.$start_button.hide();
    this.$song_guess.val("");
    this.$song_guess.focus();
    this.$song_guess.attr("placeholder", "guess the song name");
    this.$audio.attr("src", this.currentSong()["preview_url"]);
    this.$visualizer.show();
    this.roundStart = this.now();
    this.$display.html("You have " + this.maxRoundLength + " seconds for each song.");
}

Game.prototype.initialize = function() {
    var Game = this;
    this.cacheDom();
    this.$start_button.on("click touchstart", this.beginGame.bind(this));
    this.$restart_button.hide();
    this.$visualizer.hide();
    var timeInterval = setInterval(this.checkTime.bind(this), 100);
    var endInterval = setInterval(this.endGame.bind(this), 100);
    $.ajax({
        type: "GET",
        url: "https://api.spotify.com/v1/search?q=year:2016&type=track",
        success: function(spotifyJSON) {
            Game.songs = spotifyJSON.tracks.items.shuffle();
        }
    })
}

Game.prototype.checkTime = function() {
    if (this.getRoundLength() > this.maxRoundLength) {
        this.handleMissed();
        this.newRound();
    }
    if (this.getRoundLength() > 25) {
        this.$display.html(this.maxRoundLength - Math.trunc(this.getRoundLength()));
    }
}

Game.prototype.now = function() {
    return $.now() / 1000;
}

Game.prototype.getRoundLength = function() {
    if (this.players.length > 0) {
        return this.now() - this.roundStart;
    } else {
        return -1;
    }
}

//PLAYER METHODS
//Increments player.score and updates view
Player.prototype.incrementScore = function() {
    this.score++;
    this.$score_value.html(this.score);
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
