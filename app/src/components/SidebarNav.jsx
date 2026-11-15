"use client";

/* Submenu sidebar nav — a port of the Framer "Submenu Sidebar Nav" component
   (submenu-sidebar-nav.framer.website) used as the app's section rail.

   Behaviour carried over from the reference: a slim left rail of primary
   entries; entries that own sub-pages grow a chevron and open a flyout panel
   to the right of the rail, where the children are grouped under small caps
   headings. One flyout at a time, Escape closes, and moving between top-level
   entries swaps the flyout without a flicker.

   The rail also handles the responsive case: below the mobile breakpoint it
   collapses into a sheet that slides over the app (same component, `sheet`
   prop), so navigation markup stays in one place. */

import { useEffect, useRef, useState } from "react";

const Chevron = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export default function SidebarNav({
  groups = [],
  active,
  onChange,
  sheet = false,
  onClose,
  footer = null,
  header = null,
  className = "",
}) {
  const [openKey, setOpenKey] = useState(null);
  const wrapRef = useRef(null);

  /* Escape closes the flyout, then the sheet — outermost first so a single
     key never dismisses two layers at once. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setOpenKey((k) => {
        if (k) return null;
        onClose?.();
        return null;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* click-outside closes the flyout */
  useEffect(() => {
    if (!openKey) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpenKey(null);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [openKey]);

  const pick = (entry) => {
    if (entry.children?.length) {
      setOpenKey((k) => (k === entry.k ? null : entry.k));
      return;
    }
    onChange?.(entry.k);
    setOpenKey(null);
    onClose?.();
  };

  return (
    <div
      ref={wrapRef}
      className={"sbn" + (sheet ? " sheet" : "") + (className ? " " + className : "")}
    >
      {sheet && (
        <div className="sbn-sheet-top">
          <span className="sbn-sheet-title">Sections</span>
          <button className="sbn-min" onClick={onClose} aria-label="close nav">−</button>
        </div>
      )}
      {header}

      <div className="sbn-rail" role="navigation" aria-label="Primary">
        {groups.map((entry) => {
          const on = entry.k === active;
          const expanded = openKey === entry.k;
          return (
            <div className="sbn-entry" key={entry.k}>
              <button
                type="button"
                className={"sbn-item" + (on ? " on" : "") + (expanded ? " open" : "")}
                onClick={() => pick(entry)}
                aria-current={on ? "page" : undefined}
                aria-expanded={entry.children?.length ? expanded : undefined}
              >
                <span className="sbn-ico">{entry.icon}</span>
                <span className="sbn-label">{entry.label}</span>
                {entry.children?.length ? <span className="sbn-chev">{Chevron}</span> : null}
              </button>

              {expanded && (
                <div className="sbn-flyout" role="menu">
                  <div className="sbn-fly-head">
                    <span className="sbn-fly-kicker">{entry.label}</span>
                    {entry.hint && <span className="sbn-fly-hint">{entry.hint}</span>}
                  </div>
                  <div className="sbn-cols">
                    {(entry.children || []).map((col) => (
                      <div className="sbn-col" key={col.label}>
                        <span className="sbn-col-head">{col.label}</span>
                        {col.items.map((it) => (
                          <button
                            key={it.k}
                            type="button"
                            role="menuitem"
                            className="sbn-child"
                            onClick={() => { onChange?.(it.k); setOpenKey(null); onClose?.(); }}
                          >
                            <span>{it.label}</span>
                            {it.note && <em>{it.note}</em>}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {footer && <div className="sbn-foot">{footer}</div>}
    </div>
  );
}
