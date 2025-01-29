import { Question } from "./question";

document.addEventListener("DOMContentLoaded", () => {
    
    // for measuring the response time
    let time = Date.now();
    let startTime = Date.now()
    let cumTime = 0;


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

    // whether or not to include integers in the addition, (resp. multiplication, div, etc) problems
    let addIntegers = true;
    let mulIntegers = true;
    let subIntegers = true;
    let divIntegers = true;

    // whether or not to include decimals in the addition, (resp. multiplication, div, etc) problems
    let addDecimals = false;
    let mulDecimals = false;
    let subDecimals = false;
    let divDecimals = false;

    // whether or not to include fractions in the addition, (resp. multiplication, div, etc) problems
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
    let questionType: string;

    let additionProblems = true;
    let subtractionProblems = true;
    let multiplicationProblems = true;
    let divisionProblems = true;

    let divisionReversedMultiplication = true;
    let subtractionReversedAddition = true;

    let oper = [];

    // Start the game
    const startGame = () => {
        startTime = Date.now();
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
        const { question, questiontype, answer } = generateQuestion();
        questionEl.innerHTML = question;
        correctAnswer = answer;
        questionType = questiontype;
        answerInput.value = "";
        answerInput.focus();
        // console.log(Date.now());
        time = Date.now();
        console.log(`loaded a question in ${time - startTime} ms`);
    };

    // Check the answer
    const checkAnswer = () => {
      let userAnswer: number;
      if (questionType === "fraction") {
        // parse a mixed fraction like 1 1/2 into a decimal
        let frac = answerInput.value.split(' ');
        if (frac.length > 2) { // wrong answer, keep trying
          answerInput.focus()
        } else if (frac.length === 1) { // just a simple fraction
          frac = frac[0].split('/');
          userAnswer = parseInt(frac[0])/parseInt(frac[1]);
          console.log(`Useranswer: ${userAnswer}`);
          console.log(`correct answer: ${correctAnswer}`);
        } else if (frac.length === 2) { // mixed number
          let fracPart = frac[1].split('/'); // TODO: this needs to be fixed in the case of bad user input
          userAnswer = parseInt(frac[0]) + parseInt(fracPart[0])/parseInt(fracPart[1]);
        }
      } else {
        // if the question is a decimal or an integar
        userAnswer = parseFloat(answerInput.value);
      }
      if (userAnswer === correctAnswer) {
          let temptime = Date.now() - time; // this is the time from when the last question was loaded
          console.log(`time taken: ${temptime}`);
          cumTime += temptime;
          console.log(`cumulative time: ${cumTime}`);
          console.log(`actual elapsed time: ${temptime + time - startTime}`);
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
      console.log(answerInput.value);
      checkAnswer();
    });

    // Operations


});

