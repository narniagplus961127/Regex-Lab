"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowRight, BookOpen, Braces, Check, ChevronDown, ChevronRight, CircleHelp, Code2, Copy, FlaskConical, FolderOpen, Hash, Library, LoaderCircle, LockKeyhole, Plus, Search, ShieldCheck, Sparkles, Terminal, Trash2, X, Zap, Bookmark, RotateCcw } from "lucide-react";
import { PRESETS, type Preset } from "@/lib/presets";
import { explainPattern, FLAG_OPTIONS, regexLiteral, type Example, type Mode, type TestResult } from "@/lib/regex";

type View = "playground" | "library" | "saved" | "reference";
type SavedPattern = { id: string; name: string; pattern: string; flags: string; mode: Mode; text: string; description: string };
type Explanation = { pattern: string; flags: string; mode: Mode; summary: string; caveats?: string[] };
const emptyResult: TestResult = { matches: [], examples: [], elapsed: 0, truncated: false };
const suggestions = ["Email addresses", "Dates in YYYY-MM-DD", "A strong password"];

export function Playground() {
  const [view, setView] = useState<View>("playground");
  const [generatorTab, setGeneratorTab] = useState<"ai" | "presets">("ai");
  const [detailTab, setDetailTab] = useState<"explanation" | "matches" | "code">("explanation");
  const [pattern, setPattern] = useState(PRESETS[0].pattern);
  const [flags, setFlags] = useState("g");
  const [mode, setMode] = useState<Mode>("find");
  const [text, setText] = useState(PRESETS[0].text);
  const [description, setDescription] = useState("");
  const [explanation, setExplanation] = useState<Explanation>({ pattern: PRESETS[0].pattern, flags: "g", mode: "find", summary: PRESETS[0].explanation });
  const [examples, setExamples] = useState<Example[]>([]);
  const [examplesOpen, setExamplesOpen] = useState(false);
  const [result, setResult] = useState<TestResult>(emptyResult);
  const [testing, setTesting] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [aiReady, setAiReady] = useState<boolean | null>(null);
  const [aiError, setAiError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All patterns");
  const [saved, setSaved] = useState<SavedPattern[]>([]);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState("");
  const [retryTest, setRetryTest] = useState(0);
  const overlayRef = useRef<HTMLPreElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const testRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const helpTriggerRef = useRef<HTMLButtonElement>(null);
  const saveTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/generate", { signal: controller.signal }).then(r => r.json()).then(data => setAiReady(data.configured === true)).catch(() => setAiReady(false));
    try {
      const items: unknown = JSON.parse(localStorage.getItem("regexlab.saved.v1") ?? "[]");
      if (Array.isArray(items)) setSaved(items.filter((item): item is SavedPattern => typeof item?.id === "string" && typeof item?.name === "string" && typeof item?.pattern === "string" && typeof item?.flags === "string" && typeof item?.text === "string" && typeof item?.description === "string" && ["find", "validate"].includes(item?.mode)).slice(0, 30));
    } catch { /* A denied or corrupt storage entry must not break the playground. */ }
    return () => { controller.abort(); abortRef.current?.abort(); };
  }, []);

  useEffect(() => {
    setTesting(true);
    setResult(emptyResult);
    let worker: Worker | undefined;
    let deadline: ReturnType<typeof setTimeout> | undefined;
    const delay = setTimeout(() => {
      try {
        worker = new Worker(new URL("../workers/regex.worker.ts", import.meta.url));
        deadline = setTimeout(() => {
          worker?.terminate();
          setResult({ ...emptyResult, error: "This pattern took too long. Simplify nested repetitions or use shorter test text." });
          setTesting(false);
        }, 1500);
        worker.onmessage = (event: MessageEvent<TestResult>) => {
          clearTimeout(deadline);
          setResult(event.data);
          setTesting(false);
          worker?.terminate();
        };
        worker.onerror = () => {
          clearTimeout(deadline);
          setResult({ ...emptyResult, error: "The testing worker could not start. Reload the page to retry." });
          setTesting(false);
          worker?.terminate();
        };
        worker.postMessage({ pattern, flags, mode, text, examples });
      } catch {
        setResult({ ...emptyResult, error: "Your browser could not start a testing worker." });
        setTesting(false);
      }
    }, 160);
    return () => { clearTimeout(delay); clearTimeout(deadline); worker?.terminate(); };
  }, [pattern, flags, mode, text, examples, retryTest]);

  useEffect(() => { if (!notice) return; const id = setTimeout(() => setNotice(""), 3500); return () => clearTimeout(id); }, [notice]);
  useEffect(() => { if (!copied) return; const id = setTimeout(() => setCopied(""), 2000); return () => clearTimeout(id); }, [copied]);

  const parts = useMemo(() => explainPattern(pattern), [pattern]);
  const filteredPresets = PRESETS.filter(p => (category === "All patterns" || p.category === category) && `${p.name} ${p.description}`.toLowerCase().includes(search.toLowerCase()));
  const currentExplanation = explanation.pattern === pattern && explanation.flags === flags && explanation.mode === mode;
  const passCount = result.examples.filter(e => e.passed).length;
  const groupCount = result.matches[0]?.groups.length ?? 0;
  const highlighted = useMemo(() => {
    const nodes: ReactNode[] = [];
    let lastIndex = 0;
    result.matches.forEach((match, index) => {
      if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
      if (match.value.length) nodes.push(<mark key={index} className={`match-highlight color-${index % 3}`} title={`Match ${index + 1}`}>{match.value}</mark>);
      else nodes.push(<span key={index} className="empty-match" title="Zero-length match" />);
      lastIndex = match.index + match.value.length;
    });
    nodes.push(text.slice(lastIndex));
    return nodes;
  }, [result.matches, text]);

  function loadPreset(preset: Preset) {
    const nextMode = preset.mode ?? "find";
    setPattern(preset.pattern); setFlags(preset.flags); setText(preset.text); setMode(nextMode);
    setDescription(preset.description); setExamples([]); setAiError("");
    setExplanation({ pattern: preset.pattern, flags: preset.flags, mode: nextMode, summary: preset.explanation });
    setView("playground"); setDetailTab("explanation");
    if (testRef.current) { testRef.current.scrollTop = 0; testRef.current.scrollLeft = 0; }
    if (overlayRef.current) { overlayRef.current.scrollTop = 0; overlayRef.current.scrollLeft = 0; }
    setNotice(`${preset.name} loaded`);
  }

  async function generate() {
    if (!description.trim() || generating) return;
    setAiError(""); setGenerating(true);
    const controller = new AbortController(); abortRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 45000);
    try {
      const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal, body: JSON.stringify({ description, mode, flags, examples: examples.map(({ text: exampleText, shouldMatch }) => ({ text: exampleText, shouldMatch })) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Generation failed. Please try again.");
      setPattern(data.pattern); setFlags(data.flags);
      setExplanation({ pattern: data.pattern, flags: data.flags, mode, summary: data.explanation, caveats: data.caveats });
      setDetailTab("explanation");
      setNotice("Pattern generated. Check it in the playground.");
    } catch (error) {
      setAiError(controller.signal.aborted ? "Generation timed out. Please try again." : error instanceof Error ? error.message : "Could not reach the generator.");
    } finally { clearTimeout(timeout); setGenerating(false); }
  }

  async function copy(value: string, label: string) {
    try { await navigator.clipboard.writeText(value); setCopied(label); }
    catch { setNotice("Clipboard unavailable. Select the text and copy it manually."); }
  }

  function patternForCopy() {
    // Validation is part of the exported pattern, so pasted code behaves like the playground.
    return mode === "validate" ? `^(?:${pattern})(?![\\s\\S])` : pattern;
  }

  function savePattern() {
    if (!saveName.trim()) return;
    const entry: SavedPattern = { id: crypto.randomUUID(), name: saveName.trim(), pattern, flags, mode, text, description };
    const next = [entry, ...saved].slice(0, 30);
    try { localStorage.setItem("regexlab.saved.v1", JSON.stringify(next)); setSaved(next); setSaveOpen(false); setSaveName(""); setNotice("Pattern saved in this browser"); }
    catch { setNotice("Browser storage is unavailable or full. Try copying your pattern."); }
  }

  function removeSaved(id: string) {
    const next = saved.filter(item => item.id !== id);
    try { localStorage.setItem("regexlab.saved.v1", JSON.stringify(next)); setSaved(next); }
    catch { setNotice("Could not update browser storage."); }
  }

  function loadSaved(item: SavedPattern) {
    setPattern(item.pattern); setFlags(item.flags); setMode(item.mode); setText(item.text); setDescription(item.description);
    setExamples([]); setAiError(""); setView("playground"); setExplanation({ pattern: "", flags: "", mode: "find", summary: "" }); setNotice(`${item.name} loaded`);
  }

  const nav = (id: View, label: string, icon: ReactNode, count?: number) => <button className={`nav-item ${view === id ? "active" : ""}`} onClick={() => { setView(id); setSearch(""); setCategory("All patterns"); }}>{icon}<span>{label}</span>{count !== undefined && <span className="nav-count">{count}</span>}{view === id && <span className="active-dot" />}</button>;
  const canCopy = !testing && !result.error;

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="/" aria-label="RegexLab home"><span className="brand-symbol"><Braces size={23} /></span>Regex<span className="brand-light">Lab</span><span className="beta">BETA</span></a>
      <div className="sidebar-section">WORKSPACE</div>
      <nav aria-label="Workspace navigation">
        {nav("playground", "Playground", <FlaskConical size={18} />)}
        {nav("library", "Pattern library", <Library size={18} />, PRESETS.length)}
        {nav("saved", "Saved patterns", <Bookmark size={18} />, saved.length)}
      </nav>
      <div className="sidebar-section tools-label">RESOURCES</div>
      {nav("reference", "Regex cheatsheet", <BookOpen size={18} />)}
      <button className="nav-item" ref={helpTriggerRef} onClick={() => setHelpOpen(true)}><CircleHelp size={18} /><span>How it works</span></button>
      <div className="sidebar-bottom">
        <div className="little-card"><span className="little-icon"><Zap size={17} /></span><strong>Less syntax. More building.</strong><p>Describe it. Test it. Make it yours.</p><button onClick={() => { setView("playground"); setGeneratorTab("ai"); }}>Create a pattern <ArrowRight size={14} /></button></div>
        <div className="sidebar-foot"><span className="status-dot" /> Built for curious minds <span className="version">v1.0</span></div>
      </div>
    </aside>

    <div className="main-shell">
      <header className="topbar"><div className="breadcrumb">Workspace <ChevronRight size={13} /><span>{({ playground: "Playground", library: "Pattern library", saved: "Saved patterns", reference: "Regex cheatsheet" })[view]}</span></div><div className="topbar-right"><span className="engine-label"><span className="js-badge">JS</span> JavaScript engine <ChevronDown size={12} /></span><span className="private-label"><LockKeyhole size={13} /> Local testing</span></div></header>
      <main>
        <div className="page-heading"><div><div className="eyebrow"><span /> YOUR REGEX WORKBENCH</div><h1>{({ playground: "Good patterns. Less guesswork.", library: "A head start for every pattern.", saved: "Your patterns, ready when you are.", reference: "A little syntax goes a long way." })[view]}</h1><p>{({ playground: "Turn plain English into regex. Test it live. Understand every match.", library: "Useful starting points for everyday tasks. Pick one and make it your own.", saved: "Your personal collection, saved locally in this browser.", reference: "The building blocks of JavaScript regular expressions, all in one place." })[view]}</p></div><span className="heading-badge"><ShieldCheck size={14} /> No sign-in needed</span></div>

        {view === "playground" && <>
          <div className="workspace-grid">
            <section className="panel generator-panel" aria-label="Pattern generator">
              <div className="generator-tabs"><button className={generatorTab === "ai" ? "selected" : ""} onClick={() => setGeneratorTab("ai")}><Sparkles size={15} /> AI generator</button><button className={generatorTab === "presets" ? "selected" : ""} onClick={() => setGeneratorTab("presets")}><Library size={15} /> Presets <span>{PRESETS.length}</span></button></div>
              {generatorTab === "ai" ? <div className="generator-content">
                <div className="section-kicker"><span className="number-label">01</span> DESCRIBE YOUR PATTERN</div>
                <h2>What do you want to match?</h2><p className="muted small">Plain English is all you need. Be as specific as you like.</p>
                <label className="sr-only" htmlFor="description">Describe your regex</label>
                <div className="prompt-box"><textarea id="description" maxLength={2000} value={description} onChange={e => { setDescription(e.target.value); setAiError(""); }} placeholder="e.g. Find email addresses in a block of text, including addresses with dots and plus signs…" /><span className="prompt-count">{description.length}/2000</span></div>
                <div className="suggestions-label">NEED A STARTING POINT?</div><div className="suggestions">{suggestions.map((suggestion, i) => <button key={suggestion} onClick={() => { setDescription(["Find common email addresses, including names with dots and plus signs.", "Find dates in YYYY-MM-DD format and capture the year, month, and day.", "Validate a password with at least 8 characters, an uppercase letter, a lowercase letter, and a digit."][i]); if (i === 2) setMode("validate"); }}><Plus size={11} />{suggestion}</button>)}</div>
                <label className="field-label" htmlFor="match-mode">MATCHING INTENT</label><div className="select-wrap"><select id="match-mode" value={mode} onChange={e => setMode(e.target.value as Mode)}><option value="find">Find matches in text</option><option value="validate">Validate the entire input</option></select><ChevronDown size={14} /></div>
                <div className="examples-box"><button className="examples-toggle" aria-expanded={examplesOpen} onClick={() => setExamplesOpen(!examplesOpen)}><span><Plus size={14} /> Add example checks {examples.length > 0 && <b>{examples.length}</b>}</span><ChevronDown className={examplesOpen ? "rotate" : ""} size={14} /></button>{examplesOpen && <div className="examples-content"><p className="small muted">Examples guide the AI and check its result. An empty input is also a valid example.</p>{examples.map(example => <div className="example-row" key={example.id}><select aria-label="Expected result" value={String(example.shouldMatch)} onChange={e => setExamples(examples.map(v => v.id === example.id ? { ...v, shouldMatch: e.target.value === "true" } : v))}><option value="true">Match</option><option value="false">No match</option></select><input aria-label="Example text" placeholder="Example text" maxLength={1000} value={example.text} onChange={e => setExamples(examples.map(v => v.id === example.id ? { ...v, text: e.target.value } : v))} /><button className="icon-button" aria-label="Remove example" onClick={() => setExamples(examples.filter(v => v.id !== example.id))}><X size={13} /></button></div>)}<button className="text-button" disabled={examples.length >= 20} onClick={() => setExamples([...examples, { id: crypto.randomUUID(), text: "", shouldMatch: true }])}><Plus size={13} /> Add example</button></div>}</div>
                <button className="generate-button" disabled={!description.trim() || generating} onClick={generate}>{generating ? <LoaderCircle size={17} className="spin" /> : <Sparkles size={17} />} {generating ? "Crafting your pattern…" : "Generate regex"}{!generating && <ArrowRight size={17} />}</button>
                {aiError && <div className="error-box" role="alert">{aiError}</div>}
                <p className="privacy-note"><LockKeyhole size={11} /> Only your description and example checks go to AI. Playground text stays in your browser.</p>
                {aiReady === false && <div className="setup-note"><span className="status-dot amber" /> AI needs a Groq key. Presets and the playground are ready to use.<button onClick={() => setHelpOpen(true)}>Setup details <ArrowRight size={12} /></button></div>}
                {aiReady === true && <div className="ai-status"><span className="status-dot" /> Powered by Groq <span>Ready to generate</span></div>}
              </div> : <div className="generator-content"><div className="section-kicker"><span className="number-label">01</span> START WITH A PRESET</div><h2>Skip the blank canvas.</h2><p className="muted small">Select a pattern to load it into your playground.</p><div className="compact-presets">{PRESETS.map(p => <button key={p.id} onClick={() => loadPreset(p)}><span className="preset-mini-icon"><Hash size={15} /></span><span><strong>{p.name}</strong><small>{p.description}</small></span><ArrowRight size={14} /></button>)}</div></div>}
              <div className="generator-footer"><Sparkles size={13} /> A starting point, perfected by you.</div>
            </section>

            <div className="testing-column">
              <section className="panel regex-panel" aria-label="Regex editor"><div className="panel-heading"><div><span className="number-label">02</span><h2>Your regular expression</h2></div><div className="editor-actions"><button ref={saveTriggerRef} className="icon-button" title="Save pattern" aria-label="Save pattern" disabled={!canCopy} onClick={() => { setSaveName(""); setSaveOpen(true); }}><Bookmark size={15} /></button><button className="copy-button" disabled={!canCopy} onClick={() => { try { void copy(regexLiteral(patternForCopy(), mode === "validate" ? flags.replace("g", "") : flags), "regex"); } catch { setNotice("Fix the pattern before copying."); } }}>{copied === "regex" ? <Check size={13} /> : <Copy size={13} />}{copied === "regex" ? "Copied" : "Copy regex"}</button></div></div><div className={`regex-input-shell ${result.error ? "has-error" : ""}`}><span className="delimiter">/</span><input aria-label="Regular expression" spellCheck={false} autoComplete="off" value={pattern} maxLength={2000} onChange={e => setPattern(e.target.value)} placeholder="Enter a regex pattern" /><span className="delimiter">/</span><span className="flags-display">{flags || "—"}</span></div><div className="flags-row"><span className="small muted">Flags</span>{FLAG_OPTIONS.map(option => <button key={option.flag} className={`flag-button ${flags.includes(option.flag) ? "on" : ""}`} aria-pressed={flags.includes(option.flag)} title={option.description} disabled={mode === "validate" && option.flag === "g"} onClick={() => setFlags(FLAG_OPTIONS.filter(o => o.flag === option.flag ? !flags.includes(o.flag) : flags.includes(o.flag)).map(o => o.flag).join(""))}><code>{option.flag}</code>{option.name}</button>)}</div>{mode === "validate" && <p className="validation-note">Whole-input mode adds strict boundaries when testing and copying. Global matching is ignored.</p>}</section>

              <section className="panel test-panel" aria-label="Live text playground"><div className="panel-heading"><div><span className="number-label">03</span><h2>Test your text</h2><span className="live-badge"><span className="status-dot" /> LIVE</span></div><button className="text-button" disabled={!text} onClick={() => setText("")}>Clear <Trash2 size={12} /></button></div><div className="test-toolbar"><span>PLAYGROUND</span><span><LockKeyhole size={11} /> Runs in your browser</span></div><div className="test-editor"><div className="line-numbers" ref={lineRef} aria-hidden="true">{text.split("\n").map((_, i) => <div key={i}>{i + 1}</div>)}</div><div className="text-layer"><pre className="highlight-overlay" ref={overlayRef} aria-hidden="true">{highlighted}{"\n"}</pre><textarea ref={testRef} aria-label="Playground test text" value={text} maxLength={30000} spellCheck={false} wrap="off" placeholder="Paste or type your test text here…" onChange={e => setText(e.target.value)} onScroll={e => { if (overlayRef.current) { overlayRef.current.scrollTop = e.currentTarget.scrollTop; overlayRef.current.scrollLeft = e.currentTarget.scrollLeft; } if (lineRef.current) lineRef.current.scrollTop = e.currentTarget.scrollTop; }} /></div></div><div className={`test-status ${result.error ? "status-error" : ""}`} aria-live="polite"><span>{testing ? <><LoaderCircle size={12} className="spin" /> Testing…</> : result.error ? <><X size={13} /> Pattern needs attention</> : <><span className="status-dot" /> {mode === "validate" ? result.matches.length ? "Entire input matches" : "Input does not match" : `${result.matches.length}${result.truncated ? "+" : ""} ${result.matches.length === 1 ? "match" : "matches"} found`}</>}</span><span>{text.length.toLocaleString()} characters <b>·</b> {!testing && !result.error ? `${result.elapsed.toFixed(2)} ms` : "JavaScript"}</span></div>{result.error && <div className="error-box test-error" role="alert">{result.error}<button className="text-button" onClick={() => setRetryTest(v => v + 1)}><RotateCcw size={12} /> Retry test</button></div>}</section>

              <section className="panel details-panel"><div className="detail-tabs" role="tablist" aria-label="Pattern details">{([{ id: "explanation", label: "Explanation", icon: <BookOpen size={14} /> }, { id: "matches", label: "Matches", icon: <Search size={14} /> }, { id: "code", label: "Use in code", icon: <Code2 size={14} /> }] as const).map(tab => <button role="tab" id={`tab-${tab.id}`} aria-controls={`panel-${tab.id}`} aria-selected={detailTab === tab.id} tabIndex={detailTab === tab.id ? 0 : -1} onKeyDown={e => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); const tabs = ["explanation", "matches", "code"] as const; const next = tabs[(tabs.indexOf(tab.id) + (e.key === "ArrowRight" ? 1 : 2)) % 3]; setDetailTab(next); document.getElementById(`tab-${next}`)?.focus(); } }} className={detailTab === tab.id ? "selected" : ""} onClick={() => setDetailTab(tab.id)} key={tab.id}>{tab.icon}{tab.label}{tab.id === "matches" && <span>{result.matches.length}</span>}</button>)}</div><div className="detail-content" role="tabpanel" id={`panel-${detailTab}`} aria-labelledby={`tab-${detailTab}`}>
                {detailTab === "explanation" && <><div className="explanation-title"><span className="explanation-icon"><Sparkles size={16} /></span><div><h3>Let’s break it down.</h3><p>{currentExplanation ? explanation.summary : "A syntax guide for your current pattern. Check the matches and examples to verify its behavior."}</p></div></div>{currentExplanation && explanation.caveats?.map((caveat, i) => <p key={i} className="caveat">{caveat}</p>)}<div className="pattern-parts">{parts.slice(0, 40).map((part, i) => <div className="pattern-part" key={i}><code>{part.token}</code><span>{part.meaning}</span></div>)}</div>{parts.length > 40 && <p className="small muted">Showing the first 40 tokens.</p>}<p className="small syntax-footnote">Token descriptions are a syntax reference. Complex escapes and quantifier interactions may need the cheatsheet.</p></>}
                {detailTab === "matches" && <><div className="matches-summary"><h3>{result.matches.length} matches <span>· {groupCount} capture groups per match</span></h3></div>{result.matches.length === 0 && <div className="empty-detail"><Search size={23} /><p>{testing ? "Testing your pattern…" : result.error ? "Fix the pattern to inspect matches." : "No matches yet. Try editing your pattern or test text."}</p></div>}<div className="matches-list">{result.matches.map((match, index) => <details key={index}><summary><span className="match-number">{index + 1}</span><code>{match.value || "(empty match)"}</code><span className="match-position">{match.index}–{match.index + match.value.length}</span><ChevronDown size={13} /></summary><div className="capture-content">{match.groups.length === 0 && <span className="small muted">No capture groups in this match.</span>}{match.groups.map((value, i) => <div key={i}><span>Group {i + 1}</span><code>{value ?? "(unmatched)"}</code></div>)}{Object.entries(match.namedGroups).map(([name, value]) => <div key={name}><span>{name}</span><code>{value ?? "(unmatched)"}</code></div>)}</div></details>)}</div>{result.truncated && <p className="small muted">Results capped at 500 matches.</p>}</>}
                {detailTab === "code" && <><h3>Take your pattern with you.</h3><p className="small muted">JavaScript · {mode === "find" ? "Find matches in a string" : "Validate the entire input"}</p><div className="code-block"><button className="icon-button" aria-label="Copy JavaScript code" disabled={!canCopy} onClick={() => void copy(`const regex = new RegExp(${JSON.stringify(patternForCopy())}, ${JSON.stringify(mode === "validate" ? flags.replace("g", "") : flags)});\nconst text = "your text here";\n${mode === "validate" ? "const match = regex.exec(text);\nconst isValid = match !== null && match.index === 0 && match[0].length === text.length;" : flags.includes("g") ? "const matches = [...text.matchAll(regex)];" : "const match = regex.exec(text);"}`, "code")}>{copied === "code" ? <Check size={14} /> : <Copy size={14} />}</button><pre>{`const regex = new RegExp(\n  ${JSON.stringify(patternForCopy())},\n  ${JSON.stringify(mode === "validate" ? flags.replace("g", "") : flags)}\n);\nconst text = "your text here";\n\n${mode === "validate" ? "const match = regex.exec(text);\nconst isValid = match !== null &&\n  match.index === 0 && match[0].length === text.length;" : flags.includes("g") ? "const matches = [...text.matchAll(regex)];" : "const match = regex.exec(text);"}`}</pre></div></>}
              </div></section>
              {examples.length > 0 && <section className="panel checks-panel"><div className="panel-heading"><h2>Example checks</h2><span className={`check-count ${passCount === examples.length && !testing && !result.error ? "all-pass" : ""}`}>{testing ? "Testing…" : result.error ? "Unable to check" : `${passCount}/${examples.length} passing`}</span></div>{examples.map(example => { const checked = result.examples.find(e => e.id === example.id); return <div className="check-row" key={example.id}><span className={checked?.passed ? "check-pass" : "check-fail"}>{testing ? <LoaderCircle size={13} className="spin" /> : checked?.passed ? <Check size={14} /> : <X size={14} />}</span><code>{example.text || "(empty input)"}</code><span>Should {example.shouldMatch ? "match" : "not match"}</span></div>; })}</section>}
            </div>
          </div>
          <div className="workspace-note"><span><Terminal size={13} /> Your browser is the playground. Your imagination is the limit.</span><button onClick={() => setView("reference")}>Keep the cheatsheet handy <ArrowRight size={13} /></button></div>
        </>}

        {view === "library" && <><div className="library-toolbar"><div className="search-field"><Search size={16} /><input aria-label="Search patterns" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patterns…" /></div><div className="categories">{["All patterns", "Everyday", "Data", "Code", "Validation"].map(c => <button key={c} className={category === c ? "selected" : ""} onClick={() => setCategory(c)}>{c}</button>)}</div></div><div className="preset-grid">{filteredPresets.map(p => <article className="panel preset-card" key={p.id}><div className="preset-card-top"><span className="preset-card-icon"><Hash size={20} /></span><span className="category-pill">{p.category}</span></div><h2>{p.name}</h2><p>{p.description}</p><code className="preset-code">/{p.pattern}/{p.flags}</code><button onClick={() => loadPreset(p)}>Open in playground <ArrowRight size={15} /></button></article>)}</div>{filteredPresets.length === 0 && <div className="empty-state"><Search size={35} /><h2>No patterns found</h2><p>Try a different search or category.</p><button className="secondary-button" onClick={() => { setSearch(""); setCategory("All patterns"); }}>Reset filters</button></div>}</>}
        {view === "saved" && <>{saved.length === 0 ? <div className="panel empty-state"><FolderOpen size={40} /><h2>A home for your best patterns.</h2><p>Save a pattern with the bookmark button in the editor.<br />It will be here when you come back to this browser.</p><button className="generate-button" onClick={() => setView("playground")}>Back to playground <ArrowRight size={15} /></button></div> : <div className="preset-grid">{saved.map(item => <article className="panel preset-card" key={item.id}><div className="preset-card-top"><Bookmark size={19} /><button className="icon-button" aria-label={`Delete ${item.name}`} onClick={() => removeSaved(item.id)}><Trash2 size={15} /></button></div><h2>{item.name}</h2><p>{item.mode === "find" ? "Find matches" : "Validate entire input"} · JavaScript</p><code className="preset-code">/{item.pattern}/{item.flags}</code><button onClick={() => loadSaved(item)}>Open in playground <ArrowRight size={15} /></button></article>)}</div>}</>}
        {view === "reference" && <div className="reference-grid">{[{ title: "Character classes", rows: [[".", "Any character except a newline"], ["\\d / \\D", "Digit / not a digit"], ["\\w / \\W", "Word character / not a word character"], ["\\s / \\S", "Whitespace / not whitespace"], ["[abc]", "One of a, b, or c"], ["[^abc]", "Anything except a, b, or c"], ["[a-z]", "A lowercase ASCII letter"]] }, { title: "Quantifiers", rows: [["*", "Zero or more"], ["+", "One or more"], ["?", "Zero or one"], ["{3}", "Exactly three"], ["{2,5}", "Between two and five"], ["{2,}", "Two or more"], ["+? / *?", "Lazy: prefer fewer repetitions"]] }, { title: "Groups & assertions", rows: [["(abc)", "Capture a group"], ["(?:abc)", "Group without capturing"], ["(?<name>abc)", "Capture a named group"], ["a|b", "Either a or b"], ["(?=abc)", "Positive lookahead"], ["(?!abc)", "Negative lookahead"], ["\\1", "Reuse the first captured value"]] }, { title: "Boundaries & flags", rows: [["^ / $", "Start / end of input (or line with m)"], ["\\b", "Word boundary"], ["g", "Find all matches"], ["i", "Ignore letter case"], ["m", "Line-aware ^ and $"], ["s", "Dot includes newlines"], ["u", "Unicode code point handling"]] }].map(section => <section className="panel reference-card" key={section.title}><h2><Braces size={17} />{section.title}</h2>{section.rows.map(([token, meaning]) => <div className="reference-row" key={token}><code>{token}</code><span>{meaning}</span></div>)}</section>)}<div className="panel reference-tip"><Zap size={19} /><div><h3>Finding isn’t the same as validating.</h3><p>A pattern like <code>\d+</code> finds <code>123</code> inside <code>Order 123</code>. Switch to whole-input validation when every character must satisfy the pattern.</p></div></div></div>}
        <footer className="page-footer"><span><Braces size={14} /> RegexLab <span className="footer-separator">/</span> A small tool for better patterns.</span><span>Made to match.</span></footer>
      </main>
    </div>
    {notice && <div className="toast" role="status"><Check size={15} />{notice}</div>}
    {saveOpen && <Modal title="Save this pattern" onClose={() => setSaveOpen(false)} returnFocus={saveTriggerRef}><p className="muted small">Give it a name. Your pattern and test text stay in this browser.</p><form onSubmit={e => { e.preventDefault(); savePattern(); }}><label className="field-label" htmlFor="save-name">PATTERN NAME</label><input className="modal-input" id="save-name" value={saveName} maxLength={60} onChange={e => setSaveName(e.target.value)} placeholder="e.g. Customer email addresses" autoFocus /><button type="submit" className="generate-button" disabled={!saveName.trim()}><Bookmark size={15} /> Save pattern</button></form></Modal>}
    {helpOpen && <Modal title="A pattern in three steps." onClose={() => setHelpOpen(false)} returnFocus={helpTriggerRef}><ol className="help-steps"><li><strong>Describe it.</strong><p>Tell the AI what you want to match, or load a preset. Add positive and negative examples for more precise results.</p></li><li><strong>Test it.</strong><p>Edit your regex and type in the playground. Matches update live. Choose whole-input mode for validation.</p></li><li><strong>Understand it.</strong><p>Read the explanation, inspect capture groups, then copy a regex or JavaScript snippet.</p></li></ol><div className="help-setup"><h3>Enable AI generation</h3><p>The app owner needs to set <code>GROQ_API_KEY</code> on the server, then restart or redeploy. Get a key from <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">Groq Console ↗</a>. Visitors never need to enter a key.</p></div><p className="small muted">Local testing uses a worker with a 1.5-second deadline. Descriptions and explicit example checks are sent to Groq; playground text is kept locally. AI results need testing.</p></Modal>}
  </div>;
}

function Modal({ title, children, onClose, returnFocus }: { title: string; children: ReactNode; onClose: () => void; returnFocus: { current: HTMLButtonElement | null } }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose); closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const oldOverflow = document.body.style.overflow; document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    (dialog?.querySelector<HTMLElement>("[autofocus], input, button") ?? dialog)?.focus();
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
      if (event.key === "Tab" && dialog) {
        const focusable = Array.from(dialog.querySelectorAll<HTMLElement>("button:not(:disabled), input, select, textarea, a[href], [tabindex='0']"));
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", handler);
    return () => { document.body.style.overflow = oldOverflow; document.removeEventListener("keydown", handler); (returnFocus.current ?? previous)?.focus(); };
  }, [returnFocus]);
  return <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}><div className="modal" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1}><div className="modal-heading"><h2 id="modal-title">{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={19} /></button></div>{children}</div></div>;
}
