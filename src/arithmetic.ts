
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

    // find gcd using Euclid's algorithm

    const gcd = (a: number, b: number): number => {
      while (b != 0){
        const temp = b;
        b = a % b;
        a = temp;
      }
      return a;
    };

    const addFracs = (num1: number, den1: number, num2: number, den2: number): number => (num1*den2 + num2*den1)/(den1*den2);

    // generate a random integer between the bounds
    const generateInt = (lowerBound: number, upperBound: number): number => Math.floor(Math.random()*(upperBound - lowerBound)) + lowerBound;

    // generate a random decimal with the given conditions
    const generateDec = (lowerBound: number, upperBound: number, decimalPlaces: number): number => {
      const num = Math.random()*(upperBound - lowerBound) + lowerBound;
      return parseFloat(num.toFixed(decimalPlaces));
    };

    // generate a random fraction
    // at the moment the numerator and denominator are always at most 9, and the denominator is at least 2
    const generateFrac = (): number[] => {
      let numerator: number;
      let denominator: number;
      do {
        numerator = generateInt(1,9);
        denominator = generateInt(2,9);
      } while (gcd(numerator, denominator) !== 1);
      return [numerator, denominator];
    };


    // Generate a random question
    const generateQuestion = (): { question: string; questiontype: string; answer: number } => {
        let num1: number;
        let num2: number;

        // choose a random operation based on the ones that are enabled
        const opernum = Math.floor(Math.random() * oper.length);
        const thisoper = oper[opernum];
        const opername = thisoper[0];
        const operstr = thisoper[1];
        let myType: string;

        if (opername === "add") {

          // choose a random number type
          myType = addTypes[Math.floor(Math.random()*addTypes.length)];
          if (myType === "integer"){
            num1 = generateInt(addLeftMin, addLeftMax);
            num2 = generateInt(addRightMin, addRightMax);
          } else if (myType === "decimal"){
            num1 = generateDec(addLeftMin, addLeftMax, addDecimalPlaces);
            num2 = generateDec(addRightMin, addRightMax, addDecimalPlaces);
            return {
              question:`
              <math display="inline">${num1} ${operstr} ${num2} =</math>
            `, questiontype: myType,
              answer: parseFloat(operations[opername](num1, num2).toFixed(addDecimalPlaces))
            };
          } else if (myType === "fraction") {
            const frac1 = generateFrac();
            const frac2 = generateFrac();
            num1 = generateInt(addLeftMin, addLeftMax);
            num2 = generateInt(addRightMin, addRightMax);
            const offset1 = Math.floor(frac1[0]/frac1[1]);
            const offset2 = Math.floor(frac2[0]/frac2[1]);

            let mixedNum1 = num1 - offset1;
            let mixedNum2 = num2 - offset2;

//            return {question: `${generateFrac()} ${operstr}  ${generateFrac()}`, answer: 69};
            return {question: `<math display="inline">${mixedNum1 !== 0 ? mixedNum1 : ''}<mfrac><mi>${frac1[0]}</mi><mn>${frac1[1]}</mn></mfrac> <mphantom>-</mphantom> + ${mixedNum2 !== 0 ? mixedNum2 : ''}<mfrac><mi>${frac2[0]}</mi><mn>${frac2[1]}</mn></mfrac> <mphantom>-</mphantom> =</math> `, questiontype: "fraction", answer: num1 - offset1 + num2 - offset2 + addFracs(frac1[0], frac1[1], frac2[0], frac2[1])};
          }
        } else if (opername === "subtract")  {
          if (subtractionReversedAddition) {
            // the idea is to generate a fraction problem by generating an addition problem with the addition settings and then rearranging it into a subtraction problem
            console.log(addTypes);
            myType = addTypes[Math.floor(Math.random()*addTypes.length)];
            if (myType === "integer"){
              num1 = generateInt(addLeftMin, addLeftMax);
              num2 = generateInt(addRightMin, addRightMax);
              num1 = num1 + num2;
            } else if (myType === "decimal"){
              num1 = generateDec(addLeftMin, addLeftMax, addDecimalPlaces);
              num2 = generateDec(addRightMin, addRightMax, addDecimalPlaces);
              num1 = parseFloat((num1 + num2).toFixed(addDecimalPlaces));
              return {
                question:`
                <math display="inline">${num1} ${operstr} ${num2} =</math>
              `, questiontype: myType,
                answer: parseFloat(operations[opername](num1, num2).toFixed(addDecimalPlaces))
              };
            } else if (myType === "fraction") {
              const frac1 = generateFrac();
              const frac2 = generateFrac();
              num1 = generateInt(addLeftMin, addLeftMax);
              num2 = generateInt(addRightMin, addRightMax);
              num1 = num1 + num2;
              const offset1 = Math.floor(frac1[0]/frac1[1]);
              const offset2 = Math.floor(frac2[0]/frac2[1]);

//              let mixedNum1 = num1 - offset1 + frac1[0]/frac1[1];
//              let mixedNum2 = num2 - offset2 + frac2[0]/frac2[1];
              let mixedNum1 = num1 - offset1;
              let mixedNum2 = num2 - offset2;


  //            return {question: `${generateFrac()} ${operstr}  ${generateFrac()}`, answer: 69};
              return {question: `<math display="inline">${mixedNum1 !== 0 ? mixedNum1 : ''}<mfrac><mi>${frac1[0]}</mi><mn>${frac1[1]}</mn></mfrac> <mphantom>-</mphantom> - ${mixedNum2 !== 0 ? mixedNum2 : ''}<mfrac><mi>${frac2[0]}</mi><mn>${frac2[1]}</mn></mfrac> <mphantom>-</mphantom> =</math> `, questiontype: "fraction", answer: num1 - offset1 - num2 + offset2 + addFracs(frac1[0], frac1[1], -frac2[0], frac2[1])};
            }

          } else {
            // choose a random number type
            myType = addTypes[Math.floor(Math.random()*addTypes.length)];
            if (myType === "integer"){
              num1 = generateInt(addLeftMin, addLeftMax);
              num2 = generateInt(addRightMin, addRightMax);
            } else if (myType === "decimal"){
              num1 = generateDec(addLeftMin, addLeftMax, addDecimalPlaces);
              num2 = generateDec(addRightMin, addRightMax, addDecimalPlaces);
              return {
                question:`
                <math display="inline">${num1} ${operstr} ${num2} =</math>
              `, questiontype: myType,
                answer: parseFloat(operations[opername](num1, num2).toFixed(addDecimalPlaces))
              };
            } else if (myType === "fraction") {
              const frac1 = generateFrac();
              const frac2 = generateFrac();
              num1 = generateInt(addLeftMin, addLeftMax);
              num2 = generateInt(addRightMin, addRightMax);
              const offset1 = Math.floor(frac1[0]/frac1[1]);
              const offset2 = Math.floor(frac2[0]/frac2[1]);
  //            return {question: `${generateFrac()} ${operstr}  ${generateFrac()}`, answer: 69};
              return {question: `<math display="inline">${num1 !== offset1 ? num1 - offset1 : ''}<mfrac><mi>${frac1[0]}</mi><mn>${frac1[1]}</mn></mfrac> <mphantom>-</mphantom> + ${num2 !== offset2 ? num2 - offset2 : ''}<mfrac><mi>${frac2[0]}</mi><mn>${frac2[1]}</mn></mfrac> <mphantom>-</mphantom> =</math> `, questiontype: "fraction", answer: num1 - offset1 + num2 - offset2 + addFracs(frac1[0], frac1[1], frac2[0], frac2[1])};
            }
          }
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
        `, questiontype: myType,
          answer: operations[opername](num1, num2)
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
        const { question, questiontype, answer } = generateQuestion();
        questionEl.innerHTML = question;
        correctAnswer = answer;
        questionType = questiontype;
        answerInput.value = "";
        answerInput.focus();
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
      console.log('bee booo');
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

    document.getElementById('fraction-addition-toggle').addEventListener('change', function(this: HTMLInputElement) {
      if (this.checked) {
        addFractions = true;
        console.log('we adding fractions baby');
      } else {
        addFractions = false;
        console.log('frick');
      }
    });

    // Subtraction and division being reversed versions of the addition and multiplication problems

    document.getElementById('subtraction-reverse-toggle').addEventListener('change', function(this: HTMLInputElement) {
      if (this.checked) {
        subtractionReversedAddition = true;
        document.getElementById('subtraction-options').style.display="none";
      } else {
        subtractionReversedAddition = false;
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

