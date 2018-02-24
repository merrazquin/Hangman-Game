/*
    Create a list of possible puzzles
    
    Listen for a key to be pressed to start the game
    
    Randomize the list of puzzles

    Select the fist puzzle to be solved.

    Listen for keyboard input
        if the user gueses a letter correctly, display that letter wherever it exists in the puzzle

        if the user guesses incorrectly
            add that letter to the "already guessed"
            decrement number remaining guesses
            display a new part of the hangman
        
        if the user wins or loses the game
            increment win counter if applicable
            restart game with new puzzle

*/

// DOM elements
var solutionDisplay = document.getElementById("solution");
var invalidGuessesBank = document.getElementById("invalidGuesses");
var remainingGuessesDisplay = document.getElementById("remainingGuesses");

var game = {
    hasBegun: false,
    answers: ["Jerry Seinfeld", "Elaine Benes", "Cosmo Kramer", "George Costanza", "black and white cookie", "chocolate babka", "muffin top", "serenity now", "frogger", "bottle wipe", "close talker", "double dipper", "Festivus", "hoochie mama", "manssiere", "Mulva", "David Puddy", "Jackie Chiles", "Tim Whatley"],
    currentAnswer: "",
    guessesRemaining: 10,
    winCount: 0,
    lossCount: 0,

    startGame: function () {
        this.hasBegun = true;

        // randomize the answers
        this.answers.sort(randomize);
        
        // reset the game
        this.reset();
    },
    reset: function () {
        // reset guesses remaining
        remainingGuessesDisplay.textContent = (this.guessesRemaining = 10); 

        // select an answer, and put it back at the end of the list
        this.currentAnswer = this.answers.shift();
        this.answers.push(this.currentAnswer);

        clearSolution();

        var letters = this.currentAnswer.split("");
        letters.forEach(letter => {
            createNode(letter);
        });
    },

    acceptGuess: function (input) {
        console.log("accepted", input);
    }

}

/* Helper Functions */
function clearSolution() {
    while (solutionDisplay.firstChild) {
        solutionDisplay.removeChild(solutionDisplay.firstChild);
    }
}
function createNode(letter) {
    var isSpace = letter == " ";
    var node = document.createElement("li");
    var textElement = document.createTextNode(isSpace ? "-" : " ");
    if(!isSpace){
        node.setAttribute("value", letter.toLowerCase());
        node.setAttribute("displayValue", letter);
        node.setAttribute("solved", "false");
    }
    else{      
        node.setAttribute("solved", "true");
        node.setAttribute("class", "space");
    }

    node.appendChild(textElement);
    solutionDisplay.appendChild(node);

}

function randomize(a, b) {
    var rand = Math.random();
    return rand < .3 ? -1 : (rand < .6 ? 0 : 1);
}

/* listeners */
document.onkeyup = function(event) {
    if(game.hasBegun) {
        var cleanInput = event.key;
        if(cleanInput.length > 1 || !/[A-Za-z]/.test(cleanInput)) {
            console.log("Invalid input:", cleanInput);
            return;
        }

        game.acceptGuess(cleanInput.toLowerCase());
    }
    else {
        game.startGame();
    }
}