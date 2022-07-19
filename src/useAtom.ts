import { useState } from "react"

import { id } from "./optic"
import { AtomLens } from "./atom"


export function useAtom<S>(init: S): AtomLens<S> {
  const [s, modify] = useState(init)

  return AtomLens(() => s, modify, id())
}
