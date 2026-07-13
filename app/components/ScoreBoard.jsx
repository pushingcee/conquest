"use client";

import { COLORS } from "../../data/provinceNames";

export default function ScoreBoard({
  players,
  currentPlayer,
  round,
  ownership,
  phase,
}) {
  const counts = players.map((_, pi) =>
    Object.values(ownership).filter((o) => o === pi).length
  );

  return (
    <div style={styles.bar}>
      <span style={styles.round}>
        {phase === "hearts" ? "Избор на бази" : `Рунд ${round}/10`}
      </span>
      {players.map((name, i) => {
        const isCurrent = i === currentPlayer;
        return (
          <span
            key={i}
            style={{
              ...styles.player,
              backgroundColor: isCurrent ? COLORS[i].primary : "transparent",
              color: isCurrent ? "#fff" : "#334155",
              fontWeight: isCurrent ? 700 : 400,
            }}
          >
            {isCurrent && "▶ "}
            {name} {counts[i]} 🏴
          </span>
        );
      })}
    </div>
  );
}

const styles = {
  bar: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "8px 16px",
    backgroundColor: "#fff",
    borderRadius: 8,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  round: {
    fontWeight: 700,
    fontSize: 15,
    color: "#1e293b",
    marginRight: 8,
  },
  player: {
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 14,
    whiteSpace: "nowrap",
  },
};
