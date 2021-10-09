import { useState } from "react"

import { Atom } from "./type"
import { atomView } from "./atom"


export function useAtom<S>(init: S): Atom<S> {
  const [s, modify] = useState(init)

  return atomView(() => s, modify)
}
