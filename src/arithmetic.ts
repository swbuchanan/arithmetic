
document.addEventListener("DOMContentLoaded", () => {
    const startButtons = document.querySelectorAll<HTMLButtonElement>(".start-game");
    const gameDiv = document.getElementById("game") as HTMLDivElement;
    const endDiv = document.getElementById("ending") as HTMLDivElement;
    const settingsForm = document.getElementById("settings") as HTMLFormElement;
    const questionEl = document.getElementById("question") as HTMLParagraphElement;
    const answerInput = document.getElementById("answer") as HTMLInputElement;
//    const submitButton = document.getElementById("submit-answer") as HTMLButtonElement;
    const timerEl = document.getElementById("timer") as HTMLSpanElement;
    const scoreEl = document.getElementById("score") as HTMLSpanElement;
    const endScoreEl = document.getElementById("endScore") as HTMLSpanElement;


    // set default values

    let addLeftMin = 1;
    let addLeftMax = 99;
    let addRightMin = 1;
    let addRightMax = 99;

    let subLeftMin = 1;
    let subLeftMax = 99;
    let subRightMin = 1;
    let subRightMax = 99;

    let mulLeftMin = 2;
    let mulLeftMax = 12;
    let mulRightMin = 2;
    let mulRightMax = 12;

    let divLeftMin = 1;
    let divLeftMax = 100;
    let divRightMin = 1;
    let divRightMax = 10;

    let addIntegers = true;
    let mulIntegers = true;
    let subIntegers = true;
    let divIntegers = true;

    let addDecimals = false;
    let mulDecimals = false;
    let subDecimals = false;
    let divDecimals = false;

    let addFractions = false;
    let mulFractions = false;
    let subFractions = false;
    let divFractions = false;

    let addTypes = [];
    let subTypes = [];
    let mulTypes = [];
    let divTypes = [];

    let addDecimalPlaces = 2;
    let subDecimalPlaces = 2;
    let mulDecimalPlaces = 2;
    let divDecimalPlaces = 2;


    let timeLimit = 120;
    let timer: number;
    let score = 0;
    let correctAnswer = 0;

    let additionProblems = true;
    let subtractionProblems = true;
    let multiplicationProblems = true;
    let divisionProblems = true;

    let divisionReversedMultiplication = true;
    let subtractionReversedMultiplication = true;

    let oper = [];

    type Operation = (a: number, b: number) => number;

    const operations: Record<string, Operation> = {
        add: (a, b) => a + b,
        subtract: (a, b) => a - b,
        multiply: (a, b) => a * b,
        divide: (a, b) => a / b,
    };

    const setActiveOperations = () => {
      oper = [];
      if (additionProblems) {
        oper.push(['add', "+"]);
      }
      if (subtractionProblems) {
        oper.push(['subtract','−']);
      }
      if (multiplicationProblems) {
        oper.push(['multiply','×']);
      }
      if (divisionProblems) {
        oper.push(['divide','÷']);
      }
      console.log(`Active operations: ${oper}`);
    };

    const setActiveProblemTypes = () => {
      addTypes = [];
      subTypes = [];
      mulTypes = [];
      divTypes = [];
      
      let bools = [[addIntegers, addDecimals, addFractions],
                [subIntegers, subDecimals, subFractions],
                [mulIntegers, mulDecimals, mulFractions],
                [divIntegers, divDecimals, divFractions]];
      let names = ["integer", "decimal", "fraction"];

      [addTypes, subTypes, mulTypes, divTypes].forEach((types, index) => {
        bools[index].forEach((bool, jndex) => {
          if (bool) {
            types.push(names[jndex]);
          }
        });
      });
      console.log(addTypes);
    };

    // generate a random integer between the bounds
    const generateInt = (lowerBound: number, upperBound: number): number => {
      return Math.floor(Math.random()*(upperBound - lowerBound)) + lowerBound;
    };

    // generate a random decimal with the given conditions
    const generateDec = (lowerBound: number, upperBound: number, decimalPlaces: number): number => {
      const num = Math.random()*(upperBound - lowerBound) + lowerBound;
      return parseFloat(num.toFixed(decimalPlaces));
    };

    // generate a random fraction
    const generateFrac = ()


    // Generate a random question
    const generateQuestion = (): { question: string; answer: number } => {
        let num1: number;
        let num2: number;

        // choose a random operation based on the ones that are enabled
        const opernum = Math.floor(Math.random() * oper.length);
        const thisoper = oper[opernum];
        const opername = thisoper[0];
        const operstr = thisoper[1];


        if (opername === "add") {

          // choose a random number type
          const type = addTypes[Math.floor(Math.random()*addTypes.length)];
          if (type === "integer"){
            num1 = generateInt(addLeftMin, addLeftMax);
            num2 = generateInt(addRightMin, addRightMax);
          } else if (type === "decimal"){
            num1 = generateDec(addLeftMin, addLeftMax, addDecimalPlaces);
            num2 = generateDec(addRightMin, addRightMax, addDecimalPlaces);
          } else if (type === "fraction") {
            
          }
        } else if (opername === "subtract")  {
          num1 = generateInt(subLeftMin, subLeftMax);
          num2 = generateInt(subRightMin, subRightMax);
        } else if (opername === "multiply") {
          num1 = generateInt(mulLeftMin, mulLeftMax);
          num2 = generateInt(mulRightMin, mulRightMax);
        } else if (opername === 'divide') {
          num1 = generateInt(divLeftMin, divLeftMax);
          num2 = generateInt(divRightMin, divRightMax);
          num1 = num1*num2;
        }

        // Format this into some nice math

        console.log(operations[opername](num1,num2));
        return {
          question:`
          <math display="inline">${num1} ${operstr} ${num2} =</math>
        `, answer: operations[opername](num1, num2)
        };

    };

    // Start the game
    const startGame = () => {
        const addLeftMinInput = (document.getElementById("addition-left-min") as HTMLInputElement).value;
        const addLeftMaxInput = (document.getElementById("addition-left-max") as HTMLInputElement).value;
        const addRightMinInput = (document.getElementById("addition-right-min") as HTMLInputElement).value;
        const addRightMaxInput = (document.getElementById("addition-right-max") as HTMLInputElement).value;

        const subLeftMinInput = (document.getElementById("subtraction-left-min") as HTMLInputElement).value;
        const subLeftMaxInput = (document.getElementById("subtraction-left-max") as HTMLInputElement).value;
        const subRightMinInput = (document.getElementById("subtraction-right-min") as HTMLInputElement).value;
        const subRightMaxInput = (document.getElementById("subtraction-right-max") as HTMLInputElement).value;

        const mulLeftMinInput = (document.getElementById("multiplication-left-min") as HTMLInputElement).value;
        const mulLeftMaxInput = (document.getElementById("multiplication-left-max") as HTMLInputElement).value;
        const mulRightMinInput = (document.getElementById("multiplication-right-min") as HTMLInputElement).value;
        const mulRightMaxInput = (document.getElementById("multiplication-right-max") as HTMLInputElement).value;

        const divLeftMinInput = (document.getElementById("division-left-min") as HTMLInputElement).value;
        const divLeftMaxInput = (document.getElementById("division-left-max") as HTMLInputElement).value;
        const divRightMinInput = (document.getElementById("division-right-min") as HTMLInputElement).value;
        const divRightMaxInput = (document.getElementById("division-right-max") as HTMLInputElement).value;

        const timeLimitInput = (document.getElementById("time-limit") as HTMLInputElement).value;

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
    const startTimer = () => {
        let timeLeft = timeLimit;
        timerEl.textContent = timeLeft.toString();

        timer = window.setInterval(() => {
            timeLeft--;
            timerEl.textContent = timeLeft.toString();

            if (timeLeft <= 0) {
                clearInterval(timer);
                endGame();
            }
        }, 1000);
    };

    // Load the next question
    const loadNextQuestion = () => {
        const { question, answer } = generateQuestion();
        questionEl.innerHTML = question;
        correctAnswer = answer;
        answerInput.value = "";
        answerInput.focus();
    };

    // Check the answer
    const checkAnswer = () => {
        const userAnswer = parseFloat(answerInput.value);
        if (userAnswer === correctAnswer) {
            score++;
            scoreEl.textContent = score.toString();
            endScoreEl.textContent = score.toString();
            loadNextQuestion();
        } else {
            //answerInput.value = "";
            answerInput.focus();
        }
    };

    // End the game
    const endGame = () => {
        // alert(`Time's up! Your final score is ${score}.`);
        gameDiv.style.display = "none";
        endDiv.style.display = "block";
        settingsForm.style.display = "none";
    };

    // Event listeners

    startButtons.forEach((button) => {
      button.addEventListener("click", startGame);
    });
    // submitButton.addEventListener("click", checkAnswer);

    answerInput.addEventListener("input", () => {
      checkAnswer();
    });

    // Operations

    document.getElementById('addition-toggle').addEventListener('change', function(this: HTMLInputElement){
      if (this.checked) {
        additionProblems = true;
      } else {
        additionProblems = false;
      }
      setActiveOperations();
    });

    document.getElementById('subtraction-toggle').addEventListener('change', function(this: HTMLInputElement){
      if (this.checked) {
        subtractionProblems = true;
      } else {
        subtractionProblems = false;
      }
      setActiveOperations();
    });

    document.getElementById('multiplication-toggle').addEventListener('change', function(this: HTMLInputElement){
      if (this.checked) {
        multiplicationProblems = true;
      } else {
        multiplicationProblems = false;
      }
      setActiveOperations();
    });

    document.getElementById('division-toggle').addEventListener('change', function(this: HTMLInputElement){
      if (this.checked) {
        divisionProblems = true;
      } else {
        divisionProblems = false;
      }
      setActiveOperations();
    });


    // NUMBER TYPES

    // Integers for addition
    document.getElementById('integer-addition-toggle')!.addEventListener('change', function(this: HTMLInputElement) {
      if (this.checked) {
        addIntegers = true;
      } else {
        addIntegers = false;
      }
      setActiveProblemTypes();
    });

    // Integers for subtraction
    document.getElementById('integer-subtraction-toggle')!.addEventListener('change', function(this: HTMLInputElement) {
      if (this.checked) {
        subIntegers = true;
      } else {
        subIntegers = false;
      }
      setActiveProblemTypes();
    });

    // Integers for multiplication
    document.getElementById('integer-multiplication-toggle')!.addEventListener('change', function(this: HTMLInputElement) {
      if (this.checked) {
        mulIntegers = true;
      } else {
        mulIntegers = false;
      }
      setActiveProblemTypes();
    });

    // Integers for division
    document.getElementById('integer-division-toggle')!.addEventListener('change', function(this: HTMLInputElement) {
      if (this.checked) {
        divIntegers = true;
      } else {
        divIntegers = false;
      }
      setActiveProblemTypes();
    });


    // Decimals

    // Addition
    document.getElementById('decimal-addition-toggle')!.addEventListener('change', function(this: HTMLInputElement) {
      var element1 = document.getElementById('decimal-addition-amount');
      var element2 = document.getElementById('decimal-addition-display');
      if (this.checked) {
        console.log("click");
        element1.style.display = 'inline';  // Show the element
        element2.style.display = 'inline';  // Show the element
        addDecimals = true;
      } else {
        element1.style.display = 'none';  // Show the element
        element2.style.display = 'none';  // Show the element
        addDecimals = false;
      }
      setActiveProblemTypes();
    });

    // Addition decimal places
    document.getElementById('decimal-addition-amount').addEventListener('input', function(this: HTMLInputElement) {
      addDecimalPlaces = parseInt(this.value);
      console.log(addDecimalPlaces);
    });


    // Multiplication decimal toggle
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

    // Subtraction and division being reversed versions of the addition and multiplication problems

    document.getElementById('subtraction-reverse-toggle').addEventListener('change', function(this: HTMLInputElement) {
      if (this.checked) {
        subtractionReversedMultiplication = true;
        document.getElementById('subtraction-options').style.display="none";
      } else {
        subtractionReversedMultiplication = false;
        document.getElementById('subtraction-options').style.display="block";
      }
    });

    document.getElementById('division-reverse-toggle').addEventListener('change', function(this: HTMLInputElement) {
      if (this.checked) {
        divisionReversedMultiplication = true;
        document.getElementById('division-options').style.display="none";
      } else {
        divisionReversedMultiplication = false;
        document.getElementById('division-options').style.display="block";
      }
    });

});

