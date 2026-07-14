const fs = require('fs');

function generateQuestion() {
  const tier = Math.random();
  let a, b, op, answer;

  if (tier < 0.33) {
    a = Math.floor(Math.random() * 20) + 1;
    b = Math.floor(Math.random() * 20) + 1;
    if (Math.random() < 0.5) {
      op = "+";
      answer = a + b;
    } else {
      if (a < b) [a, b] = [b, a];
      op = "\u2212";
      answer = a - b;
    }
  } else if (tier < 0.66) {
    if (Math.random() < 0.5) {
      a = Math.floor(Math.random() * 50) + 10;
      b = Math.floor(Math.random() * 50) + 10;
      if (Math.random() < 0.5) {
        op = "+";
        answer = a + b;
      } else {
        if (a < b) [a, b] = [b, a];
        op = "\u2212";
        answer = a - b;
      }
    } else {
      a = Math.floor(Math.random() * 10) + 2;
      b = Math.floor(Math.random() * 10) + 2;
      op = "\u00d7";
      answer = a * b;
    }
  } else {
    a = Math.floor(Math.random() * 12) + 3;
    b = Math.floor(Math.random() * 12) + 3;
    op = "\u00d7";
    answer = a * b;
  }

  const text = `${a} ${op} ${b}`;

  return {
    text,
    answer: answer ? answer.toString() : "undefined_answer",
    raw_answer: answer
  };
}

for (let i=0; i<50; i++) {
  console.log(generateQuestion());
}
