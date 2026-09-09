import type { Inhalt } from '../kern/typen'

/** Rendert Kern oder Overlay — beide haben dieselbe Form (README Nr. 12). */
export function Inhaltsblock({ inhalt, marke }: { inhalt: Inhalt; marke?: string }) {
  return (
    <div className="inhalt">
      {marke && <span className="overlay-marke">{marke}</span>}
      {inhalt.text && <p className="inhalt__text">{inhalt.text}</p>}
      {inhalt.punkte && (
        <ul className="inhalt__punkte">
          {inhalt.punkte.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
      {inhalt.code && <pre className="codebox">{inhalt.code.quelltext}</pre>}
      {inhalt.warnung && <p className="hinweis">{inhalt.warnung}</p>}
    </div>
  )
}
