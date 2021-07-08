import fc from "fast-check"
import * as R from "ramda"

import { lift, lift_, f, i } from "../src/index"


describe("lift creates a lifted lens which maps undefined to undefined", () => {
  type Rec = { k: unknown }
  const l = lift(f<Rec, "k">("k"))

  it("should map undefined to undefined", () => {
    fc.assert(fc.property(fc.constant(undefined), v => {
      return R.equals(R.view(l, v), v)
    }))
    fc.assert(fc.property(fc.anything(), v => {
      return R.equals(R.set(l, v, undefined), undefined)
    }))
  })

  it("should not change the original behavior when value is not undefined", () => {
    fc.assert(fc.property(fc.anything().filter(x => x !== undefined), fc.record({ k: fc.anything() }), (v, s) => {
      return R.equals(R.view(l, R.set(l, v, s)), v)
    }))
  })
})

describe("lift_ creates a lifted lens while viewing it, maps undefined to undefined", () => {
  it("should map undefined to undefined while viewing", () => {
    fc.assert(fc.property(fc.constant(undefined), v => {
      const l = lift_(i(0))
      return R.equals(R.view(l, v), v)
    }))
  })

  it("should not change the original behavior when value is not undefined", () => {
    type Pred = (ns: [number, string[]], v: string, vp: string) => boolean | void
    const assertArray = (f: Pred) => fc.assert(fc.property(
      fc.tuple(
        fc.integer(),
        fc.array(fc.string()),
      ).filter(([n, xs]) => n > 0 && n < xs.length),
      fc.string(),
      fc.string(),
      f,
    ))

    assertArray(([n, s], v) => {
      const l = i(n)
      return R.equals(R.view(l, R.set(l, v, s)), v)
    })
  })
})
