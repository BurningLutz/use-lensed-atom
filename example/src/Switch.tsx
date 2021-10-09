import { Atom, memo } from "use-lensed-atom"


type SwitchProps = {
  aReadonly: Atom<boolean>
}

export default memo(function Switch({ aReadonly }: SwitchProps) {
  return (
    <div>
      <button
        className={`link ${aReadonly.get() ? "" : "active"}`}
        onClick={() => aReadonly.set(false)}
      >
        EDIT
      </button>
      <span className="hr"> | </span>
      <button
        className={`link ${aReadonly.get() ? "active" : ""}`}
        onClick={() => aReadonly.set(true)}
      >
        OKEY
      </button>
    </div>
  )
})
