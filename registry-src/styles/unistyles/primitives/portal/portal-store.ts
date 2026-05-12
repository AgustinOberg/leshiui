import type { ReactNode } from "react"

export type PortalNode = {
  key: number
  node: ReactNode
}

/**
 * Shared empty snapshot returned when a host has no mounted nodes. Reused
 * across calls so `useSyncExternalStore` sees a stable reference and does not
 * trigger an infinite render loop in React 18+.
 */
const EMPTY_SNAPSHOT: readonly PortalNode[] = Object.freeze([])

export class PortalStore {
  private hosts = new Map<string, Map<number, ReactNode>>()
  private snapshots = new Map<string, readonly PortalNode[]>()
  private listeners = new Set<() => void>()

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Return the current snapshot for a host. The reference is **stable** —
   * the same array is returned on repeated calls until the host's content
   * actually changes. This is required by `useSyncExternalStore`, which
   * compares snapshots via `Object.is` and re-renders on any inequality.
   */
  getSnapshot(name: string): readonly PortalNode[] {
    const cached = this.snapshots.get(name)
    if (cached) {
      return cached
    }

    const host = this.hosts.get(name)
    if (!host || host.size === 0) {
      return EMPTY_SNAPSHOT
    }

    const fresh = this.computeSnapshot(host)
    this.snapshots.set(name, fresh)
    return fresh
  }

  mount(name: string, key: number, node: ReactNode): void {
    const host = this.ensureHost(name)
    const hadEntry = host.has(key)
    const prev = host.get(key)
    host.set(key, node)

    if (!hadEntry || prev !== node) {
      this.invalidateSnapshot(name)
      this.notify()
    }
  }

  update(name: string, key: number, node: ReactNode): void {
    const host = this.ensureHost(name)
    const prev = host.get(key)

    if (prev !== node) {
      host.set(key, node)
      this.invalidateSnapshot(name)
      this.notify()
    }
  }

  unmount(name: string, key: number): void {
    const host = this.hosts.get(name)
    if (!host) {
      return
    }

    const removed = host.delete(key)
    if (host.size === 0) {
      this.hosts.delete(name)
    }

    if (removed) {
      this.invalidateSnapshot(name)
      this.notify()
    }
  }

  private computeSnapshot(
    host: Map<number, ReactNode>,
  ): readonly PortalNode[] {
    return Array.from(host.entries()).map(([key, node]) => ({ key, node }))
  }

  private invalidateSnapshot(name: string): void {
    this.snapshots.delete(name)
  }

  private ensureHost(name: string): Map<number, ReactNode> {
    const existing = this.hosts.get(name)
    if (existing) {
      return existing
    }

    const created = new Map<number, ReactNode>()
    this.hosts.set(name, created)
    return created
  }

  private notify(): void {
    if (this.listeners.size === 0) {
      return
    }

    for (const listener of Array.from(this.listeners)) {
      listener()
    }
  }
}
