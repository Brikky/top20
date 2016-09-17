//ask user for their name
//get top 40 songs
//play preview for those songs
//countdown to begin next song 3,2,1 GUESS IT
//end game logic
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
    this.roundStart = $.now()/1000;
    this.roundTime = 0;
    this.players = playerObjectArray || [];
    this.songs = songObjectArray || [];
};

Game.prototype.currentPlayer = function() {
    return this.players[this.roundCount % this.players.length];
}

Game.prototype.nextPlayer = function() {
    return this.players[(this.roundCount + 1) % this.players.length];
}

Game.prototype.currentSong = function() {
    return this.songs[this.roundCount % this.songs.length];
}
Game.prototype.currentSongName = function() {
    return this.currentSong()["name"];
    console.log("current song ", this.currentSong()["name"])
}

Game.prototype.nextSong = function() {
    return this.songs[(this.roundCount + 1) % this.songs.length];
}

Game.prototype.checkGuess = function() {
    if (this.players.length > 0) {
        var punctuationRemovedSong = (this.currentSongName()).replace(/[^\w\s]|_/g, ""); //removes punctuation
        var punctuationRemovedGuess = ($('#song-guess').val()).replace(/[^\w\s]|_/g, "");
        return (new RegExp(punctuationRemovedSong, "i").test(punctuationRemovedGuess)); //ignores case
    }
}

Game.prototype.handleRound = function() {
    if (this.players.length > 0) {
      this.roundTime = $.now()/1000 - this.roundStart;
        if (this.checkGuess() && this.roundTime <= 30.0) {
            this.currentPlayer()["score"]++;
            $('#score-value').html(this.currentPlayer()["score"]); //WINNER
            this.newRound();
        } else if (this.roundTime > 30.0) {
            this.newRound();
        }
    }
}

Game.prototype.newRound = function() {
    this.roundCount++;
    this.roundStart = $.now()/1000;
    $("#song-guess").val("");
    $("#song-element").attr("src", myGame.currentSong()["preview_url"]);

};

Game.prototype.prepareGame = function() {
    this.players.push(new Player($("#song-guess").val()));
    $("#start").hide();
    $("#song-guess").val("");
    $("#song-guess").attr("placeholder", "guess the song name");
    console.log('my game', myGame);
    $("#song-element").attr("src", this.currentSong()["preview_url"]);
    console.log(this.currentSong()["preview_url"])
    this.roundStart = $.now()/1000;
}

Game.prototype.isOverTime = function(){
  if ($.now()/1000 - this.roundStart > 30.0) {
    console.log(this.roundTime, 'interval check')
      this.newRound();
  }
}

setInterval(myGame.isOverTime.bind(myGame), 1000);

//#########################################################
$(document).ready(function() {
    $("#start").on("click", myGame.prepareGame.bind(myGame));

    $(document).on('keyup', myGame.handleRound.bind(myGame));






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
