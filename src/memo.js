import { shallowEqual } from "./common"


// this memo did all the magics to prevent unexpected re-render upon atom
export function memo(component) {
  return reactMemo(component, shallowEqual)
}
