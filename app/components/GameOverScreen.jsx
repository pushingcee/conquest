"use client";

import { COLORS } from "../../data/provinceNames";

export default function GameOverScreen({ players, ownership, onRestart }) {
  const counts = players.map((_, pi) =>
    Object.values(ownership).filter((o) => o === pi).length
  );
  const maxCount = Math.max(...counts);
  const winners = counts.reduce(
    (acc, c, i) => (c === maxCount ? [...acc, i] : acc),
    []
  );

  const sorted = players
    .map((name, i) => ({ name, count: counts[i], index: i }))
    .sort((a, b) => b.count - a.count);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Играта свърши!</h1>
      <div style={styles.results}>
        {sorted.map(({ name, count, index }) => (
          <div
            key={index}
            style={{
              ...styles.row,
              borderLeft: `5px solid ${COLORS[index].primary}`,
            }}
          >
            <span style={styles.name}>
              {winners.includes(index) && "👑 "}
              {name}
            </span>
            <span style={styles.count}>{count} провинции</span>
          </div>
        ))}
      </div>
      {winners.length > 1 && (
        <p style={styles.tie}>Равенство!</p>
      )}
      <button style={styles.restartBtn} onClick={onRestart}>
        Нова игра 🔄
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    fontFamily: "system-ui, sans-serif",
    backgroundColor: "#f1f5f9",
  },
  title: {
    fontSize: 32,
    marginBottom: 24,
  },
  results: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 24,
    width: 300,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 16px",
    backgroundColor: "#fff",
    borderRadius: 8,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  name: {
    fontWeight: 600,
    fontSize: 18,
  },
  count: {
    fontSize: 16,
    color: "#475569",
  },
  tie: {
    fontSize: 20,
    fontWeight: 700,
    color: "#f59e0b",
    marginBottom: 16,
  },
  restartBtn: {
    padding: "12px 40px",
    fontSize: 20,
    fontWeight: 700,
    borderRadius: 10,
    border: "none",
    backgroundColor: "#3b82f6",
    color: "#fff",
    cursor: "pointer",
  },
};
