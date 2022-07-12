interface HKT {
  readonly A     : unknown
  readonly type? : unknown
}


type Kind<F extends HKT, A> =
  F extends { readonly type: unknown
            }
  // F has a type specified, it is concrete (like F = ArrayHKT)
  ? ( F & { readonly A: A
          }
    )["type"]
  // F is generic, we need to mention all of the type parameters
  // to guarantee that they are never excluded from type checking
  : { readonly _F: F
      readonly _A: () => A
    }


interface TypeClass<F extends HKT> {
  readonly TS?: F
}


interface Functor<F extends HKT> extends TypeClass<F> {
  readonly fmap: <A, B>(f: (a: A) => B) => (fa: Kind<F, A>) => Kind<F, B>
}


type Lens<S, T, A, B> =  <F extends HKT>(TS: Functor<F>)
                      => (f: (a: A) => Kind<F, B>)
                      => (s: S)
                      => Kind<F, T>


interface ConstHKT<A> extends HKT {
  type: Const<A, this["A"]>
}


interface Const1<A, _> {
  getConst: A
}

function mkConst<A, B>(a: A): Const1<A, B> {
  return {
    getConst: a
  }
}

class Const<A, _> {
  private readonly a: A

  constructor(a: A) {
    this.a = a
  }

  static mkConst<A, B>(a: A) {
    return new Const<A, B>(a)
  }

  getConst(): A {
    return this.a
  }

  static Functor<A>(): Functor<ConstHKT<A>> {
    return {
      fmap<B, C>(_: (b: B) => C): (fa: Const<A, B>) => Const<A, C> {
        return fa => new Const(fa.a)
      }
    }
  }
}

interface IndentityHKT extends HKT {
  type: Indentity<this["A"]>
}

class Indentity<A> {
  private a: A

  constructor(a: A) {
    this.a = a
  }

  static mkIdentity<A>(a: A) {
    return new Indentity(a)
  }

  getIdentity(): A {
    return this.a
  }

  static Functor: Functor<IndentityHKT> = {
    fmap<A, B>(f: (a: A) => B): (fa: Indentity<A>) => Indentity<B> {
      return fa => new Indentity(f(fa.a))
    }
  }
}


function view<S, A>(l: Lens<S, S, A, A>, s: S): A {
  return l(Const.Functor<A>())(Const.mkConst)(s).getConst()
}

function set<S, T, A, B>(l: Lens<S, T, A, B>, b: B, s: S): T {
  return l(Indentity.Functor)(() => Indentity.mkIdentity(b))(s).getIdentity()
}


function lens<S, T, A, B>(getter: (s: S) => A, setter: (s: S) => (b: B) => T): Lens<S, T, A, B> {
  return <F extends HKT>(TS: Functor<F>) => (f: (a: A) => Kind<F, B>) => s => {
    return TS.fmap(setter(s))(f(getter(s)))
  }
}


function compose<A, B, C>(f: (a: B) => C, g: (b: A) => B): (a: A) => C {
  return a => f(g(a))
}


function f<K extends keyof R, R>(k: K): Lens<R, R, R[K], R[K]> {
  return lens<R, R, R[K], R[K]>(r => r[k], r => b => ({ ...r, [k]: b }))
}


interface User<A> {
  extra: A
}


const u: User<string> = {
  extra: "hello"
}

function fff(s: string) {
  console.log(s)
}


console.log(view(f("extra"), u))
console.log(set(f<"extra", User<string>>("extra"), "fsd", u))

const uu: [number, string, boolean] = [1,"",true]
console.log(view(f(0), uu))
