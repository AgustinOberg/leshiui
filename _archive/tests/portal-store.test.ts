import assert from "node:assert/strict"
import { test } from "node:test"

import { PortalStore } from "../registry-src/styles/unistyles/primitives/portal/portal-store.js"

test("PortalStore mounts nodes per host and preserves order", () => {
  const store = new PortalStore()

  store.mount("root", 1, "Alpha")
  store.mount("root", 2, "Beta")

  assert.deepStrictEqual(store.getSnapshot("root"), [
    { key: 1, node: "Alpha" },
    { key: 2, node: "Beta" },
  ])
})

test("PortalStore updates nodes without changing order", () => {
  const store = new PortalStore()

  store.mount("root", 1, "Alpha")
  store.mount("root", 2, "Beta")
  store.update("root", 1, "Alpha+")

  assert.deepStrictEqual(store.getSnapshot("root"), [
    { key: 1, node: "Alpha+" },
    { key: 2, node: "Beta" },
  ])
})

test("PortalStore isolates hosts", () => {
  const store = new PortalStore()

  store.mount("root", 1, "Alpha")
  store.mount("modal", 2, "Omega")

  assert.deepStrictEqual(store.getSnapshot("root"), [{ key: 1, node: "Alpha" }])
  assert.deepStrictEqual(store.getSnapshot("modal"), [
    { key: 2, node: "Omega" },
  ])
})

test("PortalStore notifies subscribers on changes only", () => {
  const store = new PortalStore()
  let calls = 0
  const unsubscribe = store.subscribe(() => {
    calls += 1
  })

  store.mount("root", 1, "Alpha")
  store.update("root", 1, "Alpha")
  store.update("root", 1, "Alpha+")
  store.unmount("root", 1)
  unsubscribe()
  store.mount("root", 2, "Beta")

  assert.strictEqual(calls, 3)
})

test("PortalStore returns a stable snapshot reference when content is unchanged", () => {
  const store = new PortalStore()
  const empty1 = store.getSnapshot("root")
  const empty2 = store.getSnapshot("root")
  assert.strictEqual(empty1, empty2, "empty snapshots must share a reference")

  store.mount("root", 1, "Alpha")
  const snap1 = store.getSnapshot("root")
  const snap2 = store.getSnapshot("root")
  assert.strictEqual(snap1, snap2, "non-empty snapshots must be stable across calls")

  store.update("root", 1, "Alpha")
  const snapAfterNoop = store.getSnapshot("root")
  assert.strictEqual(
    snapAfterNoop,
    snap1,
    "snapshot must not change when update is a no-op",
  )

  store.update("root", 1, "Alpha+")
  const snapAfterChange = store.getSnapshot("root")
  assert.notStrictEqual(
    snapAfterChange,
    snap1,
    "snapshot must change when content changes",
  )
})
