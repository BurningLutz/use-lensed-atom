import * as Sym from "./symbol"
import { Opt } from "./Opt"


// A modified version of `Object.is`
function is(x: any, y: any): boolean {
  if (x[Sym.atom] === Sym.atom && y[Sym.atom] === Sym.atom) {
    // WARN memoizing AtomTraversal seems to be weird here.
    x = x.view !== undefined ? x.view() : x.preview()
    y = y.view !== undefined ? y.view() : y.preview()
  }

  if (x === y) {
    return x !== 0 || 1 / x === 1 / y
  } else {
    return x !== x && y !== y
  }
}

export function shallowEqual(objA: any, objB: any): boolean {
  if (is(objA, objB)) {
    return true
  }

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i]) ||
      !is(objA[keysA[i]], objB[keysA[i]])
    ) {
      return false
    }
  }

  return true
}


export function settterAt<A>(k: number): (s: A[]) => (b: Opt<A>) => A[]
export function settterAt<A>(k: string): (s: Record<string, A>) => (b: Opt<A>) => Record<string, A>
export function settterAt<A>(k: number | string): ((s: A[]) => (b: Opt<A>) => A[]) | ((s: Record<string, A>) => (b: Opt<A>) => Record<string, A>) {
  if (typeof k === "number") {
    return (s: A[]) => (b: Opt<A>) => {
      const t = s.slice(0)

      if (b === undefined) {
        delete t[k]
      } else {
        t[k] = b
      }

      return t
    }
  } else {
    return (s: Record<string, A>) => (b: Opt<A>) => {
      const t = Object.assign({}, s)

      if (b === undefined) {
        delete t[k]
      } else {
        t[k] = b
      }

      return t
    }
  }
}


export function updateIx<A>(ix: number, x: A, xs: A[]): A[]
export function updateIx<A>(ix: string, x: A, xs: Record<string, A>): Record<string, A>
export function updateIx<A>(ix: number | string, x: A, xs: A[] | Record<string, A>): A[] | Record<string, A> {
  if (typeof ix === "number") {
    const xs_ = (xs as A[]).slice(0)
    xs_[ix]   = x

    return xs_
  } else {
    const xs_ = Object.assign({}, (xs as Record<string, A>))
    xs_[ix]   = x

    return xs_
  }
}
