import { AtomLens, memo } from "use-lensed-atom"


type TitleProps = {
  aAddr    : AtomLens<string>
  readonly : boolean
}

export default memo(function Title({ aAddr, readonly }: TitleProps) {
  return (
    <div className="flex grow align-center">
      { readonly
      ? <span className="title">{aAddr.view()}</span>
      : <input
          className   = "title-input grow"
          placeholder = "Please enter address."
          type        = "text"
          value       = {aAddr.view()}
          onChange    = {e => aAddr.set(e.target.value)}
        />
      }
    </div>
  )
})
