document.addEventListener("DOMContentLoaded", function () {
    var startButtons = document.querySelectorAll(".start-game");
    var gameDiv = document.getElementById("game");
    var endDiv = document.getElementById("ending");
    var settingsForm = document.getElementById("settings");
    var questionEl = document.getElementById("question");
    var answerInput = document.getElementById("answer");
    //    const submitButton = document.getElementById("submit-answer") as HTMLButtonElement;
    var timerEl = document.getElementById("timer");
    var scoreEl = document.getElementById("score");
    var endScoreEl = document.getElementById("endScore");
    var additionMinRange = 1;
    var additionMaxRange = 99;
    var additionDecimalPlaces = 0;
    var multiplicationMinRange = 2;
    var multiplicationMaxRange = 12;
    var timeLimit = 120;
    var timer;
    var score = 0;
    var correctAnswer = 0;
    var additionProblems = true;
    var subtractionProblems = true;
    var multiplicationProblems = true;
    var divisionProblems = true;
    var oper = [];
    var operations = {
        add: function (a, b) { return a + b; },
        subtract: function (a, b) { return a - b; },
        multiply: function (a, b) { return a * b; },
        divide: function (a, b) { return a / b; }
    };
    var setActiveOperations = function () {
        oper = [];
        if (additionProblems) {
            oper.push(['add', "+"]);
            console.log('addition');
        }
        if (subtractionProblems) {
            console.log('subtract');
            oper.push(['subtract', '−']);
        }
        if (multiplicationProblems) {
            oper.push(['multiply', '×']);
        }
        if (divisionProblems) {
            oper.push(['divide', '÷']);
        }
        console.log("Update:");
        console.log(oper);
    };
    // Generate a random question
    var generateQuestion = function () {
        var opernum = Math.floor(Math.random() * oper.length); // chooses a random operator
        console.log(opernum);
        var thisoper = oper[opernum];
        console.log(thisoper);
        var opername = thisoper[0];
        var operstr = thisoper[1];
        var num1;
        var num2;
        if (opername === "add" || opername === "subtract") {
            num1 = Math.floor(Math.random() * (additionMaxRange - additionMinRange + 1)) + additionMinRange;
            num2 = Math.floor(Math.random() * (additionMaxRange - additionMinRange + 1)) + additionMinRange;
        }
        else {
            num1 = Math.floor(Math.random() * (multiplicationMaxRange - multiplicationMinRange + 1)) + multiplicationMinRange;
            num2 = Math.floor(Math.random() * (multiplicationMaxRange - multiplicationMinRange + 1)) + multiplicationMinRange;
        }
        if (opername === 'divide') {
            return { question: num1 * num2 + " \u00F7 " + num1 + " =", answer: num2 };
        }
        return { question: num1 + " " + operstr + " " + num2 + " =", answer: operations[opername](num1, num2) };
    };
    // Start the game
    var startGame = function () {
        var addMinRangeInput = document.getElementById("addition-min-range").value;
        var addMaxRangeInput = document.getElementById("addition-max-range").value;
        var mulMinRangeInput = document.getElementById("multiplication-min-range").value;
        var mulMaxRangeInput = document.getElementById("multiplication-max-range").value;
        var timeLimitInput = document.getElementById("time-limit").value;
        setActiveOperations();
        additionMinRange = parseInt(addMinRangeInput) || additionMinRange;
        additionMaxRange = parseInt(addMaxRangeInput) || additionMaxRange;
        multiplicationMinRange = parseInt(mulMinRangeInput) || multiplicationMinRange;
        multiplicationMaxRange = parseInt(mulMaxRangeInput) || multiplicationMaxRange;
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
        questionEl.innerHTML = question;
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
    startButtons.forEach(function (button) {
        button.addEventListener("click", startGame);
    });
    // submitButton.addEventListener("click", checkAnswer);
    answerInput.addEventListener("input", function () {
        checkAnswer();
    });
    // Operations
    document.getElementById('addition-toggle').addEventListener('change', function () {
        console.log("tog1");
        if (this.checked) {
            additionProblems = true;
        }
        else {
            additionProblems = false;
        }
        setActiveOperations();
    });
    document.getElementById('subtraction-toggle').addEventListener('change', function () {
        console.log("tog2");
        if (this.checked) {
            subtractionProblems = true;
        }
        else {
            subtractionProblems = false;
        }
        setActiveOperations();
    });
    document.getElementById('multiplication-toggle').addEventListener('change', function () {
        console.log("tog3");
        if (this.checked) {
            multiplicationProblems = true;
        }
        else {
            multiplicationProblems = false;
        }
        setActiveOperations();
    });
    document.getElementById('division-toggle').addEventListener('change', function () {
        console.log("tog4");
        if (this.checked) {
            divisionProblems = true;
        }
        else {
            divisionProblems = false;
        }
        setActiveOperations();
    });
    // Decimals
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
});
