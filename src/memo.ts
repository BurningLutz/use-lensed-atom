import { ComponentType, MemoExoticComponent } from "react"
import { memo as reactMemo } from "react"

import { shallowEqual } from "./common"


// this memo did all the magics to prevent unexpected re-render upon atom
export function memo<T extends ComponentType<any>>(component: T): MemoExoticComponent<T> {
  return reactMemo(component, shallowEqual)
}
