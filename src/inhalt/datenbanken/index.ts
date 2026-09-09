import type { Knoten } from '../../kern/typen'
import { arten } from './arten'
import { mongodb } from './mongodb'
import { postgresql } from './postgresql'
import { sqlite } from './sqlite'
import { weitereTraeger } from './weitere'

export { datenbanken } from './universum'

export const datenbankKnoten: Knoten[] = [
  ...arten,
  ...postgresql,
  ...sqlite,
  ...mongodb,
  ...weitereTraeger,
]
