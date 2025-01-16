// Basic TypeScript setup for a mental arithmetic game

document.addEventListener("DOMContentLoaded", () => {
//    const startButton = document.getElementById("start-game") as HTMLButtonElement;
    const startButtons = document.querySelectorAll<HTMLButtonElement>(".start-game");
    const gameDiv = document.getElementById("game") as HTMLDivElement;
    const endDiv = document.getElementById("ending") as HTMLDivElement;
    const settingsForm = document.getElementById("settings") as HTMLFormElement;
    const questionEl = document.getElementById("question") as HTMLParagraphElement;
    const answerInput = document.getElementById("answer") as HTMLInputElement;
    const submitButton = document.getElementById("submit-answer") as HTMLButtonElement;
    const timerEl = document.getElementById("timer") as HTMLSpanElement;
    const scoreEl = document.getElementById("score") as HTMLSpanElement;
    const endScoreEl = document.getElementById("endScore") as HTMLSpanElement;

    let additionMinRange = 1;
    let additionMaxRange = 99;
    let multiplicationMinRange = 1;
    let multiplicationMaxRange = 99;

    let timeLimit = 120;
    let timer: number;
    let score = 0;
    let correctAnswer = 0;


    // Button stuff

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
 


    type Operation = (a: number, b: number) => number;

    const operations: Record<string, Operation> = {
        add: (a, b) => a + b,
        subtract: (a, b) => a - b,
        multiply: (a, b) => a * b,
        divide: (a, b) => a / b,
    };


    // Generate a random question
    const generateQuestion = (): { question: string; answer: number } => {
        const opernum = Math.floor(Math.random() * 3) + 1;
        const oper = ['+', '-', '*', '/'][opernum];
        let num1: number;
        let num2: number;
        if (oper === "+" || oper === "-"){
          num1 = Math.floor(Math.random() * (additionMaxRange - additionMinRange + 1)) + additionMinRange;
          num2 = Math.floor(Math.random() * (additionMaxRange - additionMinRange + 1)) + additionMinRange;
        } else {
          num1 = Math.floor(Math.random() * (multiplicationMaxRange - multiplicationMinRange + 1)) + multiplicationMinRange;
          num2 = Math.floor(Math.random() * (multiplicationMaxRange - multiplicationMinRange + 1)) + multiplicationMinRange;
        }
        if (oper === "/") {
          return { question: `${num1 * num2} / ${num1}`, answer: num2 };
        }
        return { question: `${num1} ${oper} ${num2}`, answer: operations[['add', 'subtract', 'multiply', 'divide'][opernum]](num1,num2) };
    };

    // Start the game
    const startGame = () => {
        const addMinRangeInput = (document.getElementById("addition-min-range") as HTMLInputElement).value;
        const addMaxRangeInput = (document.getElementById("addition-max-range") as HTMLInputElement).value;
        const mulMinRangeInput = (document.getElementById("multiplication-min-range") as HTMLInputElement).value;
        const mulMaxRangeInput = (document.getElementById("multiplication-max-range") as HTMLInputElement).value;
        const timeLimitInput = (document.getElementById("time-limit") as HTMLInputElement).value;

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
        questionEl.textContent = question;
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
    // startButton.addEventListener("click", startGame);
    startButtons.forEach((button) => {
      button.addEventListener("click", startGame);
    });
    submitButton.addEventListener("click", checkAnswer);

    answerInput.addEventListener("input", () => {
      checkAnswer();
    });

//    answerInput.addEventListener("keyup", (event) => {
//        if (event.key === "Enter") {
//            checkAnswer();
//        }
//    });


});

