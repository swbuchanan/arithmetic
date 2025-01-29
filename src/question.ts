
export class Question {
  questionString: string;
  questionType: string;
  answer: number;
  /*
  questionString is what's put into the html
  questionType is addition,

  */


  setActiveOperations(): void {
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


  // Generate a random question
  const generateQuestion = (): { question: string; questiontype: string; answer: number } => {

  constructor (question: string, questi
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

      console.log(`answer: ${operations[opername](num1,num2)}`);
      return {
        question:`
        <math display="inline">${num1} ${operstr} ${num2} =</math>
      `, questiontype: myType,
        answer: operations[opername](num1, num2)
      };

  };

}
