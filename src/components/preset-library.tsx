import { useState } from "react";
import { PRESETS, PRESET_CATEGORIES, type Preset } from "@/lib/presets";
import styles from "./preset-library.module.css";
export function PresetLibrary({
  onSelect,
}: {
  onSelect: (preset: Preset) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [loaded, setLoaded] = useState("");
  const needle = query.trim().toLowerCase();
  const visible = PRESETS.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      `${p.name} ${p.description}`.toLowerCase().includes(needle),
  );
  return (
    <section
      id="preset-library"
      tabIndex={-1}
      className={`panel ${styles.library}`}
      aria-label="Preset library"
    >
      <div className="panel-heading">
        <h2>Preset library</h2>
        <span className="engine-label">20 STARTING POINTS</span>
      </div>
      <p className="limit-note">
        Load a complete example, then make it your own. No AI key required.
      </p>
      <div className={styles.filters}>
        <label>
          Search presets
          <input
            id="preset-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try email or dates"
          />
        </label>
        <label>
          Preset category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>All</option>
            {PRESET_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <button
          className="flag-button"
          onClick={() => {
            setQuery("");
            setCategory("All");
          }}
        >
          Reset filters
        </button>
      </div>
      <p className="limit-note" aria-live="polite">
        {visible.length} presets
        {loaded ? ` · Loaded ${loaded} into the playground.` : ""}
      </p>
      {visible.length === 0 ? (
        <p className={styles.empty}>
          No presets match your search and category. Reset filters to browse all
          20.
        </p>
      ) : (
        <div className={styles.cards}>
          {visible.map((p) => (
            <article key={p.id} className={styles.card}>
              <span className={styles.category}>{p.category}</span>
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <button
                className="flag-button"
                aria-label={`Load ${p.name}`}
                onClick={() => {
                  onSelect(p);
                  setLoaded(p.name);
                }}
              >
                Load pattern <span aria-hidden="true">↗</span>
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
