// Basic TypeScript setup for a mental arithmetic game
document.addEventListener("DOMContentLoaded", function () {
    //    const startButton = document.getElementById("start-game") as HTMLButtonElement;
    var startButtons = document.querySelectorAll(".start-game");
    var gameDiv = document.getElementById("game");
    var endDiv = document.getElementById("ending");
    var settingsForm = document.getElementById("settings");
    var questionEl = document.getElementById("question");
    var answerInput = document.getElementById("answer");
    var submitButton = document.getElementById("submit-answer");
    var timerEl = document.getElementById("timer");
    var scoreEl = document.getElementById("score");
    var endScoreEl = document.getElementById("endScore");
    var additionMinRange = 1;
    var additionMaxRange = 99;
    var multiplicationMinRange = 1;
    var multiplicationMaxRange = 99;
    var timeLimit = 120;
    var timer;
    var score = 0;
    var correctAnswer = 0;
    // Button stuff
    document.getElementById('decimal-addition-toggle').addEventListener('change', function () {
        var element1 = document.getElementById('decimal-addition-amount');
        var element2 = document.getElementById('decimal-addition-display');
        if (this.checked) {
            console.log("click");
            element1.style.display = 'inline'; // Show the element
            element2.style.display = 'inline'; // Show the element
        }
        else {
            element1.style.display = 'none'; // Show the element
            element2.style.display = 'none'; // Show the element
        }
    });
    var operations = {
        add: function (a, b) { return a + b; },
        subtract: function (a, b) { return a - b; },
        multiply: function (a, b) { return a * b; },
        divide: function (a, b) { return a / b; }
    };
    // Generate a random question
    var generateQuestion = function () {
        var opernum = Math.floor(Math.random() * 3) + 1;
        var oper = ['+', '-', '*', '/'][opernum];
        var num1;
        var num2;
        if (oper === "+" || oper === "-") {
            num1 = Math.floor(Math.random() * (additionMaxRange - additionMinRange + 1)) + additionMinRange;
            num2 = Math.floor(Math.random() * (additionMaxRange - additionMinRange + 1)) + additionMinRange;
        }
        else {
            num1 = Math.floor(Math.random() * (multiplicationMaxRange - multiplicationMinRange + 1)) + multiplicationMinRange;
            num2 = Math.floor(Math.random() * (multiplicationMaxRange - multiplicationMinRange + 1)) + multiplicationMinRange;
        }
        if (oper === "/") {
            return { question: num1 * num2 + " / " + num1, answer: num2 };
        }
        return { question: num1 + " " + oper + " " + num2, answer: operations[['add', 'subtract', 'multiply', 'divide'][opernum]](num1, num2) };
    };
    // Start the game
    var startGame = function () {
        var addMinRangeInput = document.getElementById("addition-min-range").value;
        var addMaxRangeInput = document.getElementById("addition-max-range").value;
        var mulMinRangeInput = document.getElementById("multiplication-min-range").value;
        var mulMaxRangeInput = document.getElementById("multiplication-max-range").value;
        var timeLimitInput = document.getElementById("time-limit").value;
        additionMinRange = parseInt(addMinRangeInput) || 1;
        additionMaxRange = parseInt(addMaxRangeInput) || 99;
        multiplicationMinRange = parseInt(mulMinRangeInput) || 1;
        multiplicationMaxRange = parseInt(mulMaxRangeInput) || 12;
        timeLimit = parseInt(timeLimitInput) || 120;
        score = 0;
        settingsForm.style.display = "none";
        endDiv.style.display = "none";
        gameDiv.style.display = "block";
        startTimer();
        loadNextQuestion();
    };
    // Start the timer
    var startTimer = function () {
        var timeLeft = timeLimit;
        timerEl.textContent = timeLeft.toString();
        timer = window.setInterval(function () {
            timeLeft--;
            timerEl.textContent = timeLeft.toString();
            if (timeLeft <= 0) {
                clearInterval(timer);
                endGame();
            }
        }, 1000);
    };
    // Load the next question
    var loadNextQuestion = function () {
        var _a = generateQuestion(), question = _a.question, answer = _a.answer;
        questionEl.textContent = question;
        correctAnswer = answer;
        answerInput.value = "";
        answerInput.focus();
    };
    // Check the answer
    var checkAnswer = function () {
        var userAnswer = parseInt(answerInput.value);
        if (userAnswer === correctAnswer) {
            score++;
            scoreEl.textContent = score.toString();
            endScoreEl.textContent = score.toString();
            loadNextQuestion();
        }
        else {
            //answerInput.value = "";
            answerInput.focus();
        }
    };
    // End the game
    var endGame = function () {
        // alert(`Time's up! Your final score is ${score}.`);
        gameDiv.style.display = "none";
        endDiv.style.display = "block";
        settingsForm.style.display = "none";
    };
    // Event listeners
    // startButton.addEventListener("click", startGame);
    startButtons.forEach(function (button) {
        button.addEventListener("click", startGame);
    });
    submitButton.addEventListener("click", checkAnswer);
    answerInput.addEventListener("input", function () {
        checkAnswer();
    });
    //    answerInput.addEventListener("keyup", (event) => {
    //        if (event.key === "Enter") {
    //            checkAnswer();
    //        }
    //    });
});
