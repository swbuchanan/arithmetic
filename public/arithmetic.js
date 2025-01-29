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
    // for measuring the response time
    var time = Date.now();
    var startTime = Date.now();
    var cumTime = 0;
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
    // whether or not to include integers in the addition, (resp. multiplication, div, etc) problems
    var addIntegers = true;
    var mulIntegers = true;
    var subIntegers = true;
    var divIntegers = true;
    // whether or not to include decimals in the addition, (resp. multiplication, div, etc) problems
    var addDecimals = false;
    var mulDecimals = false;
    var subDecimals = false;
    var divDecimals = false;
    // whether or not to include fractions in the addition, (resp. multiplication, div, etc) problems
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
    var questionType;
    var additionProblems = true;
    var subtractionProblems = true;
    var multiplicationProblems = true;
    var divisionProblems = true;
    var divisionReversedMultiplication = true;
    var subtractionReversedAddition = true;
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
        console.log("Active operations: ".concat(oper));
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
    // find gcd using Euclid's algorithm
    var gcd = function (a, b) {
        while (b != 0) {
            var temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    };
    var addFracs = function (num1, den1, num2, den2) { return (num1 * den2 + num2 * den1) / (den1 * den2); };
    // generate a random integer between the bounds
    var generateInt = function (lowerBound, upperBound) { return Math.floor(Math.random() * (upperBound - lowerBound)) + lowerBound; };
    // generate a random decimal with the given conditions
    var generateDec = function (lowerBound, upperBound, decimalPlaces) {
        var num = Math.random() * (upperBound - lowerBound) + lowerBound;
        return parseFloat(num.toFixed(decimalPlaces));
    };
    // generate a random fraction
    // at the moment the numerator and denominator are always at most 9, and the denominator is at least 2
    var generateFrac = function () {
        var numerator;
        var denominator;
        do {
            numerator = generateInt(1, 9);
            denominator = generateInt(2, 9);
        } while (gcd(numerator, denominator) !== 1);
        return [numerator, denominator];
    };
    // Generate a random question
    var generateQuestion = function () {
        var num1;
        var num2;
        // choose a random operation based on the ones that are enabled
        var opernum = Math.floor(Math.random() * oper.length);
        var thisoper = oper[opernum];
        var opername = thisoper[0];
        var operstr = thisoper[1];
        var myType;
        if (opername === "add") {
            // choose a random number type
            myType = addTypes[Math.floor(Math.random() * addTypes.length)];
            if (myType === "integer") {
                num1 = generateInt(addLeftMin, addLeftMax);
                num2 = generateInt(addRightMin, addRightMax);
            }
            else if (myType === "decimal") {
                num1 = generateDec(addLeftMin, addLeftMax, addDecimalPlaces);
                num2 = generateDec(addRightMin, addRightMax, addDecimalPlaces);
                return {
                    question: "\n              <math display=\"inline\">".concat(num1, " ").concat(operstr, " ").concat(num2, " =</math>\n            "), questiontype: myType,
                    answer: parseFloat(operations[opername](num1, num2).toFixed(addDecimalPlaces))
                };
            }
            else if (myType === "fraction") {
                var frac1 = generateFrac();
                var frac2 = generateFrac();
                num1 = generateInt(addLeftMin, addLeftMax);
                num2 = generateInt(addRightMin, addRightMax);
                var offset1 = Math.floor(frac1[0] / frac1[1]);
                var offset2 = Math.floor(frac2[0] / frac2[1]);
                var mixedNum1 = num1 - offset1;
                var mixedNum2 = num2 - offset2;
                //            return {question: `${generateFrac()} ${operstr}  ${generateFrac()}`, answer: 69};
                return { question: "<math display=\"inline\">".concat(mixedNum1 !== 0 ? mixedNum1 : '', "<mfrac><mi>").concat(frac1[0], "</mi><mn>").concat(frac1[1], "</mn></mfrac> <mphantom>-</mphantom> + ").concat(mixedNum2 !== 0 ? mixedNum2 : '', "<mfrac><mi>").concat(frac2[0], "</mi><mn>").concat(frac2[1], "</mn></mfrac> <mphantom>-</mphantom> =</math> "), questiontype: "fraction", answer: num1 - offset1 + num2 - offset2 + addFracs(frac1[0], frac1[1], frac2[0], frac2[1]) };
            }
        }
        else if (opername === "subtract") {
            if (subtractionReversedAddition) {
                // the idea is to generate a fraction problem by generating an addition problem with the addition settings and then rearranging it into a subtraction problem
                console.log(addTypes);
                myType = addTypes[Math.floor(Math.random() * addTypes.length)];
                if (myType === "integer") {
                    num1 = generateInt(addLeftMin, addLeftMax);
                    num2 = generateInt(addRightMin, addRightMax);
                    num1 = num1 + num2;
                }
                else if (myType === "decimal") {
                    num1 = generateDec(addLeftMin, addLeftMax, addDecimalPlaces);
                    num2 = generateDec(addRightMin, addRightMax, addDecimalPlaces);
                    num1 = parseFloat((num1 + num2).toFixed(addDecimalPlaces));
                    return {
                        question: "\n                <math display=\"inline\">".concat(num1, " ").concat(operstr, " ").concat(num2, " =</math>\n              "), questiontype: myType,
                        answer: parseFloat(operations[opername](num1, num2).toFixed(addDecimalPlaces))
                    };
                }
                else if (myType === "fraction") {
                    var frac1 = generateFrac();
                    var frac2 = generateFrac();
                    num1 = generateInt(addLeftMin, addLeftMax);
                    num2 = generateInt(addRightMin, addRightMax);
                    num1 = num1 + num2;
                    var offset1 = Math.floor(frac1[0] / frac1[1]);
                    var offset2 = Math.floor(frac2[0] / frac2[1]);
                    //              let mixedNum1 = num1 - offset1 + frac1[0]/frac1[1];
                    //              let mixedNum2 = num2 - offset2 + frac2[0]/frac2[1];
                    var mixedNum1 = num1 - offset1;
                    var mixedNum2 = num2 - offset2;
                    //            return {question: `${generateFrac()} ${operstr}  ${generateFrac()}`, answer: 69};
                    return { question: "<math display=\"inline\">".concat(mixedNum1 !== 0 ? mixedNum1 : '', "<mfrac><mi>").concat(frac1[0], "</mi><mn>").concat(frac1[1], "</mn></mfrac> <mphantom>-</mphantom> - ").concat(mixedNum2 !== 0 ? mixedNum2 : '', "<mfrac><mi>").concat(frac2[0], "</mi><mn>").concat(frac2[1], "</mn></mfrac> <mphantom>-</mphantom> =</math> "), questiontype: "fraction", answer: num1 - offset1 - num2 + offset2 + addFracs(frac1[0], frac1[1], -frac2[0], frac2[1]) };
                }
            }
            else {
                // choose a random number type
                myType = addTypes[Math.floor(Math.random() * addTypes.length)];
                if (myType === "integer") {
                    num1 = generateInt(addLeftMin, addLeftMax);
                    num2 = generateInt(addRightMin, addRightMax);
                }
                else if (myType === "decimal") {
                    num1 = generateDec(addLeftMin, addLeftMax, addDecimalPlaces);
                    num2 = generateDec(addRightMin, addRightMax, addDecimalPlaces);
                    return {
                        question: "\n                <math display=\"inline\">".concat(num1, " ").concat(operstr, " ").concat(num2, " =</math>\n              "), questiontype: myType,
                        answer: parseFloat(operations[opername](num1, num2).toFixed(addDecimalPlaces))
                    };
                }
                else if (myType === "fraction") {
                    var frac1 = generateFrac();
                    var frac2 = generateFrac();
                    num1 = generateInt(addLeftMin, addLeftMax);
                    num2 = generateInt(addRightMin, addRightMax);
                    var offset1 = Math.floor(frac1[0] / frac1[1]);
                    var offset2 = Math.floor(frac2[0] / frac2[1]);
                    //            return {question: `${generateFrac()} ${operstr}  ${generateFrac()}`, answer: 69};
                    return { question: "<math display=\"inline\">".concat(num1 !== offset1 ? num1 - offset1 : '', "<mfrac><mi>").concat(frac1[0], "</mi><mn>").concat(frac1[1], "</mn></mfrac> <mphantom>-</mphantom> + ").concat(num2 !== offset2 ? num2 - offset2 : '', "<mfrac><mi>").concat(frac2[0], "</mi><mn>").concat(frac2[1], "</mn></mfrac> <mphantom>-</mphantom> =</math> "), questiontype: "fraction", answer: num1 - offset1 + num2 - offset2 + addFracs(frac1[0], frac1[1], frac2[0], frac2[1]) };
                }
            }
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
        console.log("answer: ".concat(operations[opername](num1, num2)));
        return {
            question: "\n          <math display=\"inline\">".concat(num1, " ").concat(operstr, " ").concat(num2, " =</math>\n        "), questiontype: myType,
            answer: operations[opername](num1, num2)
        };
    };
    // Start the game
    var startGame = function () {
        startTime = Date.now();
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
        var _a = generateQuestion(), question = _a.question, questiontype = _a.questiontype, answer = _a.answer;
        questionEl.innerHTML = question;
        correctAnswer = answer;
        questionType = questiontype;
        answerInput.value = "";
        answerInput.focus();
        // console.log(Date.now());
        time = Date.now();
        console.log("loaded a question in ".concat(time - startTime, " ms"));
    };
    // Check the answer
    var checkAnswer = function () {
        var userAnswer;
        if (questionType === "fraction") {
            // parse a mixed fraction like 1 1/2 into a decimal
            var frac = answerInput.value.split(' ');
            if (frac.length > 2) { // wrong answer, keep trying
                answerInput.focus();
            }
            else if (frac.length === 1) { // just a simple fraction
                frac = frac[0].split('/');
                userAnswer = parseInt(frac[0]) / parseInt(frac[1]);
                console.log("Useranswer: ".concat(userAnswer));
                console.log("correct answer: ".concat(correctAnswer));
            }
            else if (frac.length === 2) { // mixed number
                var fracPart = frac[1].split('/'); // TODO: this needs to be fixed in the case of bad user input
                userAnswer = parseInt(frac[0]) + parseInt(fracPart[0]) / parseInt(fracPart[1]);
            }
        }
        else {
            // if the question is a decimal or an integar
            userAnswer = parseFloat(answerInput.value);
        }
        if (userAnswer === correctAnswer) {
            var temptime = Date.now() - time; // this is the time from when the last question was loaded
            console.log("time taken: ".concat(temptime));
            cumTime += temptime;
            console.log("cumulative time: ".concat(cumTime));
            console.log("actual elapsed time: ".concat(temptime + time - startTime));
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
        console.log(answerInput.value);
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
    /* this is commented out because for now because I couldn't be bothered to implement decimal and fraction multiplication because who cares anyway
    document.getElementById('integer-multiplication-toggle')!.addEventListener('change', function(this: HTMLInputElement) {
      if (this.checked) {
        console.log('toggle multiplication integers');
        mulIntegers = true;
      } else {
        mulIntegers = false;
      }
      setActiveProblemTypes();
    });
   */
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
        console.log(addDecimalPlaces);
    });
    // Multiplication decimal toggle
    /*
    document.getElementById('decimal-multiplication-toggle')!.addEventListener('change', function(this: HTMLInputElement) {
      var element1 = document.getElementById('decimal-multiplication-amount');
      var element2 = document.getElementById('decimal-multiplication-display');
      if (this.checked) {
        console.log("click");
        element1.style.display = 'inline';  // Show the element
        element2.style.display = 'inline';  // Show the element
        mulDecimals = true;
      } else {
        element1.style.display = 'none';  // Show the element
        element2.style.display = 'none';  // Show the element
        mulDecimals = false;
      }
    });
   */
    // Fractions
    // Fraction addition toggle
    document.getElementById('fraction-addition-toggle').addEventListener('change', function () {
        if (this.checked) {
            addFractions = true;
        }
        else {
            addFractions = false;
        }
    });
    // Subtraction and division being reversed versions of the addition and multiplication problems
    document.getElementById('subtraction-reverse-toggle').addEventListener('change', function () {
        if (this.checked) {
            subtractionReversedAddition = true;
            document.getElementById('subtraction-options').style.display = "none";
        }
        else {
            subtractionReversedAddition = false;
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
