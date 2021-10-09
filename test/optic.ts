import fc from "fast-check"

import { shallowEqual } from "../src/common"
import { _f, ix, at, view, set, preview } from "../src/optic"

describe("`_f` creates a lens focused on a record's field", () => {
  type Rec = { k: number }
  const l = _f<Rec, "k">("k")

  it("should satisfy GetPut `view l (set l v s) ≡ v`", () => {
    fc.assert(fc.property(fc.record({ k: fc.integer() }), fc.integer(), (s, a) => {
      return view(l, set(l, a, s)) === a
    }))
  })

  it("should satisfy PutGet `set l (view l s) s ≡ s`", () => {
    fc.assert(fc.property(fc.record({ k: fc.integer() }), s => {
      const t = set(l, view(l, s), s)
      return shallowEqual(s, t)
    }))
  })

  it("should satisfy PutPut `set l v' (set l v s) ≡ set l v' s`", () => {
    fc.assert(fc.property(fc.record({ k: fc.integer() }), fc.integer(), fc.integer(), (s, a, a_) => {
      const t0 = set(l, a_, set(l, a, s))
      const t1 = set(l, a_, s)
      return shallowEqual(t0, t1)
    }))
  })
})

describe("`ix` creates an affine traversal focused on an array's element", () => {
  // test with string array here, but should work for any other kind of arrays too
  type Pred = (ns: [number, string[]]) => boolean | void
  const assertArray = (f: Pred) => fc.assert(fc.property(
    fc.tuple(
      fc.integer(),
      fc.array(fc.string()),
    ).filter(([n, xs]) => n > 0 && n < xs.length),
    f,
  ))

  it("should preview an optional value", () => {
    assertArray(([n, s]) => {
      const l0 = ix<string>(n)
      const l1 = ix<string>(s.length)
      return preview(l0, s) === s[n] && preview(l1, s) === undefined
    })
  })

  it("should update value when index is within range or do nothing", () => {
    assertArray(([n, s]) => {
      const l0 = ix<string>(n)
      const l1 = ix<string>(s.length)
      const t0 = set(l0, "", s)
      const t1 = set(l1, "", s)
      return t0[n] === "" && shallowEqual(s, t1)
    })
  })
})

describe("`at` creates a lens focused on a map's key", () => {
  type Pred = (ks: [string, Record<string, number>], v: number, v_: number) => boolean | void

  const assertMap = (f: Pred) => fc.assert(fc.property(
    fc.string().chain(k => fc.tuple(
      fc.constant(k),
      fc.dictionary(fc.constant(k), fc.integer()),
    )),
    fc.integer(),
    fc.integer(),
    f,
  ))

  it("should satisfy `view l (set l v s) ≡ v`", () => {
    assertMap(([key, s], v) => {
      const l = at<number>(key)
      return view(l, set(l, v, s)) === v
    })
  })

  it("should satisfy `set l (view l s) s ≡ s`", () => {
    assertMap(([key, s]) => {
      const l = at<number>(key)
      const t = set(l, view(l, s), s)
      return shallowEqual(s, t)
    })
  })

  it("should satisfy `set l v' (set l v s) ≡ set l v' s`", () => {
    assertMap(([key, s], v, vp) => {
      const l = at<number>(key)
      const t0 = set(l, vp, set(l, v, s))
      const t1 = set(l, vp, s)
      return shallowEqual(t0, t1)
    })
  })

  it("should delete key when set undefined", () => {
    assertMap(([key, s]) => {
      const l = at<number>(key)
      const t = set(l, undefined, s)

      return shallowEqual(t, {})
    })
  })
})
