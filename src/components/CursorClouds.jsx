import { useEffect, useState } from "react"
import cloud01 from "../assets/clouds/cloud-01.png"
import cloud02 from "../assets/clouds/cloud-02.png"
import cloud03 from "../assets/clouds/cloud-03.png"
import cloud04 from "../assets/clouds/cloud-04.png"
import cloud05 from "../assets/clouds/cloud-05.png"
import cloud06 from "../assets/clouds/cloud-06.png"
import cloud07 from "../assets/clouds/cloud-07.png"

const CLOUDS = [cloud01, cloud02, cloud03, cloud04, cloud05, cloud06, cloud07]

/** Drift direction per cloud (1-indexed mapping): 1–4 left, 5–7 right. */
const DRIFT_X = [-56, -56, -56, -56, 56, 56, 56]

/** Pixels of mouse travel between each ordered cloud spawn. */
const SPAWN_DISTANCE = 200

/**
 * Spawns ordered cloud sprites along the cursor path based on travel distance.
 */
export default function CursorClouds() {
  const [puffs, setPuffs] = useState([])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!window.matchMedia("(pointer: fine)").matches) return

    let prevX = null
    let prevY = null
    let carried = 0
    let seq = 0
    const timers = new Set()

    const spawnAt = (x, y, dx, dy) => {
      const idx = seq % CLOUDS.length
      const id = ++seq
      const rot = (Math.random() - 0.5) * 28
      const puff = {
        id,
        x: x - dx * 0.6 + (Math.random() - 0.5) * 24,
        y: y - dy * 0.6 + (Math.random() - 0.5) * 24,
        src: CLOUDS[idx],
        size: 56 + Math.random() * 88,
        rot,
        rotEnd: rot + (Math.random() > 0.5 ? 1 : -1) * (12 + Math.random() * 18),
        driftX: DRIFT_X[idx],
      }
      setPuffs((list) => [...list.slice(-8), puff])
      const t = setTimeout(() => {
        timers.delete(t)
        setPuffs((list) => list.filter((p) => p.id !== id))
      }, 1800)
      timers.add(t)
    }

    const onMove = (e) => {
      const x = e.clientX
      const y = e.clientY
      if (prevX == null) {
        prevX = x
        prevY = y
        return
      }

      const dx = x - prevX
      const dy = y - prevY
      carried += Math.hypot(dx, dy)
      prevX = x
      prevY = y

      while (carried >= SPAWN_DISTANCE) {
        carried -= SPAWN_DISTANCE
        spawnAt(x, y, dx, dy)
      }
    }

    window.addEventListener("mousemove", onMove, { passive: true })
    return () => {
      window.removeEventListener("mousemove", onMove)
      timers.forEach(clearTimeout)
    }
  }, [])

  if (!puffs.length) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[45] overflow-hidden" aria-hidden="true">
      {puffs.map((p) => (
        <img
          key={p.id}
          src={p.src}
          alt=""
          className="cloud-cursor-puff absolute"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: "auto",
            ["--cloud-rot"]: `${p.rot}deg`,
            ["--cloud-rot-end"]: `${p.rotEnd}deg`,
            ["--cloud-dx"]: `${p.driftX}px`,
          }}
        />
      ))}
    </div>
  )
}
