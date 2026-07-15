import ts from "typescript";
import type { Plugin, ResolvedConfig } from "vite";

const MANIFEST_VERSION = 1 as const;
const DEFAULT_MANIFEST_FILE = "loopad-event-manifest.json";

type ReferenceKind = "call" | "dom";

interface SourceReference {
  file: string;
  line: number;
  column: number;
  kind: ReferenceKind;
}

interface SourceReferenceCandidate extends Omit<SourceReference, "file"> {
  eventName: string;
}

interface SourceManifest {
  version: typeof MANIFEST_VERSION;
  buildId: string;
  generatedAt: string;
  events: Record<string, SourceReference[]>;
  externalEvents: string[];
}

export interface LoopAdDiagnosticsPluginOptions {
  externalEvents?: readonly string[];
  manifestFile?: string;
  trackFunctions?: readonly string[];
  trackMethods?: readonly string[];
}

/**
 * 배포를 차단하지 않고 source manifest만 생성하는 데모용 Vite 플러그인입니다.
 * manifest 판정과 표시는 LoopAd Event SDK DevTools가 런타임에 담당합니다.
 */
export function loopAdDiagnostics(
  options: LoopAdDiagnosticsPluginOptions = {},
): Plugin {
  const manifestFile = normalizeManifestFile(options.manifestFile);
  const trackFunctions = new Set(options.trackFunctions ?? ["trackLoopAdEvent"]);
  const trackMethods = new Set(options.trackMethods ?? ["track"]);
  const externalEvents = [...new Set(options.externalEvents ?? [])].sort();
  const references = new Map<string, SourceReference[]>();
  let config: ResolvedConfig | undefined;
  let generatedAt = new Date(0).toISOString();

  function manifest(): SourceManifest {
    const events = Object.fromEntries(
      [...references.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([eventName, eventReferences]) => [
          eventName,
          [...eventReferences].sort(compareReferences),
        ]),
    );
    return {
      version: MANIFEST_VERSION,
      buildId: `${config?.mode ?? "unknown"}-${generatedAt}`,
      generatedAt,
      events,
      externalEvents,
    };
  }

  return {
    name: "loopad-event-diagnostics",
    enforce: "pre",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    buildStart() {
      references.clear();
      generatedAt = new Date().toISOString();
    },
    transform(sourceText, id) {
      const file = sourceFilePath(id, config?.root);
      if (!file) return null;

      const found = collectLoopAdSourceReferences(sourceText, file, {
        trackFunctions,
        trackMethods,
      });
      for (const candidate of found) {
        const reference: SourceReference = {
          file,
          line: candidate.line,
          column: candidate.column,
          kind: candidate.kind,
        };
        const eventReferences = references.get(candidate.eventName) ?? [];
        if (!eventReferences.some((existing) => sameReference(existing, reference))) {
          eventReferences.push(reference);
          references.set(candidate.eventName, eventReferences);
        }
      }
      return null;
    },
    configureServer(server) {
      const publicPath = `/${manifestFile}`;
      server.middlewares.use((request, response, next) => {
        if (request.url?.split("?", 1)[0] !== publicPath) {
          next();
          return;
        }
        response.statusCode = 200;
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.setHeader("Cache-Control", "no-store");
        response.end(JSON.stringify(manifest()));
      });
    },
    transformIndexHtml() {
      return [
        {
          tag: "meta",
          attrs: {
            name: "loopad-source-manifest",
            content: publicManifestPath(config?.base, manifestFile),
          },
          injectTo: "head",
        },
      ];
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: manifestFile,
        source: `${JSON.stringify(manifest(), null, 2)}\n`,
      });
    },
  };
}

export function collectLoopAdSourceReferences(
  sourceText: string,
  fileName: string,
  options: {
    trackFunctions?: ReadonlySet<string>;
    trackMethods?: ReadonlySet<string>;
  } = {},
): SourceReferenceCandidate[] {
  const trackFunctions = options.trackFunctions ?? new Set(["trackLoopAdEvent"]);
  const trackMethods = options.trackMethods ?? new Set(["track"]);
  const sourceFile = ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const references: SourceReferenceCandidate[] = [];

  function add(eventName: string, node: ts.Node, kind: ReferenceKind) {
    const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    references.push({
      eventName,
      line: position.line + 1,
      column: position.character + 1,
      kind,
    });
  }

  function visit(node: ts.Node) {
    if (ts.isCallExpression(node) && isTrackCall(node.expression, trackFunctions, trackMethods)) {
      const eventName = stringLiteral(node.arguments[0]);
      if (eventName) add(eventName, node.arguments[0]!, "call");
    }

    if (
      ts.isJsxAttribute(node) &&
      node.name.getText(sourceFile) === "data-loopad-event" &&
      node.initializer &&
      ts.isStringLiteral(node.initializer)
    ) {
      add(node.initializer.text, node.initializer, "dom");
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return references;
}

function isTrackCall(
  expression: ts.Expression,
  trackFunctions: ReadonlySet<string>,
  trackMethods: ReadonlySet<string>,
) {
  if (ts.isIdentifier(expression)) return trackFunctions.has(expression.text);
  return ts.isPropertyAccessExpression(expression) && trackMethods.has(expression.name.text);
}

function stringLiteral(node: ts.Node | undefined) {
  return node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
    ? node.text.trim()
    : null;
}

function sourceFilePath(id: string, root: string | undefined) {
  const normalized = id.split("?", 1)[0]?.replaceAll("\\", "/");
  if (
    !normalized ||
    !/\.[cm]?[jt]sx?$/.test(normalized) ||
    normalized.includes("/node_modules/") ||
    /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(normalized)
  ) {
    return null;
  }
  const normalizedRoot = root?.replaceAll("\\", "/").replace(/\/$/, "");
  return normalizedRoot && normalized.startsWith(`${normalizedRoot}/`)
    ? normalized.slice(normalizedRoot.length + 1)
    : normalized.replace(/^\/+/, "");
}

function normalizeManifestFile(value: string | undefined) {
  const file = (value ?? DEFAULT_MANIFEST_FILE).replace(/^\/+/, "");
  if (!file || file.includes("..")) throw new Error("manifestFile must be a relative file path");
  return file;
}

function publicManifestPath(base: string | undefined, manifestFile: string) {
  const normalizedBase = !base || base === "./" ? "/" : base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}${manifestFile}`;
}

function sameReference(left: SourceReference, right: SourceReference) {
  return (
    left.file === right.file &&
    left.line === right.line &&
    left.column === right.column &&
    left.kind === right.kind
  );
}

function compareReferences(left: SourceReference, right: SourceReference) {
  return (
    left.file.localeCompare(right.file) ||
    left.line - right.line ||
    left.column - right.column ||
    left.kind.localeCompare(right.kind)
  );
}
