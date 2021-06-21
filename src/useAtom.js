import { useState, memo as reactMemo } from "react"
import * as R from "ramda"

import * as Sym from "./symbol"


export function useAtom(x) {
  const [value, over] = useState(x)

  return atom(value, over)
}

function atom(value, over) {
  function view(...sLens) {
    const lens = fromSLens(sLens)

    return atom(R.view(lens, value), R.compose(over, R.over(lens)))
  }
  function set(x) {
    over(R.always(x))
  }
  function remove() {
    return set(undefined)
  }

  return { [Sym.atom]: Sym.atom, value, view, set, over, remove }
}

function fromSLens(sLens) {
  if (typeof sLens === "number") {
    return R.lens(R.nth(sLens), (a, s) => a === undefined
      ? R.remove(sLens, 1, s)
      : R.update(sLens, a, s)
    )
  } else if (typeof sLens === "string") {
    return R.lens(R.prop(sLens), (a, s) => a === undefined
      ? R.dissoc(sLens, s)
      : R.assoc(sLens, a, s)
    )
  } else if (Array.isArray(sLens)) {
    return R.apply(R.compose, R.map(fromSLens, sLens))
  } else {
    return sLens
  }
}
