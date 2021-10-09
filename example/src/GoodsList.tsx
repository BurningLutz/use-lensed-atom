import { memo, Atom, toList } from "use-lensed-atom"


type Goods = {
  name  : string
  count : number
}
type GoodsItemProps = {
  aItem    : Atom<Goods>
  readonly : boolean
  onRemove : () => void
}
type GoodsListProps = {
  aItems   : Atom<Goods[]>
  readonly : boolean
}

const GoodsItem = memo(function GoodsItem({ aItem, readonly, onRemove }: GoodsItemProps) {
  const aName  = aItem.vf("name")
  const aCount = aItem.vf("count")

  return (
    <div className="flex justify-between">
      { readonly
      ? <>
          <span>{aName.get()}</span>
          <span>{aCount.get()}</span>
        </>
      : <>
          <input
            className="grow"
            placeholder="Please enter goods name."
            type="text"
            value={aName.get()}
            onInput={e => aName.set(e.currentTarget.value)}
          />
          <div className="goods-action flex align-center justify-end">
            <button
              className="link"
              onClick={() => aCount.over(x => x > 0 ? x - 1 : x)}>
              -
            </button>
            <span>{aCount.get()}</span>
            <button
              className="link"
              onClick={() => aCount.over(x => x + 1)}>
              +
            </button>
            <button
              className="link"
              onClick={onRemove}>
              x
            </button>
          </div>
        </>
      }
    </div>
  )
})

export default memo(function GoodsList({ aItems, readonly }: GoodsListProps) {
  function removeAt(idx: number) {
    aItems.over(items => items.filter((_, idx_) => idx_ !== idx))
  }

  return (
    <div className="flex-col grow justify-center align-start">
      <ul className="goods">
        { toList(aItems).map((aItem, idx) => {
          return (
            <li key={idx} className="goods-item">
              <GoodsItem
                aItem    = {aItem}
                readonly = {readonly}
                onRemove = {() => removeAt(idx)}
              />
            </li>
          )
        }) }
      </ul>
      { !readonly &&
        <button
          className="link"
          onClick={() => aItems.over(items => [...items, { name: "", count: 0 }])}
        >
          MORE
        </button>
      }
    </div>
  )
})
