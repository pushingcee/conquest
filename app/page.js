"use client";

import { useState, useCallback } from "react";
import SetupScreen from "./components/SetupScreen";
import BulgariaMap from "./components/BulgariaMap";
import QuestionModal from "./components/QuestionModal";
import ScoreBoard from "./components/ScoreBoard";
import GameOverScreen from "./components/GameOverScreen";
import { NAMES, COLORS } from "../data/provinceNames";

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
    answer: answer.toString(),
  };
}

export default function Home() {
  const [phase, setPhase] = useState("setup");
  const [players, setPlayers] = useState([]);
  const [numPlayers, setNumPlayers] = useState(2);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [round, setRound] = useState(1);
  const [turnsThisRound, setTurnsThisRound] = useState(0);
  const [ownership, setOwnership] = useState({});
  const [hearts, setHearts] = useState({});
  const [question, setQuestion] = useState(null);
  const [targetProvince, setTargetProvince] = useState(null);
  const [message, setMessage] = useState("");
  const [importedProblems, setImportedProblems] = useState(null);

  const handleStart = useCallback((num, names, problems) => {
    setNumPlayers(num);
    setPlayers(names);
    setImportedProblems(problems || null);
    setPhase("hearts");
    setCurrentPlayer(0);
    setMessage(`${names[0]}, избери база (🏰)!`);
  }, []);

  const handleProvinceClick = useCallback(
    (nuts3) => {
      if (phase === "hearts") {
        const newHearts = { ...hearts, [nuts3]: currentPlayer };
        const newOwnership = { ...ownership, [nuts3]: currentPlayer };
        setHearts(newHearts);
        setOwnership(newOwnership);

        const nextPlayer = currentPlayer + 1;
        if (nextPlayer >= numPlayers) {
          setPhase("play");
          setCurrentPlayer(0);
          setRound(1);
          setTurnsThisRound(0);
          setMessage(`${players[0]}, твой ред!`);
        } else {
          setCurrentPlayer(nextPlayer);
          setMessage(`${players[nextPlayer]}, избери база (🏰)!`);
        }
      } else if (phase === "play") {
        setTargetProvince(nuts3);
        
        if (importedProblems && importedProblems.length > 0) {
          const randomIndex = Math.floor(Math.random() * importedProblems.length);
          const p = importedProblems[randomIndex];
          setQuestion({ text: p.question, answer: p.answer.toString() });
        } else {
          setQuestion(generateQuestion());
        }
        
        setPhase("question");
      }
    },
    [phase, hearts, ownership, currentPlayer, numPlayers, players, importedProblems]
  );

  const handleAnswer = useCallback(
    (correct) => {
      const provinceName = NAMES[targetProvince] || targetProvince;

      let newOwnership = ownership;
      if (correct) {
        newOwnership = { ...ownership, [targetProvince]: currentPlayer };
        setOwnership(newOwnership);
        setMessage(`✅ ${players[currentPlayer]} завладя ${provinceName}!`);
      } else {
        setMessage(`❌ ${players[currentPlayer]} не успя.`);
      }

      setQuestion(null);
      setTargetProvince(null);

      const nextTurns = turnsThisRound + 1;
      if (nextTurns >= numPlayers) {
        const nextRound = round + 1;
        if (nextRound > 10) {
          setPhase("gameover");
          if (correct) setOwnership(newOwnership);
          return;
        }
        setRound(nextRound);
        setTurnsThisRound(0);
        setCurrentPlayer(0);
        setPhase("play");
        setTimeout(() => {
          setMessage(`Рунд ${nextRound} — ${players[0]}, твой ред!`);
        }, 50);
      } else {
        const nextPlayer = (currentPlayer + 1) % numPlayers;
        setTurnsThisRound(nextTurns);
        setCurrentPlayer(nextPlayer);
        setPhase("play");
        setTimeout(() => {
          setMessage(`${players[nextPlayer]}, твой ред!`);
        }, 50);
      }
    },
    [ownership, currentPlayer, players, turnsThisRound, numPlayers, round, targetProvince]
  );

  const handleRestart = useCallback(() => {
    setPhase("setup");
    setPlayers([]);
    setOwnership({});
    setHearts({});
    setQuestion(null);
    setTargetProvince(null);
    setImportedProblems(null);
    setRound(1);
    setTurnsThisRound(0);
    setCurrentPlayer(0);
    setMessage("");
  }, []);

  if (phase === "setup") {
    return <SetupScreen onStart={handleStart} />;
  }

  if (phase === "gameover") {
    return (
      <GameOverScreen
        players={players}
        ownership={ownership}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div style={styles.container}>
      <ScoreBoard
        players={players}
        currentPlayer={currentPlayer}
        round={round}
        ownership={ownership}
        phase={phase}
      />
      {message && (
        <div
          style={{
            ...styles.messageBanner,
            backgroundColor:
              currentPlayer !== undefined
                ? COLORS[currentPlayer].light
                : "#e2e8f0",
          }}
        >
          {message}
        </div>
      )}
      <BulgariaMap
        ownership={ownership}
        hearts={hearts}
        currentPlayer={currentPlayer}
        phase={phase === "question" ? "disabled" : phase}
        onProvinceClick={handleProvinceClick}
      />
      {phase === "question" && question && (
        <QuestionModal question={question} onAnswer={handleAnswer} />
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    padding: "12px 16px",
    minHeight: "100vh",
    fontFamily: "system-ui, sans-serif",
    backgroundColor: "#f1f5f9",
  },
  messageBanner: {
    padding: "8px 20px",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    color: "#1e293b",
    textAlign: "center",
  },
};
