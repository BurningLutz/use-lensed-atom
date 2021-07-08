import * as R from "ramda"
import fc from "fast-check"

import { f, i, k } from "../src"

describe("`f` creates a lens focused on a record's field", () => {
  type Rec = { k: unknown }
  const l = f<Rec, "k">("k")

  it("should satisfy `view l (set l v s) ≡ v`", () => {
    fc.assert(fc.property(fc.anything(), fc.record({ k: fc.anything() }), (v, s) => {
      return R.equals(R.view(l, R.set(l, v, s)), v)
    }))
  })

  it("should satisfy `set l (view l s) s ≡ s`", () => {
    fc.assert(fc.property(fc.record({ k: fc.anything() }), s => {
      return R.equals(R.set(l, R.view(l, s), s), s)
    }))
  })

  it("should satisfy `set l v' (set l v s) ≡ set l v' s`", () => {
    fc.assert(fc.property(fc.anything(), fc.anything(), fc.record({ k: fc.anything() }), (vp, v, s) => {
      return R.equals(R.set(l, vp, R.set(l, v, s)), R.set(l, vp, s))
    }))
  })
})

describe("`i` creates a lens focused on an array's element", () => {
  // test with string array here, but should work for any other kind of arrays too
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

  it("should satisfy `view l (set l v s) ≡ v`", () => {
    assertArray(([n, s], v) => {
      const l = i(n)
      return R.equals(R.view(l, R.set(l, v, s)), v)
    })
  })

  it("should satisfy `set l (view l s) s ≡ s`", () => {
    assertArray(([n, s]) => {
      const l = i(n)
      return R.equals(R.set(l, R.view(l, s), s), s)
    })
  })

  it("should satisfy `set l v' (set l v s) ≡ set l v' s`", () => {
    assertArray(([n, s], v, vp) => {
      const l = i(n)
      return R.equals(R.set(l, vp, R.set(l, v, s)), R.set(l, vp, s))
    })
  })
})

describe("`k` creates a lens focused on a map's key", () => {
  // test with number value here, but should work for any other kind of values too
  type Pred = (ks: [string, Record<string, number>], v: number, vp: number) => boolean | void
  const assertMap = (f: Pred) => fc.assert(fc.property(
    fc.string().chain(k => fc.tuple(
      fc.constant(k),
      fc.object({ key: fc.constant(k), values: [fc.integer()] }),
    )),
    fc.integer(),
    fc.integer(),
    f,
  ))

  it("should satisfy `view l (set l v s) ≡ v`", () => {
    assertMap(([key, s], v) => {
      const l = k(key)
      return R.equals(R.view(l, R.set(l, v, s)), v)
    })
  })

  it("should satisfy `set l (view l s) s ≡ s`", () => {
    assertMap(([key, s]) => {
      const l = k(key)
      return R.equals(R.set(l, R.view(l, s), s), s)
    })
  })

  it("should satisfy `set l v' (set l v s) ≡ set l v' s`", () => {
    assertMap(([key, s], v, vp) => {
      const l = k(key)
      return R.equals(R.set(l, vp, R.set(l, v, s)), R.set(l, vp, s))
    })
  })
})
