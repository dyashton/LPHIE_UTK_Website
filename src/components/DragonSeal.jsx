import dragon from "../assets/dragon.png"

/** Decorative dragon seal from chapter artwork. */
export default function DragonSeal({ className = "", size = 36 }) {
  return (
    <img
      src={dragon}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={`shrink-0 object-contain ${className}`}
      // ponytail: black plate drops out on dark chrome
      style={{ mixBlendMode: "screen" }}
    />
  )
}
