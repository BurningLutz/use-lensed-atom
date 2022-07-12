export interface HKT {
  readonly A     : unknown
  readonly type? : unknown
}


export type Kind<F extends HKT, A> =
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
