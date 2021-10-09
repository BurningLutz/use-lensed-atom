import { Atom, memo } from "use-lensed-atom"


type TitleProps = {
  aAddr    : Atom<string>
  readonly : boolean
}

export default memo(function Title({ aAddr, readonly }: TitleProps) {
  return (
    <div className="flex grow align-center">
      { readonly
      ? <span className="title">{aAddr.get()}</span>
      : <input
          className   = "title-input grow"
          placeholder = "Please enter address."
          type        = "text"
          value       = {aAddr.get()}
          onInput     = {e => aAddr.set(e.currentTarget.value)}
        />
      }
    </div>
  )
})
