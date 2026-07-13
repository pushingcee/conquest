"use client";

import { useState, useEffect, useRef } from "react";
import { MathRenderer } from "@jahnchock/math-to-latex";
import "katex/dist/katex.min.css";

export default function QuestionModal({
  question,
  onAnswer,
  points,
  timeLeft,
  timerEnabled = false,
  isPaused = false,
  onTogglePause,
}) {
  const [answer, setAnswer] = useState("");
  const [useCustomKeyboard, setUseCustomKeyboard] = useState(false);
  const mathRef = useRef(null);
  const inputRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  // Detect if device has touch capability or is mobile
  useEffect(() => {
    const hasTouchScreen =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    const isMobileUA =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    // Show custom keyboard if: has touch OR small screen OR mobile user agent
    setUseCustomKeyboard(hasTouchScreen || isSmallScreen || isMobileUA);
  }, []);

  useEffect(() => {
    if (question) {
      setAnswer("");
      setSubmitted(false);
      setIsCorrect(null);
    }
  }, [question]);

  // Render math with MathRenderer
  useEffect(() => {
    if (mathRef.current && question?.text) {
      const problemText = question.text;
      const isPlainText = /^(tz|тз)/i.test(problemText.trim());

      if (isPlainText) {
        // Display as plain text without KaTeX formatting, removing the "tz" or "тз" prefix
        const textWithoutPrefix = problemText.replace(/^(tz|тз)\s*/i, "");
        mathRef.current.textContent = textWithoutPrefix;
        mathRef.current.style.whiteSpace = "normal";
        mathRef.current.style.wordWrap = "break-word";
      } else {
        try {
          // Use MathRenderer to convert and render the math expression
          const renderedHtml = MathRenderer.render(problemText);
          mathRef.current.innerHTML = renderedHtml;
        } catch (error) {
          console.error("KaTeX rendering error:", error);
          // Fallback to plain text
          mathRef.current.textContent = problemText;
        }
      }
    }
  }, [question]);

  const handleSubmit = () => {
    if (answer && !submitted) {
      setSubmitted(true);
      // Remove all whitespaces (including thousands separators) for a robust comparison
      const normalize = (str) => String(str).replace(/\s+/g, "").toLowerCase();

      const typed = normalize(answer);
      const expected = normalize(question.answer);

      const correct = typed === expected;

      setIsCorrect(correct);
      setTimeout(() => onAnswer(correct), 1200);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  // Custom keyboard handlers
  const handleKeyboardClick = (key) => {
    if (submitted) return;

    if (key === "backspace") {
      setAnswer((prev) => prev.slice(0, -1));
    } else if (key === "clear") {
      setAnswer("");
    } else if (key === "enter") {
      handleSubmit();
    } else {
      const newValue = answer + key;
      // Validating numbers and simple characters: we might want a looser validation if problems consist of string answers, but keeping the board-game logic is safer.
      if (newValue === "" || newValue === "-" || /^-?\d*\.?\d*$/.test(newValue)) {
        setAnswer(newValue);
      } else if (isNaN(question.answer)) {
        // Allow text input if original answer isn't a number
        setAnswer(newValue);
      }
    }
  };

  if (!question) return null;

  const KeyboardButton = ({ value, label, className = "" }) => (
    <button
      onClick={() => handleKeyboardClick(value)}
      className={`rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-4 text-xl font-bold text-white shadow-lg transition-all active:scale-95 active:shadow-md ${className}`}
    >
      {label || value}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="w-full max-w-[500px] animate-slide-in rounded-2xl bg-white p-6 text-center">
        <h2 className="mb-4 text-2xl font-bold text-black">Реши задачата</h2>
        {points !== undefined && (
          <div className="mb-3 inline-block rounded-lg bg-gradient-to-r from-purple-500 to-purple-700 px-6 py-2 text-xl font-bold text-white shadow-lg">
            Точки: {points}
          </div>
        )}
        <div className="my-4 flex items-center justify-center gap-2 text-2xl font-bold text-black">
          <div
            ref={mathRef}
            className="max-w-[350px] px-2 py-2 whitespace-normal break-words"
          ></div>
          <span className="shrink-0">= ?</span>
        </div>
        {timerEnabled && (
          <div className="my-2 flex items-center justify-center gap-3">
            <div className="text-xl text-red-500">
              Време: <span id="timer">{timeLeft}</span>s
            </div>
            {onTogglePause && (
              <button
                onClick={onTogglePause}
                className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 px-4 py-1.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
              >
                {isPaused ? "Продължи" : "Пауза"}
              </button>
            )}
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          inputMode={useCustomKeyboard ? "none" : "decimal"}
          value={answer || ""}
          onChange={(e) => {
            if (!useCustomKeyboard && !submitted) {
              const value = e.target.value;
              if (value === "" || value === "-" || /^-?\d*\.?\d*$/.test(value)) {
                setAnswer(value);
              } else if (isNaN(question.answer)) {
                setAnswer(value);
              }
            }
          }}
          onKeyPress={handleKeyPress}
          onFocus={(e) => {
            // Prevent native keyboard on mobile when custom keyboard is active
            if (useCustomKeyboard) {
              e.target.blur();
              e.preventDefault();
            }
          }}
          onClick={(e) => {
            // Prevent native keyboard on mobile when custom keyboard is active
            if (useCustomKeyboard) {
              e.preventDefault();
            }
          }}
          placeholder="Твоят отговор"
          autoFocus={!useCustomKeyboard}
          readOnly={useCustomKeyboard || submitted}
          className={`my-4 w-full max-w-[300px] rounded-lg border-2 p-3 text-center text-3xl font-bold focus:outline-hidden focus:ring-2 ${submitted
              ? isCorrect
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-red-500 bg-red-50 text-red-700"
              : "border-purple-500 bg-purple-50 text-black focus:border-purple-600 focus:ring-purple-500/20"
            }`}
        />

        {submitted && (
          <p className={`mb-4 text-xl font-bold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
            {isCorrect ? "✅ Правилно!" : "❌ Грешно!"}
          </p>
        )}

        {useCustomKeyboard && !submitted && (
          <div className="mx-auto mb-4 grid max-w-[320px] grid-cols-4 gap-2">
            <KeyboardButton value="1" />
            <KeyboardButton value="2" />
            <KeyboardButton value="3" />
            <KeyboardButton
              value="backspace"
              label="⌫"
              className="bg-gradient-to-br from-red-500 to-red-600"
            />

            <KeyboardButton value="4" />
            <KeyboardButton value="5" />
            <KeyboardButton value="6" />
            <KeyboardButton
              value="clear"
              label="C"
              className="bg-gradient-to-br from-orange-500 to-orange-600"
            />

            <KeyboardButton value="7" />
            <KeyboardButton value="8" />
            <KeyboardButton value="9" />
            <KeyboardButton value="-" label="−" />

            <KeyboardButton value="0" className="col-span-2" />
            <KeyboardButton value="." />
            <KeyboardButton
              value="enter"
              label="✓"
              className="bg-gradient-to-br from-green-500 to-green-600"
            />
          </div>
        )}

        {!useCustomKeyboard && !submitted && (
          <button
            onClick={handleSubmit}
            className="w-full rounded-full bg-gradient-to-br from-purple-500 to-purple-700 px-8 py-3 text-lg font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/40"
          >
            Потвърди
          </button>
        )}
      </div>
    </div>
  );
}
