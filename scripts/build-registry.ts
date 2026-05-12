import type { Dirent } from "node:fs"
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import AjvModule, { type ErrorObject } from "ajv"

const Ajv = AjvModule.default ?? AjvModule

import draft07MetaSchema from "ajv/dist/refs/json-schema-draft-07.json" with {
  type: "json",
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Public registry name. Used as the `name` field in the top-level index.
 */
const REGISTRY_NAME = "leshi-ui"

/**
 * Public hosting base URL. Items are published at
 * `<REGISTRY_BASE_URL>/<REGISTRY_VERSION>/styles/<style>/r/<name>.json`.
 *
 * Change this constant when migrating hosting.
 */
const REGISTRY_BASE_URL = "https://leshi-ui.pages.dev"

/**
 * Repository homepage. Surfaced in the top-level index.
 */
const REGISTRY_HOMEPAGE = "https://github.com/AgustinOberg/leshiui"

/**
 * Versioned URL prefix. Bump when a breaking change to the URL scheme or
 * manifest format is required and run `v1` and `v2` in parallel for some
 * deprecation window.
 */
const REGISTRY_VERSION = "v1"

const REGISTRY_TYPES = [
  "registry:lib",
  "registry:block",
  "registry:component",
  "registry:ui",
  "registry:hook",
  "registry:theme",
  "registry:page",
  "registry:file",
  "registry:style",
  "registry:base",
  "registry:font",
  "registry:item",
] as const

type RegistryType = (typeof REGISTRY_TYPES)[number]

type ManifestFile = {
  /**
   * Source path. Default is relative to `registry-src/styles/<style>/`. Prefix
   * with `core:` to read from `registry-src/core/` instead. The prefix is
   * stripped before the file is embedded; consumers never see it.
   */
  source: string
  /** Install path inside the consumer's project (kebab-case convention). */
  path: string
  type: RegistryType
  target?: string
}

type Manifest = {
  name: string
  type: RegistryType
  description?: string
  title?: string
  author?: string
  dependencies?: string[]
  devDependencies?: string[]
  registryDependencies?: string[]
  files: ManifestFile[]
  docs?: string
  categories?: string[]
  meta?: Record<string, unknown>
  extends?: string
  style?: string
  iconLibrary?: string
  baseColor?: string
  theme?: string
  font?: Record<string, unknown>
}

type RegistryFile = {
  path: string
  content: string
  type: RegistryType
  target?: string
}

type RegistryItem = Omit<Manifest, "files"> & { files: RegistryFile[] }

type RegistryIndex = {
  name: string
  homepage: string
  items: Array<Omit<RegistryItem, "files">>
}

type TopLevelIndex = {
  name: string
  homepage: string
  baseUrl: string
  version: string
  styles: Array<{
    name: string
    itemCount: number
    registryUrl: string
  }>
}

const CURRENT_FILE = fileURLToPath(import.meta.url)
const ROOT_DIR = path.resolve(path.dirname(CURRENT_FILE), "..")
const REGISTRY_SRC_DIR = path.join(ROOT_DIR, "registry-src")
const CORE_DIR = path.join(REGISTRY_SRC_DIR, "core")
const STYLES_DIR = path.join(REGISTRY_SRC_DIR, "styles")
const OUTPUT_DIR = path.join(ROOT_DIR, "public")
const OUTPUT_VERSION_DIR = path.join(OUTPUT_DIR, REGISTRY_VERSION)
const OUTPUT_STYLES_DIR = path.join(OUTPUT_VERSION_DIR, "styles")
const SCHEMA_DIR = path.join(ROOT_DIR, "schemas")
const ITEM_SCHEMA_PATH = path.join(SCHEMA_DIR, "registry-item.schema.json")
const REGISTRY_SCHEMA_PATH = path.join(SCHEMA_DIR, "registry.schema.json")

const REGISTRY_TYPE_SET = new Set<string>(REGISTRY_TYPES)

const CORE_PREFIX = "core:"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function toPosixPath(input: string): string {
  return input.replace(/\\/g, "/")
}

function hasParentTraversal(input: string): boolean {
  return toPosixPath(input)
    .split("/")
    .some((segment) => segment === "..")
}

function assertSafeRelativePath(input: string, label: string): string {
  const value = input.trim()
  if (!value) {
    throw new Error(`${label} must not be empty`)
  }

  const posixValue = toPosixPath(value)
  if (path.posix.isAbsolute(posixValue)) {
    throw new Error(`${label} must be a relative path`)
  }

  if (hasParentTraversal(posixValue)) {
    throw new Error(`${label} must not include '..' segments`)
  }

  return path.posix.normalize(posixValue)
}

function getRequiredString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a non-empty string`)
  }
  return value
}

function getOptionalString(value: unknown, label: string): string | undefined {
  if (value === undefined) return undefined
  if (typeof value !== "string") {
    throw new Error(`${label} must be a string`)
  }
  return value
}

function getOptionalStringArray(
  value: unknown,
  label: string,
): string[] | undefined {
  if (value === undefined) return undefined
  if (
    !Array.isArray(value) ||
    value.some((entry) => typeof entry !== "string")
  ) {
    throw new Error(`${label} must be an array of strings`)
  }
  return value
}

function getOptionalObject(
  value: unknown,
  label: string,
): Record<string, unknown> | undefined {
  if (value === undefined) return undefined
  if (!isPlainObject(value)) {
    throw new Error(`${label} must be an object`)
  }
  return value
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8")
  try {
    return JSON.parse(raw) as T
  } catch (error) {
    throw new Error(`Failed to parse JSON at ${filePath}`, { cause: error })
  }
}

// ---------------------------------------------------------------------------
// Manifest parsing
// ---------------------------------------------------------------------------

async function loadManifest(filePath: string): Promise<Manifest> {
  const raw = await readJsonFile<unknown>(filePath)

  if (!isPlainObject(raw)) {
    throw new Error(`Manifest must be an object: ${filePath}`)
  }

  const name = getRequiredString(raw.name, "manifest.name")
  const type = getRequiredString(raw.type, "manifest.type")

  if (!REGISTRY_TYPE_SET.has(type)) {
    throw new Error(`manifest.type must be a valid registry type: ${type}`)
  }

  const filesValue = raw.files
  if (!Array.isArray(filesValue) || filesValue.length === 0) {
    throw new Error(`manifest.files must be a non-empty array: ${filePath}`)
  }

  const files = filesValue.map((entry, index) => {
    if (!isPlainObject(entry)) {
      throw new Error(`manifest.files[${index}] must be an object`)
    }

    const rawSource = getRequiredString(
      entry.source,
      `manifest.files[${index}].source`,
    )

    // Allow the `core:` prefix to address files in registry-src/core/.
    let source: string
    if (rawSource.startsWith(CORE_PREFIX)) {
      const stripped = rawSource.slice(CORE_PREFIX.length)
      source = `${CORE_PREFIX}${assertSafeRelativePath(
        stripped,
        `manifest.files[${index}].source`,
      )}`
    } else {
      source = assertSafeRelativePath(
        rawSource,
        `manifest.files[${index}].source`,
      )
    }

    const filePathValue = assertSafeRelativePath(
      getRequiredString(entry.path, `manifest.files[${index}].path`),
      `manifest.files[${index}].path`,
    )
    const fileType = getRequiredString(
      entry.type,
      `manifest.files[${index}].type`,
    )

    if (!REGISTRY_TYPE_SET.has(fileType)) {
      throw new Error(
        `manifest.files[${index}].type must be a valid registry type: ${fileType}`,
      )
    }

    const targetValue = getOptionalString(
      entry.target,
      `manifest.files[${index}].target`,
    )
    if (
      (fileType === "registry:file" || fileType === "registry:page") &&
      !targetValue
    ) {
      throw new Error(
        `manifest.files[${index}].target is required for ${fileType}`,
      )
    }

    return {
      source,
      path: filePathValue,
      type: fileType as RegistryType,
      target: targetValue
        ? assertSafeRelativePath(targetValue, `manifest.files[${index}].target`)
        : undefined,
    }
  })

  return {
    name,
    type: type as RegistryType,
    title: getOptionalString(raw.title, "manifest.title"),
    description: getOptionalString(raw.description, "manifest.description"),
    author: getOptionalString(raw.author, "manifest.author"),
    dependencies: getOptionalStringArray(
      raw.dependencies,
      "manifest.dependencies",
    ),
    devDependencies: getOptionalStringArray(
      raw.devDependencies,
      "manifest.devDependencies",
    ),
    registryDependencies: getOptionalStringArray(
      raw.registryDependencies,
      "manifest.registryDependencies",
    ),
    files,
    docs: getOptionalString(raw.docs, "manifest.docs"),
    categories: getOptionalStringArray(raw.categories, "manifest.categories"),
    meta: getOptionalObject(raw.meta, "manifest.meta"),
    extends: getOptionalString(raw.extends, "manifest.extends"),
    style: getOptionalString(raw.style, "manifest.style"),
    iconLibrary: getOptionalString(raw.iconLibrary, "manifest.iconLibrary"),
    baseColor: getOptionalString(raw.baseColor, "manifest.baseColor"),
    theme: getOptionalString(raw.theme, "manifest.theme"),
    font: getOptionalObject(raw.font, "manifest.font"),
  }
}

function buildItemBase(manifest: Manifest): Omit<RegistryItem, "files"> {
  const item: Omit<RegistryItem, "files"> = {
    name: manifest.name,
    type: manifest.type,
  }

  if (manifest.title) item.title = manifest.title
  if (manifest.description) item.description = manifest.description
  if (manifest.author) item.author = manifest.author
  if (manifest.dependencies?.length) item.dependencies = manifest.dependencies
  if (manifest.devDependencies?.length) {
    item.devDependencies = manifest.devDependencies
  }
  if (manifest.registryDependencies?.length) {
    item.registryDependencies = manifest.registryDependencies.map(
      (dependency) => {
        if (dependency.startsWith("@")) return dependency
        return `@${REGISTRY_NAME}/${dependency}`
      },
    )
  }
  if (manifest.docs) item.docs = manifest.docs
  if (manifest.categories?.length) item.categories = manifest.categories
  if (manifest.meta && Object.keys(manifest.meta).length > 0) {
    item.meta = manifest.meta
  }
  if (manifest.extends) item.extends = manifest.extends
  if (manifest.style) item.style = manifest.style
  if (manifest.iconLibrary) item.iconLibrary = manifest.iconLibrary
  if (manifest.baseColor) item.baseColor = manifest.baseColor
  if (manifest.theme) item.theme = manifest.theme
  if (manifest.font) item.font = manifest.font

  return item
}

// ---------------------------------------------------------------------------
// Source resolution + import rewriting
// ---------------------------------------------------------------------------

/**
 * Resolve a manifest `source` to an absolute filesystem path.
 * Honors the `core:` prefix.
 */
function resolveSourcePath(source: string, styleDir: string): string {
  if (source.startsWith(CORE_PREFIX)) {
    const rel = source.slice(CORE_PREFIX.length)
    const abs = path.resolve(CORE_DIR, rel)
    if (!abs.startsWith(CORE_DIR + path.sep)) {
      throw new Error(`core: source escapes core root: ${source}`)
    }
    return abs
  }

  const abs = path.resolve(styleDir, source)
  if (!abs.startsWith(styleDir + path.sep)) {
    throw new Error(`source escapes style root: ${source}`)
  }
  return abs
}

/**
 * Build a map keyed by absolute source path, with every file declared by
 * every manifest in a style (not just one). The value is the file's install
 * path (kebab-case, from the manifest's `path` field).
 *
 * Used by the import rewriter to translate any relative import — sibling,
 * cross-tree (via `core:`), or cross-item (e.g., a UI component importing
 * a primitive from another manifest) — into install-relative paths in the
 * published item. Without this, components like Dialog that pull in Focus
 * or Portal from a separate manifest would emit broken relative paths in
 * their installed file.
 */
function buildStyleSourceMap(
  manifests: Manifest[],
  styleDir: string,
): Map<string, string> {
  const map = new Map<string, string>()
  for (const manifest of manifests) {
    for (const file of manifest.files) {
      const absSource = resolveSourcePath(file.source, styleDir)
      map.set(absSource, file.path)
    }
  }
  return map
}

const RELATIVE_IMPORT_RE =
  /(\bfrom\s+["']|\bexport\s+[^\n;]*\s+from\s+["'])(\.{1,2}\/[^"']+)(["'])/g

const STRIP_TRAILING_EXTS = /\.(tsx?|d\.ts|jsx?)$/

/**
 * Detect whether `specifier` (a relative import path) imports the wrapped
 * platform-specific file from the current module's `*.web|native|ios|android.*`
 * wrapper. The bundler resolves these implicitly, so the existing convention
 * is to leave the import untouched (preserve the `.js` extension).
 */
function isSelfPlatformWrapperImport(
  fromAbsSource: string,
  specifier: string,
): boolean {
  const fromPosix = toPosixPath(fromAbsSource)
  const fromDir = path.posix.dirname(fromPosix)
  const fromBase = path.posix.basename(fromPosix)

  const wrapperMatch = fromBase.match(
    /^(?<base>.+)\.(web|native|ios|android)\.(tsx|ts|jsx|js)$/,
  )
  if (!wrapperMatch?.groups?.base) return false

  const wrapperBaseAbs = path.posix.normalize(
    path.posix.join(fromDir, wrapperMatch.groups.base),
  )
  const resolvedAbs = path.posix.normalize(
    path.posix.join(fromDir, specifier.replace(/\.js$/, "")),
  )

  return resolvedAbs === wrapperBaseAbs
}

/**
 * Resolve a relative `.js` specifier to one of the absolute source paths in
 * the source map. Returns `null` if the import does not point at a file the
 * manifest declares (in which case it is left untouched).
 */
function findInSourceMap(
  specifier: string,
  fromAbsSource: string,
  sourceMap: Map<string, string>,
): { abs: string; install: string } | null {
  const fromDir = path.dirname(fromAbsSource)
  const cleaned = specifier.replace(/\.js$/, "")
  const baseAbs = path.resolve(fromDir, cleaned)

  // Try the source map with various extensions / index variants.
  const candidates = [
    `${baseAbs}.ts`,
    `${baseAbs}.tsx`,
    `${baseAbs}.d.ts`,
    `${baseAbs}.js`,
    path.join(baseAbs, "index.ts"),
    path.join(baseAbs, "index.tsx"),
    baseAbs,
  ]

  for (const cand of candidates) {
    const install = sourceMap.get(cand)
    if (install) return { abs: cand, install }
  }
  return null
}

/**
 * Rewrite relative imports in source code into install-relative imports.
 *
 * Two cases handled:
 *
 *   1. Sibling / nested-within-style imports (e.g. `from "./portal-store.js"`):
 *      strip the `.js` extension and produce an install-relative path. This
 *      mirrors the consumer-side convention (no explicit `.js` extension).
 *   2. Cross-tree imports (e.g. `from "../../../core/tokens/default.js"` from
 *      a file in `styles/unistyles/lib/`): resolve to the absolute source path
 *      of the target, look up its install path in the source map, and emit
 *      an install-relative path.
 *
 * Imports that are not relative (package imports like `react-native-unistyles`)
 * or that resolve outside the manifest's file set (the rare case of an
 * out-of-scope file) are left untouched.
 *
 * Self-platform-wrapper imports (`focus-scope.tsx` importing
 * `./focus-scope.web.js`) preserve the `.js` extension stripping behavior of
 * the previous implementation, because RN's bundler resolves the platform
 * suffix implicitly.
 */
function rewriteImports(
  content: string,
  fromAbsSource: string,
  fromInstallPath: string,
  sourceMap: Map<string, string>,
): string {
  const fromInstallDir = path.posix.dirname(toPosixPath(fromInstallPath))

  return content.replace(
    RELATIVE_IMPORT_RE,
    (full, prefix, specifier, suffix) => {
      // Try to look up the import target in the manifest's source map.
      const match = findInSourceMap(specifier, fromAbsSource, sourceMap)

      if (!match) {
        // Not in our manifest. Keep the original specifier — the bundler will
        // resolve at install time. (Platform wrappers and any out-of-scope
        // files land here.)
        return full
      }

      // Compute install-relative path from our file to the target.
      let rel = path.posix.relative(
        fromInstallDir,
        toPosixPath(match.install),
      )
      rel = rel.replace(STRIP_TRAILING_EXTS, "")
      if (!rel.startsWith(".")) rel = `./${rel}`

      return `${prefix}${rel}${suffix}`
    },
  )
}

/**
 * Final cleanup pass. Strips any remaining `.js` extensions on relative
 * imports that the source-map-based rewriter left untouched (i.e., imports
 * that point at files outside the manifest, like platform wrappers).
 *
 * Self-platform-wrapper imports are preserved (a `.web.tsx` file's import of
 * its base name keeps its specifier intact so RN's bundler can resolve the
 * platform suffix automatically).
 */
function stripExtensionFromExternalImports(
  content: string,
  fromAbsSource: string,
): string {
  const rewrite = (
    full: string,
    prefix: string,
    specifier: string,
    suffix: string,
  ): string => {
    if (isSelfPlatformWrapperImport(fromAbsSource, specifier)) return full
    return `${prefix}${specifier.replace(/\.js$/, "")}${suffix}`
  }

  return content.replace(
    /(\bfrom\s+["'])(\.{1,2}\/[^"']+\.js)(["'])/g,
    rewrite,
  )
}

// ---------------------------------------------------------------------------
// Item building
// ---------------------------------------------------------------------------

async function buildRegistryItem(
  manifest: Manifest,
  styleDir: string,
  styleSourceMap: Map<string, string>,
): Promise<RegistryItem> {
  const files = await Promise.all(
    manifest.files.map(async (file) => {
      const sourcePath = resolveSourcePath(file.source, styleDir)
      const sourceContent = await readFile(sourcePath, "utf8")

      const rewritten = rewriteImports(
        sourceContent,
        sourcePath,
        file.path,
        styleSourceMap,
      )
      const cleaned = stripExtensionFromExternalImports(rewritten, sourcePath)

      return {
        path: file.path,
        content: cleaned,
        type: file.type,
        target: file.target,
      } satisfies RegistryFile
    }),
  )

  return {
    ...buildItemBase(manifest),
    files,
  }
}

// ---------------------------------------------------------------------------
// Style discovery
// ---------------------------------------------------------------------------

async function discoverStyles(): Promise<string[]> {
  let entries: Dirent[]
  try {
    entries = (await readdir(STYLES_DIR, { withFileTypes: true })) as Dirent[]
  } catch (error) {
    if (
      error instanceof Error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return []
    }
    throw error
  }

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b))
}

async function discoverManifestFiles(stylesItemsDir: string): Promise<string[]> {
  let entries: Dirent[]
  try {
    entries = (await readdir(stylesItemsDir, {
      withFileTypes: true,
    })) as Dirent[]
  } catch (error) {
    if (
      error instanceof Error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return []
    }
    throw error
  }

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".manifest.json"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b))
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function formatAjvErrors(errors: ErrorObject[] | null | undefined): string {
  if (!errors || errors.length === 0) return "Unknown schema validation error"
  return errors
    .map((error) => {
      const location = error.instancePath || "/"
      const message = error.message ?? "Invalid"
      return `${location} ${message}`
    })
    .join("\n")
}

function assertValid(
  valid: boolean,
  errors: ErrorObject[] | null | undefined,
  label: string,
) {
  if (valid) return
  throw new Error(
    `Schema validation failed for ${label}:\n${formatAjvErrors(errors)}`,
  )
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8")
}

/**
 * Recursively delete a directory if it exists.
 * No-op on ENOENT.
 */
async function rmDirIfExists(dirPath: string): Promise<void> {
  try {
    await rm(dirPath, { recursive: true, force: true })
  } catch (error) {
    if (
      error instanceof Error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return
    }
    throw error
  }
}

// ---------------------------------------------------------------------------
// Cross-style validation
// ---------------------------------------------------------------------------

type StyleBundle = {
  style: string
  manifests: Manifest[]
  items: RegistryItem[]
}

function logCrossStyleWarnings(bundles: StyleBundle[]): void {
  if (bundles.length < 2) return

  const itemsByStyle = new Map<string, Set<string>>()
  for (const bundle of bundles) {
    itemsByStyle.set(
      bundle.style,
      new Set(bundle.manifests.map((m) => m.name)),
    )
  }

  const allItems = new Set<string>()
  for (const set of itemsByStyle.values()) {
    for (const name of set) allItems.add(name)
  }

  for (const item of [...allItems].sort()) {
    const missingIn: string[] = []
    for (const [style, items] of itemsByStyle) {
      if (!items.has(item)) missingIn.push(style)
    }
    if (missingIn.length > 0) {
      console.warn(
        `[cross-style] item "${item}" missing in style(s): ${missingIn.join(", ")}`,
      )
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const styles = await discoverStyles()
  if (styles.length === 0) {
    throw new Error(`No styles found under ${STYLES_DIR}`)
  }

  const registryItemSchema =
    await readJsonFile<Record<string, unknown>>(ITEM_SCHEMA_PATH)
  const registrySchema =
    await readJsonFile<Record<string, unknown>>(REGISTRY_SCHEMA_PATH)
  const ajv = new Ajv({ allErrors: true, strict: false })

  const draft07Meta = {
    ...draft07MetaSchema,
    $id: "https://json-schema.org/draft-07/schema#",
    $schema: "https://json-schema.org/draft-07/schema#",
  }
  ajv.addMetaSchema(draft07Meta)
  ajv.addSchema(
    registryItemSchema,
    "https://ui.shadcn.com/schema/registry-item.json",
  )

  const validateItem = ajv.compile(registryItemSchema)
  const validateRegistry = ajv.compile(registrySchema)

  // Wipe the entire output tree so deletes propagate cleanly.
  await rmDirIfExists(OUTPUT_DIR)
  await mkdir(OUTPUT_VERSION_DIR, { recursive: true })

  const bundles: StyleBundle[] = []

  for (const style of styles) {
    const styleDir = path.join(STYLES_DIR, style)
    const itemsDir = path.join(styleDir, "items")
    const manifestFiles = await discoverManifestFiles(itemsDir)

    if (manifestFiles.length === 0) {
      // Skeleton style with no items — skip emission entirely.
      continue
    }

    const manifests: Manifest[] = []
    const seenNames = new Set<string>()

    for (const fileName of manifestFiles) {
      const manifestPath = path.join(itemsDir, fileName)
      const manifest = await loadManifest(manifestPath)
      const expectedName = fileName.replace(/\.manifest\.json$/, "")

      if (manifest.name !== expectedName) {
        throw new Error(
          `[${style}] manifest name must match filename: expected ${expectedName}, got ${manifest.name}`,
        )
      }
      if (seenNames.has(manifest.name)) {
        throw new Error(`[${style}] duplicate manifest name: ${manifest.name}`)
      }

      seenNames.add(manifest.name)
      manifests.push(manifest)
    }

    manifests.sort((a, b) => a.name.localeCompare(b.name))

    // Build a per-style source map covering every manifest's files. This is
    // what makes cross-item imports resolve correctly (e.g., a UI component
    // pulling Portal from a separate manifest sees the right install path).
    const styleSourceMap = buildStyleSourceMap(manifests, styleDir)

    const items: RegistryItem[] = []
    for (const manifest of manifests) {
      const item = await buildRegistryItem(manifest, styleDir, styleSourceMap)
      const isValid = validateItem(item)
      assertValid(
        isValid,
        validateItem.errors,
        `[${style}] item ${manifest.name}`,
      )
      items.push(item)
    }

    const styleIndex: RegistryIndex = {
      name: `${REGISTRY_NAME}/${style}`,
      homepage: REGISTRY_HOMEPAGE,
      items: manifests.map((manifest) => buildItemBase(manifest)),
    }

    const styleIndexValid = validateRegistry(styleIndex)
    assertValid(
      styleIndexValid,
      validateRegistry.errors,
      `[${style}] registry index`,
    )

    const styleOutputDir = path.join(OUTPUT_STYLES_DIR, style)
    const styleItemsOutputDir = path.join(styleOutputDir, "r")

    await mkdir(styleItemsOutputDir, { recursive: true })

    await Promise.all(
      items.map((item) =>
        writeJson(path.join(styleItemsOutputDir, `${item.name}.json`), item),
      ),
    )

    await writeJson(path.join(styleOutputDir, "registry.json"), styleIndex)

    bundles.push({ style, manifests, items })
  }

  if (bundles.length === 0) {
    throw new Error(
      "No styles produced any output. Each style must have at least one manifest in its items/ directory.",
    )
  }

  // Top-level index — lists styles with their item counts and links.
  const topLevelIndex: TopLevelIndex = {
    name: REGISTRY_NAME,
    homepage: REGISTRY_HOMEPAGE,
    baseUrl: REGISTRY_BASE_URL,
    version: REGISTRY_VERSION,
    styles: bundles.map((bundle) => ({
      name: bundle.style,
      itemCount: bundle.items.length,
      registryUrl: `${REGISTRY_BASE_URL}/${REGISTRY_VERSION}/styles/${bundle.style}/registry.json`,
    })),
  }

  await writeJson(path.join(OUTPUT_VERSION_DIR, "registry.json"), topLevelIndex)

  logCrossStyleWarnings(bundles)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
