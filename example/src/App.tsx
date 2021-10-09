import "./App.css"

import { useAtom, destructure } from "use-lensed-atom"

import Title from "./Title"
import Switch from "./Switch"
import GoodsList from "./GoodsList"


type Goods = {
  name  : string
  count : number
}

type GState = {
  readonly : boolean
  items    : Goods[]
  addr     : string
}

function ShoppingList() {
  const gstate = useAtom<GState>({
    readonly : false,
    items    : [],
    addr     : "",
  })

  const { addr: aAddr, readonly: aReadonly, items: aItems } = destructure(gstate)

  console.log(gstate.get())

  return (
    <div className="app">
      <div className="flex-col align-center">
        <h1>- SHOPPING LIST -</h1>
        <Switch aReadonly={aReadonly} />
      </div>
      <div className="goods-list">
        <div className="flex">
          <div className="goods-label flex align-center justify-center">Addr.</div>
          <Title aAddr={aAddr} readonly={aReadonly.get()} />
        </div>
        <div className="flex">
          <div className="goods-label flex align-center justify-center">Goods</div>
          <GoodsList aItems={aItems} readonly={aReadonly.get()} />
        </div>
      </div>
    </div>
  )
}

export default ShoppingList
