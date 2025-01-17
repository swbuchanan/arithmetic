
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
        console.log('addition');
      }
      if (subtractionProblems) {
        console.log('subtract');
        oper.push(['subtract','−']);
      }
      if (multiplicationProblems) {
        oper.push(['multiply','×']);
      }
      if (divisionProblems) {
        oper.push(['divide','÷']);
      }
      console.log("Update:");
      console.log(oper);
    }

    // Generate a random question
    const generateQuestion = (): { question: string; answer: number } => {
        let num1: number;
        let num2: number;

        // choose a random operation based on the ones that are enabled
        const opernum = Math.floor(Math.random() * oper.length);
        const thisoper = oper[opernum];
        const opername = thisoper[0];
        const operstr = thisoper[1];

        // make a fake dict with the bounds on the numbers

        if (opername === "add"){
          num1 = Math.floor(Math.random() * (addLeftMax - addLeftMin + 1)) + addLeftMin[0];
          num2 = Math.floor(Math.random() * (addRightMax - addRightMin + 1)) + addRightMin[0];
        } else {
          num1 = Math.floor(Math.random() * (mulLeftMax - mulLeftMin + 1)) + mulLeftMin[0];
          num2 = Math.floor(Math.random() * (mulRightMax - mulRightMin + 1)) + mulRightMin[0];
        }
        if (opername === 'divide') {
          return { question: `${num1 * num2} ÷ ${num1} =`, answer: num2 };
        }
//        return { question: `${num1} ${operstr} ${num2} =`, answer: operations[opername](num1,num2) };

        // Format this into some nice math

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
        const userAnswer = parseInt(answerInput.value);
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


    // Decimals
    document.getElementById('decimal-addition-toggle')!.addEventListener('change', function(this: HTMLInputElement) {
      var element1 = document.getElementById('decimal-addition-amount');
      var element2 = document.getElementById('decimal-addition-display');
      if (this.checked) {
        console.log("click");
        element1.style.display = 'inline';  // Show the element
        element2.style.display = 'inline';  // Show the element
      } else {
        element1.style.display = 'none';  // Show the element
        element2.style.display = 'none';  // Show the element
      }
    });

    document.getElementById('decimal-multiplication-toggle')!.addEventListener('change', function(this: HTMLInputElement) {
      var element1 = document.getElementById('decimal-multiplication-amount');
      var element2 = document.getElementById('decimal-addition-display');
      if (this.checked) {
        console.log("click");
        element1.style.display = 'inline';  // Show the element
        element2.style.display = 'inline';  // Show the element
      } else {
        element1.style.display = 'none';  // Show the element
        element2.style.display = 'none';  // Show the element
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

