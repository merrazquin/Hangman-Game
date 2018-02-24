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
var winsDisplay = document.getElementById("roundsWon");
var lossesDisplay = document.getElementById("roundsLost");

var game = {
    hasBegun: false,
    roundEnded: false,
    answers: ["Jerry Seinfeld", "Elaine Benes", "Cosmo Kramer", "George Costanza", "black and white cookie", "chocolate babka", "muffin top", "serenity now", "frogger", "bottle wipe", "close talker", "double dipper", "Festivus", "hoochie mama", "manssiere", "Mulva", "David Puddy", "Jackie Chiles", "Tim Whatley"],
    currentAnswer: "",
    allGuesses: [],
    invalidGuesses: [],
    maxTries: 10,
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
        // reset round status
        this.roundEnded = false;

        // reset guesses
        this.allGuesses = [];
        this.invalidGuesses = [];
        updateRemainingGuesses(this.maxTries - this.invalidGuesses.length)

        // select an answer, and put it back at the end of the list
        this.currentAnswer = this.answers.shift();
        this.answers.push(this.currentAnswer);

        clearDOM();

        var letters = this.currentAnswer.split("");
        letters.forEach(letter => {
            createNode(letter);
        });
    },

    acceptGuess: function (input) {
        console.log("accepted", input);
        if (this.allGuesses.indexOf(input) != -1) {
            console.log(input, "already guessed");
            return;
        }

        this.allGuesses.push(input);

        var correct = document.querySelectorAll('li[value="' + input + '"]');
        if (!correct.length) {
            this.invalidGuesses.push(input);
            addInvalidGuess(input);
            updateRemainingGuesses(this.maxTries - this.invalidGuesses.length);
        } else {
            correct.forEach(node => {
                node.textContent = node.getAttribute("displayvalue");
                node.setAttribute("solved", "true");
            });
        }

        if (document.querySelectorAll('li[solved="true"]').length === this.currentAnswer.length) {
            this.endRound(true);
        } else if (this.invalidGuesses.length === this.maxTries) {
            this.endRound(false);
        }
    },

    endRound: function(win) {
        if(win) {
            console.log("you won");
            this.winCount++;
        }
        else {
            console.log("you lost");
            this.lossCount++;
        }

        updateRoundStats(this.winCount, this.lossCount);
        this.roundEnded = true;
    }
}

/* Helper Functions and DOM Manipulators */
// clear the solutions and the guess bank
function clearDOM() {
    while (solutionDisplay.firstChild) {
        solutionDisplay.removeChild(solutionDisplay.firstChild);
    }
    while (invalidGuessesBank.firstChild) {
        invalidGuessesBank.removeChild(invalidGuessesBank.firstChild);
    }
}

// create a letter space for the puzzle
function createNode(letter) {
    var isSpace = letter == " ";
    var node = document.createElement("li");
    var textElement = document.createTextNode(isSpace ? "-" : "&nbsp;");
    
    // treat spaces differently from letters
    if (isSpace) {
        node.setAttribute("solved", "true");
        node.setAttribute("class", "space");
    }
    else {
        node.setAttribute("value", letter.toLowerCase());
        node.setAttribute("displayValue", letter);
        node.setAttribute("solved", "false");
    }
    node.innerHTML = isSpace ? "-" : "&nbsp;";

    // node.appendChild(textElement);
    solutionDisplay.appendChild(node);

}

// add invalid guess to the bank
function addInvalidGuess(input) {
    var node = document.createElement("li");
    node.textContent = input;

    invalidGuessesBank.appendChild(node);
}

// update display of remaining guesses
function updateRemainingGuesses(remaining) {
    remainingGuessesDisplay.textContent = remaining;
}

function updateRoundStats(wins, losses) {
    winsDisplay.textContent = wins;
    lossesDisplay.textContent = losses;
}

// helper function to randomize an array
function randomize(a, b) {
    var rand = Math.random();
    return rand < .3 ? -1 : (rand < .6 ? 0 : 1);
}

/* listeners */
document.onkeyup = function (event) {
    // if the game hasn't begun, start it
    if (!game.hasBegun) {
        game.startGame();
    }
    // if the game has begun, but the round has ended, reset
    else if (game.roundEnded) {
        game.reset();
    }
    // otherwise, send the cleaned input to the game
    else {
        var cleanInput = event.key;
        if (cleanInput.length > 1 || !/[A-Za-z]/.test(cleanInput)) {
            console.log("Invalid input:", cleanInput);
            return;
        }

        game.acceptGuess(cleanInput.toLowerCase());
    }
}