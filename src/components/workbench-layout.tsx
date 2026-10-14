import { useEffect, useRef, useState, type ReactNode } from "react";
import { Braces, Library, ShieldCheck, X } from "lucide-react";
import { PresetLibrary } from "./preset-library";
import type { Preset } from "@/lib/presets";
import styles from "./workbench-layout.module.css";

export function WorkbenchLayout({
  children,
  onSelect,
  focusEditor,
}: {
  children: ReactNode;
  onSelect: (preset: Preset) => void;
  focusEditor: () => void;
}) {
  const [narrow, setNarrow] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const drawer = useRef<HTMLDialogElement>(null);
  const selected = useRef(false);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1025px)");
    const resize = () => {
      setNarrow(!media.matches);
      if (media.matches && drawer.current?.open) drawer.current.close();
    };
    resize();
    media.addEventListener("change", resize);
    return () => media.removeEventListener("change", resize);
  }, []);
  useEffect(() => {
    if (drawerOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      drawer.current?.showModal();
      drawer.current?.querySelector<HTMLInputElement>("input")?.focus();
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [drawerOpen]);
  function openLibrary() {
    if (window.matchMedia("(min-width: 1025px)").matches) {
      sidebar.current?.querySelector<HTMLInputElement>("input")?.focus();
      return;
    }
    selected.current = false;
    setDrawerOpen(true);
  }
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <a className="brand" href="/">
          <span className="brand-symbol">
            <Braces />
          </span>
          Regex<span>Lab</span>
          <small>BETA</small>
        </a>
        <div className={styles.headerActions}>
          <span className={styles.engine}>
            <span className="status-dot" /> JavaScript engine
          </span>
          <button
            ref={trigger}
            className={styles.libraryButton}
            onClick={openLibrary}
            aria-haspopup={narrow ? "dialog" : undefined}
            aria-expanded={narrow ? drawerOpen : undefined}
          >
            <Library size={16} />
            Preset library
          </button>
        </div>
      </header>
      <div className={styles.columns}>
        <main className={styles.main}>{children}</main>
        <aside
          ref={sidebar}
          className={styles.sidebar}
          aria-label="Preset sidebar"
        >
          {!narrow && <PresetLibrary onSelect={onSelect} />}
        </aside>
      </div>
      <dialog
        ref={drawer}
        className={styles.drawer}
        aria-label="Preset library drawer"
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              "button:not(:disabled), input, select, textarea, a[href]",
            ),
          );
          const first = controls[0];
          const last = controls.at(-1);
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onClose={() => {
          setDrawerOpen(false);
          if (selected.current) focusEditor();
          else trigger.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const rect = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < rect.left ||
              event.clientX > rect.right ||
              event.clientY < rect.top ||
              event.clientY > rect.bottom
            )
              event.currentTarget.close();
          }
        }}
      >
        <div className={styles.drawerHeader}>
          <span>YOUR STARTING POINT</span>
          <button
            aria-label="Close preset library"
            onClick={() => drawer.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        {narrow && drawerOpen && (
          <PresetLibrary
            idPrefix="drawer"
            onSelect={(preset) => {
              selected.current = true;
              drawer.current?.close();
              onSelect(preset);
            }}
          />
        )}
      </dialog>
      <p className={styles.privacy}>
        <ShieldCheck size={14} /> Private by default. Your playground test text
        stays in this browser.
      </p>
    </div>
  );
}
