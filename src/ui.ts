import { Game } from "./game";
import { Timer } from "./timer";
import { Settings } from "./settings";

export class UI {


  private startButtons:NodeListOf<HTMLButtonElement>;
  private gameDiv:HTMLDivElement;
  private endDiv:HTMLDivElement;
  private settingsForm:HTMLFormElement;
  private questionEl:HTMLParagraphElement;
  private answerInput:HTMLInputElement;
  private timerEl:HTMLSpanElement;
  private scoreEl:HTMLSpanElement;
  private endScoreEl:HTMLSpanElement;

  constructor(game: Game, timer: Timer) {
    this.game = game;
    this.startButtons = document.querySelectorAll<HTMLButtonElement>(".start-game");
    this.gameDiv = document.getElementById("game") as HTMLDivElement;
    this.endDiv = document.getElementById("ending") as HTMLDivElement;
    this.settingsForm = document.getElementById("settings") as HTMLFormElement;
    this.questionEl = document.getElementById("question") as HTMLParagraphElement;
    this.answerInput = document.getElementById("answer") as HTMLInputElement;
    this.timerEl = document.getElementById("timer") as HTMLSpanElement;
    this.scoreEl = document.getElementById("score") as HTMLSpanElement;
    this.endScoreEl = document.getElementById("endScore") as HTMLSpanElement;


  }

  private createUI(): void {

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
      } else {
        addFractions = false;
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

  }

}
