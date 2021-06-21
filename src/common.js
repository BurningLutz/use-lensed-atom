import * as Sym from "./symbol"


// A modified version of `Object.is`
export function is(x, y) {
  if (x[Sym.atom] === Sym.atom && y[Sym.atom] === Sym.atom) {
    x = x.value
    y = y.value
  }

  if (x === y) {
    return x !== 0 || 1 / x === 1 / y
  } else {
    return x !== x && y !== y
  }
}

export function shallowEqual(objA, objB) {
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
      !hasOwnProperty.call(objB, keysA[i]) ||
      !is(objA[keysA[i]], objB[keysA[i]])
    ) {
      return false
    }
  }

  return true
}
