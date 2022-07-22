import { useCallback } from "react"
import { memo, AtomLens, sequence, f, at } from "use-lensed-atom"


type Goods = {
  name  : string
  count : number
}
type GoodsItemProps = {
  id       : number
  aItem    : AtomLens<Goods>
  readonly : boolean
  onRemove : (idx: number) => void
}
type GoodsListProps = {
  aItems   : AtomLens<Goods[]>
  readonly : boolean
}

const GoodsItem = memo(function GoodsItem({ id, aItem, readonly, onRemove }: GoodsItemProps) {
  const aName  = aItem.c(f("name"))
  const aCount = aItem.c(f("count"))

  return (
    <div className="flex justify-between">
      { readonly
      ? <>
          <span>{aName.view()}</span>
          <span>{aCount.view()}</span>
        </>
      : <>
          <input
            className   = "grow"
            placeholder = "Please enter goods name."
            type        = "text"
            value       = {aName.view()}
            onChange    = {e => aName.set(e.target.value)}
          />
          <div className="goods-action flex align-center justify-end">
            <button
              className = "link"
              onClick   = {() => aCount.over(x => x > 0 ? x - 1 : x)}>
              -
            </button>
            <span>{aCount.view()}</span>
            <button
              className = "link"
              onClick   = {() => aCount.over(x => x + 1)}>
              +
            </button>
            <button
              className = "link"
              onClick   = {() => onRemove(id)}>
              x
            </button>
          </div>
        </>
      }
    </div>
  )
})

export default memo(function GoodsList({ aItems, readonly }: GoodsListProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const removeAt = useCallback((idx: number) => aItems.c(at(idx)).set(undefined), [])

  return (
    <div className="flex-col grow justify-center align-start">
      <ul className="goods">
        { sequence(aItems).map((aItem, idx) => {
          return (
            <li key={idx} className="goods-item">
              <GoodsItem
                id       = {idx}
                aItem    = {aItem}
                readonly = {readonly}
                onRemove = {removeAt}
              />
            </li>
          )
        }) }
      </ul>
      { !readonly &&
        <button
          className = "link"
          onClick   = {() => aItems.c(at(aItems.view().length)).set({ name: "", count: 0 })}
        >
          MORE
        </button>
      }
    </div>
  )
})
