//ask user for their name
//get top 40 songs
//play preview for those songs
//countdown to begin next song 3,2,1 GUESS IT
var myGame = new Game();
$.ajax({
  type: "GET",
  url: "https://api.spotify.com/v1/search?q=year:2016&type=track",
  success: function(spotifyJSON){
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
    this.players = playerObjectArray || [];
    this.songs = songObjectArray || [];
    this.round = {};
};

function Round(playerObject, songObject) {
    this.player = playerObject;
    this.song = songObject;
}

Game.prototype.buildRound = function() {
    var round = new Round(this.currentPlayer(), this.currentSong());
    this.roundCount++;
    this.round = round;
}

Game.prototype.currentPlayer = function() {
    return this.players[this.roundCount % this.players.length];
}

Game.prototype.nextPlayer = function() {
    return this.players[(this.roundCount + 1) % this.players.length];
}

Game.prototype.currentSong = function() {
    return this.songs[this.roundCount % this.songs.length];
}

Game.prototype.nextSong = function() {
    return this.songs[(this.roundCount + 1) % this.songs.length];
}

Game.prototype.checkGuess = function(){
  return this.round.song.title === $('#song-guess').val();
}

Game.prototype.handleRound = function(){
  if(this.round.song.title === $('#song-guess').val()){
    $('#song-guess').val('');
    this.round.player.score ++;
    $('#score-value').html(this.round.player.score);
    this.buildRound();
    console.log("hey that's right! your score is ", this.round.player.score);//WINNER
  }
}

function prepareGame(){
  myGame.players.push(new Player($("#song-guess").val()));
  $("#start").hide();
  $("#song-guess").attr("placeholder", "guess the song name");
  console.log('my game', myGame);
  $("#song-element").attr("src", myGame.currentSong()["preview_url"]);
  console.log(myGame.currentSong()["preview_url"])
  $("#song-element").on("load", function() {
            $("#song-element").Play();
        }, true);
}

//#########################################################
$(document).ready(function() {
    $("#start").on("click", prepareGame)


    $(document).on('keyup', function(){if(myGame.players.length>0){console.log("hi")}});




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
