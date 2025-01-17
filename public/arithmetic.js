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
    // set default values
    var addLeftMin = 1;
    var addLeftMax = 99;
    var addRightMin = 1;
    var addRightMax = 99;
    var subLeftMin = 1;
    var subLeftMax = 99;
    var subRightMin = 1;
    var subRightMax = 99;
    var mulLeftMin = 2;
    var mulLeftMax = 12;
    var mulRightMin = 2;
    var mulRightMax = 12;
    var divLeftMin = 1;
    var divLeftMax = 100;
    var divRightMin = 1;
    var divRightMax = 10;
    var addIntegers = true;
    var mulIntegers = true;
    var subIntegers = true;
    var divIntegers = true;
    var addDecimals = false;
    var mulDecimals = false;
    var subDecimals = false;
    var divDecimals = false;
    var addFractions = false;
    var mulFractions = false;
    var subFractions = false;
    var divFractions = false;
    var addTypes = [];
    var subTypes = [];
    var mulTypes = [];
    var divTypes = [];
    var addDecimalPlaces = 2;
    var subDecimalPlaces = 2;
    var mulDecimalPlaces = 2;
    var divDecimalPlaces = 2;
    var timeLimit = 120;
    var timer;
    var score = 0;
    var correctAnswer = 0;
    var additionProblems = true;
    var subtractionProblems = true;
    var multiplicationProblems = true;
    var divisionProblems = true;
    var divisionReversedMultiplication = true;
    var subtractionReversedMultiplication = true;
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
        }
        if (subtractionProblems) {
            oper.push(['subtract', '−']);
        }
        if (multiplicationProblems) {
            oper.push(['multiply', '×']);
        }
        if (divisionProblems) {
            oper.push(['divide', '÷']);
        }
        console.log("Active operations: " + oper);
    };
    var setActiveProblemTypes = function () {
        addTypes = [];
        subTypes = [];
        mulTypes = [];
        divTypes = [];
        var bools = [[addIntegers, addDecimals, addFractions],
            [subIntegers, subDecimals, subFractions],
            [mulIntegers, mulDecimals, mulFractions],
            [divIntegers, divDecimals, divFractions]];
        var names = ["integer", "decimal", "fraction"];
        [addTypes, subTypes, mulTypes, divTypes].forEach(function (types, index) {
            bools[index].forEach(function (bool, jndex) {
                if (bool) {
                    types.push(names[jndex]);
                }
            });
        });
        console.log(addTypes);
    };
    // generate a random integer between the bounds
    var generateInt = function (lowerBound, upperBound) {
        return Math.floor(Math.random() * (upperBound - lowerBound)) + lowerBound;
    };
    // generate a random number with the given conditions
    var generateDec = function (lowerBound, upperBound, decimalPlaces) {
        var num = Math.random() * (upperBound - lowerBound) + lowerBound;
        return parseFloat(num.toFixed(decimalPlaces));
    };
    // generate a random fraction
    // Generate a random question
    var generateQuestion = function () {
        var num1;
        var num2;
        // choose a random operation based on the ones that are enabled
        var opernum = Math.floor(Math.random() * oper.length);
        var thisoper = oper[opernum];
        var opername = thisoper[0];
        var operstr = thisoper[1];
        if (opername === "add") {
            // choose a random number type
            var type = addTypes[Math.floor(Math.random() * addTypes.length)];
            if (type === "integer") {
                num1 = generateInt(addLeftMin, addLeftMax);
                num2 = generateInt(addRightMin, addRightMax);
            }
            else if (type == "decimal") {
                num1 = generateDec(addLeftMin, addLeftMax, addDecimalPlaces);
                num2 = generateDec(addRightMin, addRightMax, addDecimalPlaces);
            }
        }
        else if (opername === "subtract") {
            num1 = generateInt(subLeftMin, subLeftMax);
            num2 = generateInt(subRightMin, subRightMax);
        }
        else if (opername === "multiply") {
            num1 = generateInt(mulLeftMin, mulLeftMax);
            num2 = generateInt(mulRightMin, mulRightMax);
        }
        else if (opername === 'divide') {
            num1 = generateInt(divLeftMin, divLeftMax);
            num2 = generateInt(divRightMin, divRightMax);
            num1 = num1 * num2;
        }
        // Format this into some nice math
        console.log(operations[opername](num1, num2));
        return {
            question: "\n          <math display=\"inline\">" + num1 + " " + operstr + " " + num2 + " =</math>\n        ", answer: operations[opername](num1, num2)
        };
    };
    // Start the game
    var startGame = function () {
        var addLeftMinInput = document.getElementById("addition-left-min").value;
        var addLeftMaxInput = document.getElementById("addition-left-max").value;
        var addRightMinInput = document.getElementById("addition-right-min").value;
        var addRightMaxInput = document.getElementById("addition-right-max").value;
        var subLeftMinInput = document.getElementById("subtraction-left-min").value;
        var subLeftMaxInput = document.getElementById("subtraction-left-max").value;
        var subRightMinInput = document.getElementById("subtraction-right-min").value;
        var subRightMaxInput = document.getElementById("subtraction-right-max").value;
        var mulLeftMinInput = document.getElementById("multiplication-left-min").value;
        var mulLeftMaxInput = document.getElementById("multiplication-left-max").value;
        var mulRightMinInput = document.getElementById("multiplication-right-min").value;
        var mulRightMaxInput = document.getElementById("multiplication-right-max").value;
        var divLeftMinInput = document.getElementById("division-left-min").value;
        var divLeftMaxInput = document.getElementById("division-left-max").value;
        var divRightMinInput = document.getElementById("division-right-min").value;
        var divRightMaxInput = document.getElementById("division-right-max").value;
        var timeLimitInput = document.getElementById("time-limit").value;
        setActiveOperations(); // only sets to active the operations that the user selected
        setActiveProblemTypes();
        addLeftMin = parseInt(addLeftMinInput) || addLeftMin;
        addLeftMax = parseInt(addLeftMaxInput) || addLeftMax;
        addRightMin = parseInt(addRightMinInput) || addRightMin;
        addRightMax = parseInt(addRightMaxInput) || addRightMax;
        subLeftMin = parseInt(subLeftMinInput) || subLeftMin;
        subLeftMax = parseInt(subLeftMaxInput) || subLeftMax;
        subRightMin = parseInt(subRightMinInput) || subRightMin;
        subRightMax = parseInt(subRightMaxInput) || subRightMax;
        mulLeftMin = parseInt(mulLeftMinInput) || mulLeftMin;
        mulLeftMax = parseInt(mulLeftMaxInput) || mulLeftMax;
        mulRightMin = parseInt(mulRightMinInput) || mulRightMin;
        mulRightMax = parseInt(mulRightMaxInput) || mulRightMax;
        divLeftMin = parseInt(divLeftMinInput) || divLeftMin;
        divLeftMax = parseInt(divLeftMaxInput) || divLeftMax;
        divRightMin = parseInt(divRightMinInput) || divRightMin;
        divRightMax = parseInt(divRightMaxInput) || divRightMax;
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
        var userAnswer = parseFloat(answerInput.value);
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
        if (this.checked) {
            additionProblems = true;
        }
        else {
            additionProblems = false;
        }
        setActiveOperations();
    });
    document.getElementById('subtraction-toggle').addEventListener('change', function () {
        if (this.checked) {
            subtractionProblems = true;
        }
        else {
            subtractionProblems = false;
        }
        setActiveOperations();
    });
    document.getElementById('multiplication-toggle').addEventListener('change', function () {
        if (this.checked) {
            multiplicationProblems = true;
        }
        else {
            multiplicationProblems = false;
        }
        setActiveOperations();
    });
    document.getElementById('division-toggle').addEventListener('change', function () {
        if (this.checked) {
            divisionProblems = true;
        }
        else {
            divisionProblems = false;
        }
        setActiveOperations();
    });
    // NUMBER TYPES
    // Integers for addition
    document.getElementById('integer-addition-toggle').addEventListener('change', function () {
        if (this.checked) {
            addIntegers = true;
        }
        else {
            addIntegers = false;
        }
        setActiveProblemTypes();
    });
    // Integers for subtraction
    document.getElementById('integer-subtraction-toggle').addEventListener('change', function () {
        if (this.checked) {
            subIntegers = true;
        }
        else {
            subIntegers = false;
        }
        setActiveProblemTypes();
    });
    // Integers for multiplication
    document.getElementById('integer-multiplication-toggle').addEventListener('change', function () {
        if (this.checked) {
            mulIntegers = true;
        }
        else {
            mulIntegers = false;
        }
        setActiveProblemTypes();
    });
    // Integers for division
    document.getElementById('integer-division-toggle').addEventListener('change', function () {
        if (this.checked) {
            divIntegers = true;
        }
        else {
            divIntegers = false;
        }
        setActiveProblemTypes();
    });
    // Decimals
    // Addition
    document.getElementById('decimal-addition-toggle').addEventListener('change', function () {
        var element1 = document.getElementById('decimal-addition-amount');
        var element2 = document.getElementById('decimal-addition-display');
        if (this.checked) {
            console.log("click");
            element1.style.display = 'inline'; // Show the element
            element2.style.display = 'inline'; // Show the element
            addDecimals = true;
        }
        else {
            element1.style.display = 'none'; // Show the element
            element2.style.display = 'none'; // Show the element
            addDecimals = false;
        }
        setActiveProblemTypes();
    });
    // Addition decimal places
    document.getElementById('decimal-addition-amount').addEventListener('input', function () {
        addDecimalPlaces = parseInt(this.value);
        console.log('hi');
        console.log(addDecimalPlaces);
    });
    document.getElementById('decimal-multiplication-toggle').addEventListener('change', function () {
        var element1 = document.getElementById('decimal-multiplication-amount');
        var element2 = document.getElementById('decimal-multiplication-display');
        if (this.checked) {
            console.log("click");
            element1.style.display = 'inline'; // Show the element
            element2.style.display = 'inline'; // Show the element
            mulDecimals = true;
        }
        else {
            element1.style.display = 'none'; // Show the element
            element2.style.display = 'none'; // Show the element
            mulDecimals = false;
        }
    });
    // Subtraction and division being reversed versions of the addition and multiplication problems
    document.getElementById('subtraction-reverse-toggle').addEventListener('change', function () {
        if (this.checked) {
            subtractionReversedMultiplication = true;
            document.getElementById('subtraction-options').style.display = "none";
        }
        else {
            subtractionReversedMultiplication = false;
            document.getElementById('subtraction-options').style.display = "block";
        }
    });
    document.getElementById('division-reverse-toggle').addEventListener('change', function () {
        if (this.checked) {
            divisionReversedMultiplication = true;
            document.getElementById('division-options').style.display = "none";
        }
        else {
            divisionReversedMultiplication = false;
            document.getElementById('division-options').style.display = "block";
        }
    });
});
