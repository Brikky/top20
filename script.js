//end game logic
//    store score in local memory
//include download/play/buy button

var myGame = new Game();
$.ajax({
    type: "GET",
    url: "https://api.spotify.com/v1/search?q=year:2016&type=track",
    success: function(spotifyJSON) {
        myGame.songs = spotifyJSON.tracks.items;
    }
})

function Song(options) {
    this.name = options.name; //string
    this.preview_url = options.url || options.preview_url; //string url
};

function Player(name = "") {
    this.name = name;
    this.guess = "";
    this.score = 0;
};

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
        "Me 'What's your number?' You: 'Number 1.'"
    ]
};

//GAME METHODS
Game.prototype.currentPlayer = function() {
    return this.players[this.roundCount % this.players.length];
}
Game.prototype.currentWinStatement = function() {
    return this.winStatements[this.roundCount % this.winStatements.length];
}

Game.prototype.currentSong = function() {
    return this.songs[this.roundCount % this.songs.length];
}
Game.prototype.currentSongName = function() {
    return this.currentSong()["name"];
}

Game.prototype.checkGuess = function() {
    if (this.players.length > 0) {
        var cleanedSong = (this.currentSongName()).replace(/[^\w\s]|_/g, ""); //removes punctuation
        cleanedSong = cleanedSong.replace(/feat. *$/, "") //removes anything after "feat. "
        var cleanedGuess = ($('#song-guess').val()).replace(/[^\w\s]|_/g, "");
        return (new RegExp(cleanedSong, "i").test(cleanedGuess)); //ignores case
    }
}

Game.prototype.checkEnd = function() {
    return this.roundCount == this.songs.length && this.roundCount > 0;
}

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

Game.prototype.handleRound = function() {
    if (this.players.length > 0) {
        this.roundTime = $.now() / 1000 - this.roundStart;
        if (this.checkGuess() && this.roundTime <= 30.0) {
            (this.currentPlayer()).incrementScore(); //WINNER
            $("#song-name").html(this.currentWinStatement());
            this.newRound();
        } else if (this.roundTime > 30.0) {
            this.newRound();
        }
    }
}

Game.prototype.newRound = function() {
    this.roundCount++;
    this.roundStart = $.now() / 1000;
    $("#song-guess").val("");
    $("#song-element").attr("src", myGame.currentSong()["preview_url"]);

};

Game.prototype.prepareGame = function() {
    this.players.push(new Player($("#song-guess").val()));
    this.winStatements = this.winStatements.shuffle();
    $("#start").hide();
    $("#song-guess").val("");
    $("#song-guess").focus();
    $("#song-guess").attr("placeholder", "guess the song name");
    console.log('my game', myGame);
    this.songs = this.songs.shuffle();
    $("#song-element").attr("src", this.currentSong()["preview_url"]);
    console.log(this.currentSong()["preview_url"])
    $("#visualizer").show();
    this.roundStart = $.now() / 1000;
    $("#song-name").html("You have 30 seconds for each song.");
}

Game.prototype.isOverTime = function() {
    if (this.players.length > 0 && $.now() / 1000 - this.roundStart > 30.0) {
        console.log(this.roundTime, 'interval check')
        $("#song-name").html("You missed '" + this.currentSongName() + "'");
        this.newRound();
    }
}
Game.prototype.resetGame = function(){
  this.roundCount = 0;
  $("#game-guess").show();
  this.players.forEach(function(){this.resetScore()});
}

//PLAYER METHODS
Player.prototype.incrementScore = function() {
    this.score++;
    $('#score-value').html(this.score);
}

Player.prototype.resetScore = function(){
  this.score = 0;
  $('#score-value').html(this.score);
}

Array.prototype.shuffle = function() { //Fisher-Yates (aka Knuth) Shuffle
    var currentIndex = this.length,
        temporaryValue, randomIndex;

    //until shuffled
    while (0 !== currentIndex) {

        //pick an element
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        //swap picked element with current element
        temporaryValue = this[currentIndex];
        this[currentIndex] = this[randomIndex];
        this[randomIndex] = temporaryValue;
    }

    return this;
}



//#########################################################
$("#visualizer").hide();
$("#restart").hide();
var timeInterval = setInterval(myGame.isOverTime.bind(myGame), 100);
var endInterval = setInterval(myGame.endGame.bind(myGame), 100);
$(document).ready(function() {
    $("#start").on("click touchstart", myGame.prepareGame.bind(myGame));
    $(document).on('keyup', myGame.handleRound.bind(myGame));
    $("#restart").on("click touchstart", function(){
      window.location.reload();
    });


    //
    // PLAYGROUND
    //

    //<--- /PLAYGROUND

});



//  myGame.buildRound();
//


// var testSong = new Song({
//     title: "tell me what you want",
//     author: "spice girls",
//     duration: 100
// });
// var testSong2 = new Song({
//     title: "toxic",
//     author: "thebrit",
//     duration: 100
