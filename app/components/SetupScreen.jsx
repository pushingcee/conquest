"use client";

import { useState } from "react";
import { COLORS } from "../../data/provinceNames";

export default function SetupScreen({ onStart }) {
  const [numPlayers, setNumPlayers] = useState(2);
  const [names, setNames] = useState(["", "", "", ""]);
  
  const [importedProblems, setImportedProblems] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleNameChange = (i, value) => {
    const next = [...names];
    next[i] = value;
    setNames(next);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (!json.problems || !Array.isArray(json.problems)) {
          throw new Error('Invalid JSON format');
        }
        
        const valid = json.problems.every(p => p.question !== undefined && p.answer !== undefined);
        if (!valid) {
          throw new Error('Invalid JSON format');
        }
        
        setImportedProblems(json.problems);
      } catch (err) {
        setError('Невалиден JSON файл. Моля, проверете формата.');
        setImportedProblems(null);
        console.error('JSON parse error:', err);
      }
    };
    reader.onerror = () => setError('Грешка при четене на файла.');
    reader.readAsText(file);
  };

  const handleStart = () => {
    const playerNames = names.slice(0, numPlayers).map((n, i) =>
      n.trim() || `Играч ${i + 1}`
    );
    onStart(numPlayers, playerNames, importedProblems);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🏰 Завладей България!</h1>
      <p style={styles.subtitle}>Избери брой играчи:</p>
      <div style={styles.btnRow}>
        {[2, 3, 4].map((n) => (
          <button
            key={n}
            onClick={() => setNumPlayers(n)}
            style={{
              ...styles.numBtn,
              backgroundColor: numPlayers === n ? "#3b82f6" : "#e2e8f0",
              color: numPlayers === n ? "#fff" : "#334155",
            }}
          >
            {n}
          </button>
        ))}
      </div>
      <div style={styles.inputs}>
        {Array.from({ length: numPlayers }).map((_, i) => (
          <div key={i} style={styles.inputRow}>
            <span
              style={{
                ...styles.dot,
                backgroundColor: COLORS[i].primary,
              }}
            />
            <input
              style={styles.input}
              placeholder={`Играч ${i + 1}`}
              value={names[i]}
              onChange={(e) => handleNameChange(i, e.target.value)}
              maxLength={12}
            />
          </div>
        ))}
      </div>
      
      <div style={styles.uploadContainer}>
        <p style={{ fontWeight: 600, marginBottom: 8, color: "var(--ed-text, #2c2825)", fontSize: 16 }}>Зареди задачи:</p>
        <p style={{ marginBottom: 12, fontSize: 14, color: "var(--ed-text-dim, #6b6560)" }}>Качи JSON файл (по избор)</p>
        <input 
          type="file" 
          accept=".json" 
          onChange={handleFileUpload} 
          className="w-full max-w-xs text-sm text-black file:mr-3 file:rounded file:border-0 file:bg-[#3730a3] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white file:cursor-pointer hover:file:bg-[#312e81]"
        />
        {fileName && !error && (
          <p style={{ color: "#16a34a", fontSize: 14, marginTop: 8, fontWeight: 500 }}>
            ✅ Заредени са {importedProblems?.length} задачи от {fileName}
          </p>
        )}
        {error && <p style={{ color: "#dc2626", fontSize: 14, marginTop: 8, fontWeight: 500 }}>{error}</p>}
      </div>

      <button style={styles.startBtn} onClick={handleStart}>
        Започни!
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
    fontSize: 36,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#475569",
    marginBottom: 12,
  },
  btnRow: {
    display: "flex",
    gap: 12,
    marginBottom: 24,
  },
  numBtn: {
    width: 48,
    height: 48,
    borderRadius: 8,
    border: "none",
    fontSize: 20,
    fontWeight: 700,
    cursor: "pointer",
  },
  inputs: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 24,
  },
  inputRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: "50%",
    flexShrink: 0,
  },
  input: {
    padding: "8px 12px",
    fontSize: 16,
    borderRadius: 6,
    border: "1px solid #cbd5e1",
    width: 200,
    outline: "none",
  },
  uploadContainer: {
    marginBottom: 24,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "white",
    padding: "16px 24px",
    borderRadius: 12,
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    border: "1px dashed #cbd5e1"
  },
  startBtn: {
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
