# Top 20
___
Interactive game where the user guesses the name of today's 20 hottest Spotify songs. 
Designed and developed over weekend sprint.

### URL: [http://bricky.tech/top20/](bricky.tech/top20/)

### Features
___
* Dynamically gathers top 20 songs from Spotify
* Player guesses are dynamically checked - no need to press enter!
* Player guesses and song names are stripped of punctuation before being compared
* Secondary song names and featuring lines are not required for a correct answer
* Songs autoprogress after correct guess or 30 seconds

### Technologies Used
____
- HTML
- CSS
  - Animation w/ Keyframes
- Javascript
- Jquery
- Spotify's Web API

### Code Sample
___
```JavaScript
Game.prototype.cleanString = function(string) {
    var cleanedString = string
        .replace(/\s*\(.*?\)\s*/g, '')  //removes secondary song titles in parenthesis
        .replace(/[^\w\s]|_/g, "")      //removes punctuation
        .replace(/feat.*this.$/g, "")   //removes anything after "feat. "
        .trim();                        //removes leading and trailing whitespace
    
    return cleanedString;
}
```

### Future Work
___
1. Allow players to pick a genre of music
2. Maintain high score over time
3. Social sharing of scores
4. 'Discover' mode, which uses songs lower in popularity
5. Affiliate links to purchase albums/songs

### Screenshots
___
![Top 20 Game](http://i.imgur.com/usqRk5z.png)
