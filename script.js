//ask user for their name
//get top 40 songs
//play preview for those songs
//countdown to begin next song 3,2,1 GUESS IT
//end game logic
//alert player of correct
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
};

Game.prototype.currentPlayer = function() {
    return this.players[this.roundCount % this.players.length];
}

Game.prototype.currentSong = function() {
    return this.songs[this.roundCount % this.songs.length];
}
Game.prototype.currentSongName = function() {
    return this.currentSong()["name"];
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
        this.roundTime = $.now() / 1000 - this.roundStart;
        if (this.checkGuess() && this.roundTime <= 30.0) {
            this.currentPlayer()["score"]++;
            $('#score-value').html(this.currentPlayer()["score"]); //WINNER
            $("#song-name").html(winStatements[this.roundCount]);
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
}

Game.prototype.isOverTime = function() {
    if (this.players.length > 0 && $.now() / 1000 - this.roundStart > 30.0) {
        console.log(this.roundTime, 'interval check')
        $("#song-name").html("You missed '" + this.currentSongName() + "'");
        this.newRound();
    }
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
    var winStatements = ["You got it!","Watch out, Adele!","I thought it was The Beatles...","Keep it going!","Highest score EVER?","Lightning Round!","That's my favorite song!","Rockstar!","Notice me Senpai.","Call 911! 'Cuz you are on FIRE","You're my hero.","Making Beyonce proud!","Grand Prize!","That one took me a second.","OK. But can you get the next one?","I bet you make babies smile.","Stylin'!","DANCE BREAK","Me 'What's your number?' You: 'Number 1.'"].shuffle();
    //#########################################################
$("#visualizer").hide();
$(document).ready(function() {
    $("#start").on("click", myGame.prepareGame.bind(myGame));

    $(document).on('keyup', myGame.handleRound.bind(myGame));
    setInterval(myGame.isOverTime.bind(myGame), 100);

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
