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


TODO: support native keyboard for tablets

*/



// DOM elements
var solutionDisplay = document.getElementById("solution");
var invalidGuessesBank = document.getElementById("invalidGuesses");
var remainingGuessesDisplay = document.getElementById("remainingGuesses");
var winsDisplay = document.getElementById("roundsWon");
var lossesDisplay = document.getElementById("roundsLost");
var feedback = document.getElementById("feedback");
var keyboard = document.getElementById("keyboard");
var hangmanImage = document.getElementById("hangmanImage");

// Sounds
var introSound = new Audio("assets/sounds/intro.mp3");
var loseSounds = [new Audio("assets/sounds/roundLoss.mp3"), new Audio("assets/sounds/roundLoss2.wav"), new Audio("assets/sounds/roundLoss3.mp3")];
var winSounds = [new Audio("assets/sounds/roundWin.mp3"), new Audio("assets/sounds/roundWin2.wav"), new Audio("assets/sounds/roundWin3.wav")];

/* helper functions */
function randomize(a, b) {
    var rand = Math.random();
    return rand < .3 ? -1 : (rand < .6 ? 0 : 1);
}

function handleInput(event) {
    // if the game hasn't begun, start it
    if (!game.hasBegun) {
        game.startGame();
    }
    // if, but the round has ended, reset
    if (game.roundEnded) {
        game.newRound();
    }
    // otherwise, send the cleaned input to the game
    else {
        // if this is a keypress, event will have a key, otherwise, we're dealing with a button press
        var cleanInput = event.key ? event.key : event.target.getAttribute("value");
        if (cleanInput.length > 1 || !/[A-Za-z]/.test(cleanInput)) {
            console.log("Invalid input:", cleanInput);
            return;
        }

        game.acceptGuess(cleanInput.toLowerCase());
    }
}

var game = {
    hasBegun: false,
    roundEnded: false,
    answers: ["Jerry Seinfeld", "Elaine Benes", "Cosmo Kramer", "George Costanza", "chocolate babka", "muffin top", "serenity now", "frogger", "bottle wipe", "close talker", "double dipper", "Festivus", "hoochie mama", "manssiere", "Mulva", "David Puddy", "Jackie Chiles", "Tim Whatley"],
    currentAnswer: "",
    allGuesses: [],
    invalidGuesses: [],
    maxTries: 10,
    winCount: 0,
    lossCount: 0,

    setup: function() {
        this.buildKeyboard();

        // randomize the answers and sounds
        this.answers.sort(randomize);
        winSounds.sort(randomize);
        loseSounds.sort(randomize);

        // reset the game
        this.newRound();
    },

    startGame: function () {
        this.hasBegun = true;

        introSound.play();

        feedback.innerHTML = "";
    },
    newRound: function () {
        // reset round status
        this.roundEnded = false;

        // reset guesses
        this.allGuesses = [];
        this.invalidGuesses = [];


        // update display of remaining guesses
        this.updateRemainingGuesses();

        // select an answer, and put it back at the end of the list
        this.currentAnswer = this.answers.shift();
        this.answers.push(this.currentAnswer);

        // clear the solutions and the guess bank, and reset keyboard
        while (solutionDisplay.firstChild) {
            solutionDisplay.removeChild(solutionDisplay.firstChild);
        }
        while (invalidGuessesBank.firstChild) {
            invalidGuessesBank.removeChild(invalidGuessesBank.firstChild);
        }

        document.querySelectorAll("#keyboard button").forEach(letterButton => {
            letterButton.setAttribute("class", "btn btn-default")
        });


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
                node.setAttribute("value", "-");
            }
            else {
                // TODO: change to char codes for better obfuscation of answer
                node.setAttribute("value", letter.toLowerCase());
                node.setAttribute("displayValue", letter);
                node.setAttribute("solved", "false");
            }
            node.innerHTML = isSpace ? "" : "&nbsp;";

            // add the letter space to the collection (ul)
            solutionDisplay.appendChild(node);
        });
    },

    buildKeyboard: function () {
        var rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
        rows.forEach(row => {

            // create a button group div
            var buttonGroup = document.createElement("div");
            buttonGroup.setAttribute("class", "btn-group");
            buttonGroup.setAttribute("role", "group");

            // for each letter in the row, create a button 
            row.split("").forEach(letter => {
                var letterButton = document.createElement("button");
                letterButton.setAttribute("type", "button");
                letterButton.setAttribute("class", "btn btn-default")
                letterButton.setAttribute("value", letter);
                letterButton.textContent = letter;
                letterButton.onclick = handleInput;
                buttonGroup.appendChild(letterButton);
            });
            keyboard.appendChild(buttonGroup);
            keyboard.appendChild(document.createElement("br"));
        });
    },

    acceptGuess: function (input) {
        console.log("accepted", input);

        // check to see if leter has already been guessed
        if (this.allGuesses.indexOf(input) != -1) {
            console.log(input, "already guessed");
            return;
        }

        var keyboardKey = document.querySelector('button[value="' + input + '"]');

        // add current guess to all guesses
        this.allGuesses.push(input);

        // collect nodes that match the input
        var correct = document.querySelectorAll('li[value="' + input + '"]');

        // if there are no matching nodes, log an invalid guess
        if (!correct.length) {
            this.invalidGuesses.push(input);

            keyboardKey.className += " btn-danger disabled";

            // add invalid guess to the bank
            var node = document.createElement("li");
            node.textContent = input;

            invalidGuessesBank.appendChild(node);

            // update display of remaining guesses
            this.updateRemainingGuesses();
        }
        // otherwise, display the correct guess
        else {
            keyboardKey.className += " btn-success disabled";

            correct.forEach(node => {
                node.textContent = node.getAttribute("displayValue");
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

    updateRemainingGuesses: function(){
        hangmanImage.src = "assets/images/hangman" + (remainingGuessesDisplay.textContent = this.maxTries - this.invalidGuesses.length) + ".png";
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

            // reveal answer
            document.querySelectorAll('li[solved="false"]').forEach(node => {
                node.setAttribute("failed", "true");
                node.textContent = node.getAttribute("displayValue");
            });

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

/* calls */
game.setup();

/* listeners */
document.onkeyup = handleInput;
if(window.outerWidth == 1024 || window.outerWidth == 1366) {
    alert("mobile keyboard");
    /* show native keyboard for ipad only */
    document.onclick = function(){		
        document.getElementById("mobile-keyboard-fix").focus();	
    };
    document.getElementById("mobile-keyboard-fix").focus();
}