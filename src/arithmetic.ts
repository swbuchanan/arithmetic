
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

    let additionMinRange = 1;
    let additionMaxRange = 99;
    let additionDecimalPlaces = 0;

    let multiplicationMinRange = 2;
    let multiplicationMaxRange = 12;

    let timeLimit = 120;
    let timer: number;
    let score = 0;
    let correctAnswer = 0;

    let additionProblems = true;
    let subtractionProblems = true;
    let multiplicationProblems = true;
    let divisionProblems = true;

    const oper = [];

    type Operation = (a: number, b: number) => number;

    const operations: Record<string, Operation> = {
        add: (a, b) => a + b,
        subtract: (a, b) => a - b,
        multiply: (a, b) => a * b,
        divide: (a, b) => a / b,
    };

    const setActiveOperations = () => {
      if (additionProblems) {
        oper.push(['add', "+"]);
        console.log('addition');
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
    }

    // Generate a random question
    const generateQuestion = (): { question: string; answer: number } => {
        const opernum = Math.floor(Math.random() * oper.length) + 1; // chooses a random operator
//        const oper = ['+', '−', '×', '÷'][opernum];
        const thisoper = oper[opernum];
        console.log(thisoper);
        const opername = thisoper[0];
        const operstr = thisoper[1];
        let num1: number;
        let num2: number;
        if (opername === "add" || opername === "subtract"){
          num1 = Math.floor(Math.random() * (additionMaxRange - additionMinRange + 1)) + additionMinRange;
          num2 = Math.floor(Math.random() * (additionMaxRange - additionMinRange + 1)) + additionMinRange;
        } else {
          num1 = Math.floor(Math.random() * (multiplicationMaxRange - multiplicationMinRange + 1)) + multiplicationMinRange;
          num2 = Math.floor(Math.random() * (multiplicationMaxRange - multiplicationMinRange + 1)) + multiplicationMinRange;
        }
        if (opername === 'divide') {
          return { question: `${num1 * num2} ÷ ${num1} =`, answer: num2 };
        }
        return { question: `${num1} ${oper} ${num2} =`, answer: operations[opername](num1,num2) };
    };

    // Start the game
    const startGame = () => {
        const addMinRangeInput = (document.getElementById("addition-min-range") as HTMLInputElement).value;
        const addMaxRangeInput = (document.getElementById("addition-max-range") as HTMLInputElement).value;
        const mulMinRangeInput = (document.getElementById("multiplication-min-range") as HTMLInputElement).value;
        const mulMaxRangeInput = (document.getElementById("multiplication-max-range") as HTMLInputElement).value;
        const timeLimitInput = (document.getElementById("time-limit") as HTMLInputElement).value;

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
        setActiveOperations();
      } else {
        additionProblems = false;
      }
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

});

