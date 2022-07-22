import { AtomLens, memo } from "use-lensed-atom"


type SwitchProps = {
  aReadonly: AtomLens<boolean>
}

export default memo(function Switch({ aReadonly }: SwitchProps) {
  return (
    <div>
      <button
        className={`link ${aReadonly.view() ? "" : "active"}`}
        onClick={() => aReadonly.set(false)}
      >
        EDIT
      </button>
      <span className="hr"> | </span>
      <button
        className={`link ${aReadonly.view() ? "active" : ""}`}
        onClick={() => aReadonly.set(true)}
      >
        OKEY
      </button>
    </div>
  )
})
