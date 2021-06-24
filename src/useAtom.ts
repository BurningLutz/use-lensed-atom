import { useState } from "react"
import { Lens } from "ramda"
import * as R from "ramda"

import * as Sym from "./symbol"
import { Atom, Over } from "./type"


export function useAtom<S>(s: S): Atom<S> {
  const [value, over] = useState(s)

  return atom(() => value, over)
}

function atom<S>(get: () => S, over: Over<S>): Atom<S> {
  function set(s: S) {
    over(() => s)
  }
  function v<A>(lens: Lens<S, A>): Atom<A> {
    return atom(() => R.view(lens, get()), R.compose(over, R.over(lens)))
  }

  return {
    [Sym.atom]: Sym.atom,
    get: R.memoizeWith(R.always(""), get),
    set,
    v,
    over,
  }
}
