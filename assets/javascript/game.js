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
var feedback = document.getElementById("feedback");

// Sounds
var introSound = new Audio("assets/sounds/intro.mp3");

var loseSounds = [new Audio("assets/sounds/roundLoss.mp3"), new Audio("assets/sounds/roundLoss2.wav"), new Audio("assets/sounds/roundLoss3.mp3")];
var winSounds = [new Audio("assets/sounds/roundWin.mp3"), new Audio("assets/sounds/roundWin2.wav"), new Audio("assets/sounds/roundWin3.wav")];


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

        // introSound.play();

        // randomize the answers and sounds
        this.answers.sort(randomize);
        winSounds.sort(randomize);
        loseSounds.sort(randomize);

        feedback.innerHTML = "&nbsp;";

        // reset the game
        this.newRound();
    },
    newRound: function () {
        // reset round status
        this.roundEnded = false;

        // reset guesses
        this.allGuesses = [];
        this.invalidGuesses = [];

        // update display of remaining guesses
        remainingGuessesDisplay.textContent = this.maxTries - this.invalidGuesses.length;

        // select an answer, and put it back at the end of the list
        this.currentAnswer = this.answers.shift();
        this.answers.push(this.currentAnswer);

        // clear the solutions and the guess bank
        while (solutionDisplay.firstChild) {
            solutionDisplay.removeChild(solutionDisplay.firstChild);
        }
        while (invalidGuessesBank.firstChild) {
            invalidGuessesBank.removeChild(invalidGuessesBank.firstChild);
        }

        // loop over each letter in the answer
        var letters = this.currentAnswer.split("");
        letters.forEach(letter => {
            // create a letter space for the puzzle
            var isSpace = letter == " ";
            var node = document.createElement("li");
            var textElement = document.createTextNode(isSpace ? "-" : "&nbsp;");

            // treat spaces differently from letters
            if (isSpace) {
                node.setAttribute("solved", "true");
            }
            else {
                node.setAttribute("value", letter.toLowerCase());
                node.setAttribute("displayValue", letter);
                node.setAttribute("solved", "false");
            }
            node.innerHTML = isSpace ? "-" : "&nbsp;";

            // add the letter space to the collection (ul)
            solutionDisplay.appendChild(node);
        });
    },

    acceptGuess: function (input) {
        console.log("accepted", input);

        // check to see if leter has already been guessed
        if (this.allGuesses.indexOf(input) != -1) {
            console.log(input, "already guessed");
            return;
        }

        // add current guess to all guesses
        this.allGuesses.push(input);

        // collect nodes that match the input
        var correct = document.querySelectorAll('li[value="' + input + '"]');

        // if there are no matching nodes, log an invalid guess
        if (!correct.length) {
            this.invalidGuesses.push(input);

            // add invalid guess to the bank
            var node = document.createElement("li");
            node.textContent = input;

            invalidGuessesBank.appendChild(node);

            // update display of remaining guesses
            remainingGuessesDisplay.textContent = this.maxTries - this.invalidGuesses.length;
        }
        // otherwise, display the correct guess
        else {
            correct.forEach(node => {
                node.textContent = node.getAttribute("displayvalue");
                node.setAttribute("solved", "true");
            });
        }

        // check to see if round has either been won or lost
        if (document.querySelectorAll('li[solved="true"]').length === this.currentAnswer.length) {
            this.endRound(true);
        } else if (this.invalidGuesses.length === this.maxTries) {
            this.endRound(false);
        }
    },

    endRound: function (win) {
        var sound;

        if (win) {
            console.log("you won");

            // select winning sound
            sound = winSounds.shift();
            winSounds.push(sound);

            this.winCount++;
        }
        else {
            console.log("you lost");

            // var unsolved = document.querySelectorAll();

            // select losing sound
            sound = loseSounds.shift();
            loseSounds.push(sound);

            this.lossCount++;
        }

        feedback.textContent = (win ? "You won! " : "You lost! ") + "Press any key to play again.";

        sound.play();

        // update the scoreboard
        winsDisplay.textContent = this.winCount;
        lossesDisplay.textContent = this.lossCount;

        this.roundEnded = true;
    }
}

/* helper functions */

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
        game.newRound();
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