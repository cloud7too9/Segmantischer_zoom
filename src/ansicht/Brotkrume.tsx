import type { Ort } from '../kern/pfad'

interface Glied {
  ort: Ort
  titel: string
}

export function Brotkrume({
  kette,
  aufSprung,
}: {
  kette: Glied[]
  aufSprung: (ort: Ort) => void
}) {
  return (
    <nav className="brotkrume" aria-label="Zoompfad">
      {kette.map((glied, i) => {
        const letzter = i === kette.length - 1
        return (
          <span key={i}>
            {i > 0 && <span className="brotkrume__trenner"> / </span>}
            <button
              type="button"
              className="brotkrume__glied"
              aria-current={letzter ? 'page' : undefined}
              disabled={letzter}
              onClick={() => aufSprung(glied.ort)}
            >
              {glied.titel}
            </button>
          </span>
        )
      })}
    </nav>
  )
}
