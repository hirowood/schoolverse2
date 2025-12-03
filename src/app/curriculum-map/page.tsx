"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import type { CareerLine, CurriculumLine, CurriculumMap, CurriculumNode } from "@/lib/curriculum/types";
import { CURRICULUM_MAP } from "@/lib/curriculum/map";

type SectionFilter = "all" | "curriculum" | "career";
type SearchMode = "and" | "or";

export default function CurriculumMapPage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>("all");
  const [searchMode, setSearchMode] = useState<SearchMode>("or");
  const [remoteMap, setRemoteMap] = useState<CurriculumMap | null>(null);
  const [remoteLines, setRemoteLines] = useState<CurriculumLine[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHitsOnly, setShowHitsOnly] = useState(false);
  const [mindMapOpen, setMindMapOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<CurriculumNode | null>(null);
  const selectedRef = useRef<HTMLDivElement | null>(null);

  // ラインのみ q 付きで再フェッチ
  const fetchLines = async (query?: string) => {
    try {
      const qs = query ? `?q=${encodeURIComponent(query)}` : "";
      const res = await fetch(`/api/curriculum/lines${qs}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setRemoteLines(json.data ?? null);
    } catch {
      setRemoteLines(null);
    }
  };

  // マップ全体を取得
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/curriculum/map");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) setRemoteMap(json.data as CurriculumMap);
      } catch {
        if (!cancelled) setError("最新データの取得に失敗しました（ローカルデータを使用します）");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  // キーワードが変わったらラインを再取得
  useEffect(() => {
    fetchLines(keyword);
  }, [keyword]);

  // 選択パネルへスクロール
  useEffect(() => {
    if (selectedNode && selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedNode]);

  const data = remoteMap ?? CURRICULUM_MAP;
  const terms = keyword
    .split(/\s+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const filtered = useMemo(() => {
    const roleLinesSource = remoteLines ?? data.contentLines.roleLines;
    const matches = (text?: string | null) => {
      if (terms.length === 0) return true;
      const hay = (text ?? "").toLowerCase();
      if (searchMode === "or") return terms.some((t) => hay.includes(t));
      return terms.every((t) => hay.includes(t));
    };

    const filterNodes = (nodes: CurriculumNode[]): CurriculumNode[] =>
      nodes
        .map((n) => {
          const childMatches = n.children ? filterNodes(n.children) : [];
          const selfMatch = matches(n.name) || matches(n.description);
          if (selfMatch || childMatches.length > 0 || terms.length === 0 || sectionFilter === "career") {
            return { ...n, children: childMatches.length ? childMatches : n.children };
          }
          return null;
        })
        .filter(Boolean) as CurriculumNode[];

    const filterLine = (line: CurriculumLine): CurriculumLine | null => {
      const unitHit = line.units.some((u) => matches(u.title) || matches(u.description));
      const missionHit = line.missions?.some((m) => matches(m));
      const missionDetailsHit = line.missionDetails?.some(
        (m) => matches(m.title) || matches(m.description) || m.tags?.some((t) => matches(t)) || matches(String(m.effortMinutes ?? "")),
      );
      const selfHit = matches(line.title) || matches(line.summary);
      if (terms.length === 0 || selfHit || unitHit || missionHit || missionDetailsHit || sectionFilter === "career") {
        return line;
      }
      return null;
    };

    const filterCareer = (c: CareerLine): CareerLine | null => {
      const hit =
        matches(c.name) ||
        matches(c.what) ||
        c.linkedCurriculumIds.some((id) => matches(id)) ||
        c.sampleMissions?.some((m) => matches(m));
      return terms.length === 0 || hit || sectionFilter === "curriculum" ? c : null;
    };

    const certificationLeaves = data.contentLines.certifications.flatMap((c) => c.children ?? []);

    return {
      coreCurriculum: filterNodes(data.coreCurriculum),
      certifications: filterNodes(data.contentLines.certifications),
      certificationLeaves: filterNodes(certificationLeaves),
      languages: filterNodes(data.contentLines.languages),
      web: filterNodes(data.contentLines.webFrameworks),
      react: filterNodes(data.contentLines.react),
      nextjs: filterNodes(data.contentLines.nextjs),
      ai: filterNodes(data.contentLines.ai),
      office: filterNodes(data.contentLines.officeDxAx),
      thinking: filterNodes(data.contentLines.thinking),
      handsOn: filterNodes(data.contentLines.handsOn ?? []),
      roleLines: roleLinesSource.map(filterLine).filter(Boolean) as CurriculumLine[],
      careers: {
        engineer: data.careers.engineer.map(filterCareer).filter(Boolean) as CareerLine[],
        office: data.careers.office.map(filterCareer).filter(Boolean) as CareerLine[],
        axDxData: data.careers.axDxData.map(filterCareer).filter(Boolean) as CareerLine[],
      },
    };
  }, [data, terms, searchMode, sectionFilter, remoteLines]);

  const counts = {
    core: filtered.coreCurriculum.length,
    content:
      filtered.certifications.length +
      filtered.languages.length +
      filtered.web.length +
      filtered.react.length +
      filtered.nextjs.length +
      filtered.ai.length +
      filtered.office.length +
      filtered.thinking.length +
      filtered.certificationLeaves.length +
      filtered.handsOn.length,
    roleLines: filtered.roleLines.length,
    careers: filtered.careers.engineer.length + filtered.careers.office.length + filtered.careers.axDxData.length,
  };

  return (
    <HighlightProvider keywords={terms}>
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
        <header className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm text-slate-500">MECE Curriculum Map</p>
            <h1 className="text-2xl font-semibold">Schoolverse2 カリキュラム＆職業マップ</h1>
            <p className="text-sm text-slate-600">
              カテゴリ / ライン / 職種の対応関係を俯瞰できます。学習パスやクエスト生成の参照として活用ください。
            </p>
            {loading && <p className="text-xs text-slate-500">読み込み中...</p>}
            {error && <p className="text-xs text-amber-600">{error}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <div className="w-full md:w-96">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="キーワードで絞り込み（例: React, DX, QA, BI ...）"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:items-center">
              <Tabs value={sectionFilter} onChange={setSectionFilter} />
              <SearchModeToggle value={searchMode} onChange={setSearchMode} />
              <HitToggle value={showHitsOnly} onChange={setShowHitsOnly} />
              {remoteLines === null && (
                <p className="text-[11px] text-amber-600">ライン詳細の取得に失敗しました（ローカルデータ利用）</p>
              )}
            </div>
          </div>
        </header>

        {(sectionFilter === "all" || sectionFilter === "curriculum") && (!showHitsOnly || counts.core > 0) && (
          <>
            <section className="grid gap-4 md:grid-cols-2">
              <Card title="カリキュラム全体像 (Category〜Activity)">
                <Hierarchy nodes={filtered.coreCurriculum} onSelect={setSelectedNode} />
              </Card>
              <Card title="学習パス (タイプ / ノード)">
                <div className="space-y-3">
                  <ChipList label="パスタイプ" items={data.learningPaths.types} />
                  <ChipList label="ノードタイプ" items={data.learningPaths.nodeTypes} />
                </div>
              </Card>
            </section>

            {(counts.content + counts.roleLines > 0 || !showHitsOnly) && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  コンテンツライン <Badge count={counts.content + counts.roleLines} />
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card title="資格 / 言語 / Web / AI / 事務DX/AX / 思考 / ハンズオン">
                    <div className="space-y-4">
                      <NodeList
                        label="資格"
                        nodes={filtered.certificationLeaves}
                        onSelect={setSelectedNode}
                        selectedId={selectedNode?.id}
                        linkTo={(node) => `/certifications/${node.id}`}
                        router={router}
                      />
                      <NodeList label="言語" nodes={filtered.languages} onSelect={setSelectedNode} selectedId={selectedNode?.id} />
                      <NodeList label="Web/Framework" nodes={filtered.web} onSelect={setSelectedNode} selectedId={selectedNode?.id} />
                      <NodeList label="React" nodes={filtered.react} onSelect={setSelectedNode} selectedId={selectedNode?.id} />
                      <NodeList label="Next.js" nodes={filtered.nextjs} onSelect={setSelectedNode} selectedId={selectedNode?.id} />
                      <NodeList label="AI/ML/LLM" nodes={filtered.ai} onSelect={setSelectedNode} selectedId={selectedNode?.id} />
                      <NodeList label="事務・業務効率(DX/AX)" nodes={filtered.office} onSelect={setSelectedNode} selectedId={selectedNode?.id} />
                      <NodeList label="思考スキル" nodes={filtered.thinking} onSelect={setSelectedNode} selectedId={selectedNode?.id} />
                      <NodeList label="ハンズオン演習" nodes={filtered.handsOn} onSelect={setSelectedNode} selectedId={selectedNode?.id} />
                    </div>
                  </Card>

                  <Card title="ロールライン（パス例とミッション例）">
                    <div className="space-y-3">
                      {filtered.roleLines.length === 0 ? (
                        <p className="text-xs text-slate-500">該当なし</p>
                      ) : (
                        filtered.roleLines.map((line) => (
                          <RoleLine
                            key={line.id}
                            line={line}
                            onSelect={() =>
                              setSelectedNode({
                                id: line.id,
                                name: line.title,
                                description: line.summary,
                                children: line.units.map((u) => ({ id: u.id, name: u.title })),
                              })
                            }
                          />
                        ))
                      )}
                    </div>
                  </Card>
                </div>
              </section>
            )}
          </>
        )}

        {(sectionFilter === "all" || sectionFilter === "career") && (!showHitsOnly || counts.careers > 0) && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              職種/キャリアライン <Badge count={counts.careers} />
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <CareerColumn title="エンジニア系" items={filtered.careers.engineer} />
              <CareerColumn title="事務/バックオフィス" items={filtered.careers.office} />
              <CareerColumn title="AX/DX/データ" items={filtered.careers.axDxData} />
            </div>
          </section>
        )}

        <section className="flex flex-wrap items-center gap-3">
          <button
            className="px-3 py-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium"
            onClick={() => setMindMapOpen(true)}
          >
            マインドマップを開く
          </button>
          <p className="text-xs text-slate-500">思考系カリキュラム学習中に開いて、整理用マップとして使えます。</p>
        </section>

        {mindMapOpen && (
          <div className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                <div>
                  <p className="text-xs text-slate-500">Mindmap</p>
                  <h3 className="text-base font-semibold text-slate-800">思考スキルのマインドマップ</h3>
                </div>
                <button
                  onClick={() => setMindMapOpen(false)}
                  className="rounded-md border border-slate-200 px-3 py-1 text-sm hover:bg-slate-50"
                >
                  閉じる
                </button>
              </div>
              <div className="flex-1 overflow-hidden bg-slate-50">
                <iframe
                  title="mindmap"
                  src="https://embed.coggle.it/diagram/ZNQmHoU9uQykb5WW/3fa9169ea30a4d47199fafda6137d59e12c35b59c58b82cb7afc7b34b5f6da7d"
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}

        {selectedNode && (
          <section ref={selectedRef} className="space-y-3 rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">選択中のカリキュラム</p>
                <h3 className="text-lg font-semibold text-slate-900">
                  <Highlight text={selectedNode.name} />
                </h3>
                {selectedNode.description && (
                  <p className="text-sm text-slate-700">
                    <Highlight text={selectedNode.description} />
                  </p>
                )}
              </div>
              <button
                className="text-xs text-slate-500 hover:text-slate-800 underline"
                onClick={() => setSelectedNode(null)}
                type="button"
              >
                クリア
              </button>
            </div>
            {selectedNode.children && selectedNode.children.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-600">子要素</p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                  {selectedNode.children.map((c) => (
                    <li key={c.id}>
                      <Highlight text={c.name} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              <Link
                href={`/learning-chat?topic=${encodeURIComponent(selectedNode.id)}`}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                学習チャットで相談
              </Link>
              <Link
                href={`/plan?topic=${encodeURIComponent(selectedNode.id)}`}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                学習プランに追加
              </Link>
            </div>
          </section>
        )}
      </div>
    </HighlightProvider>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/60 shadow-sm p-4 space-y-3">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      {children}
    </div>
  );
}

function ChipList({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-600">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function NodeList({
  label,
  nodes,
  onSelect,
  selectedId,
  linkTo,
  router,
}: {
  label: string;
  nodes: CurriculumNode[];
  onSelect: (n: CurriculumNode) => void;
  selectedId?: string | null;
  linkTo?: (n: CurriculumNode) => string;
  router?: ReturnType<typeof useRouter>;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-600">{label}</p>
      {nodes.length === 0 ? (
        <p className="text-[11px] text-slate-500">該当なし</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {nodes.map((node) => (
            <button
              key={node.id}
              className={`text-left text-xs px-3 py-2 rounded-lg border min-w-[140px] shadow-sm transition ${
                selectedId === node.id
                  ? "border-slate-400 bg-white"
                  : "border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white"
              }`}
              onClick={() => {
                onSelect(node);
                if (linkTo && router) {
                  router.push(linkTo(node));
                }
              }}
            >
              <p className="font-semibold text-slate-800">
                <Highlight text={node.name} />
              </p>
              {node.children && node.children.length > 0 && (
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                  {node.children.map((c) => c.name).join(" / ")}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RoleLine({ line, onSelect }: { line: CurriculumLine; onSelect: () => void }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/60 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            <Highlight text={line.title} />
          </p>
          <p className="text-xs text-slate-600">
            <Highlight text={line.summary} />
          </p>
        </div>
        <button
          onClick={onSelect}
          className="text-[11px] px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100"
        >
          詳細パネルに表示
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {line.units.map((u) => (
          <span key={u.id} className="text-[11px] px-2 py-1 rounded-full bg-white border border-slate-200">
            <Highlight text={u.title} />
          </span>
        ))}
      </div>
      {line.missions && line.missions.length > 0 && (
        <p className="text-[11px] text-slate-600">
          ミッション例: <Highlight text={line.missions.join(" / ")} />
        </p>
      )}
      {line.missionDetails && line.missionDetails.length > 0 && (
        <div className="space-y-2 text-[11px] text-slate-600">
          {line.missionDetails.map((m) => (
            <div key={m.id} className="rounded border border-slate-200 bg-white/80 p-2 space-y-1">
              <p className="font-semibold text-slate-800">
                <Highlight text={m.title} />
              </p>
              <p className="text-slate-700">
                <Highlight text={m.description} />
              </p>
              {m.expectedOutputs && (
                <p>
                  アウトプット例: <Highlight text={m.expectedOutputs.join(" / ")} />
                </p>
              )}
              {m.tools && (
                <p>
                  ツール: <Highlight text={m.tools.join(", ")} />
                </p>
              )}
              {m.effortMinutes && <p>目安時間: {m.effortMinutes}分</p>}
              {m.tags && m.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {m.tags.map((t) => (
                    <span key={t} className="px-2 py-[2px] text-[10px] rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2 text-[10px]">
                <a className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-100" href={`/learning-path?lineId=${line.id}&missionId=${m.id}`}>
                  Learning Pathへ
                </a>
                <a className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-100" href={`/quests?lineId=${line.id}&missionId=${m.id}`}>
                  Quest生成へ
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CareerColumn({ title, items }: { title: string; items: CareerLine[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/60 p-3 space-y-3">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {items.length === 0 ? (
        <p className="text-[11px] text-slate-500">該当なし</p>
      ) : (
        <div className="space-y-2">
          {items.map((c) => (
            <div key={c.id} className="border border-slate-200 rounded-md p-2 bg-slate-50/80 space-y-1">
              <p className="text-sm font-semibold text-slate-800">
                <Highlight text={c.name} />
              </p>
              <p className="text-[12px] text-slate-600">
                <Highlight text={c.what} />
              </p>
              <p className="text-[11px] text-slate-600">
                対応カリキュラム: <Highlight text={c.linkedCurriculumIds.join(", ")} />
              </p>
              {c.sampleMissions && c.sampleMissions.length > 0 && (
                <p className="text-[11px] text-slate-600">
                  ミッション例: <Highlight text={c.sampleMissions.join(" / ")} />
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Hierarchy({ nodes, onSelect }: { nodes: CurriculumNode[]; onSelect: (n: CurriculumNode) => void }) {
  const renderNode = (n: CurriculumNode) => (
    <li key={n.id} className="space-y-1">
      <details className="group" open>
        <summary
          className="cursor-pointer select-none text-sm font-semibold text-slate-800 flex items-center gap-2"
          onClick={(e) => {
            e.preventDefault();
            onSelect(n);
          }}
        >
          <Highlight text={n.name} />
          <span className="text-[10px] text-slate-500 group-open:hidden">（クリックで詳細）</span>
        </summary>
        {n.description && (
          <p className="text-xs text-slate-600 pl-4">
            <Highlight text={n.description} />
          </p>
        )}
        {n.children && n.children.length > 0 && (
          <ul className="ml-4 list-disc space-y-1 text-xs text-slate-700">
            {n.children.map((c) => renderNode(c))}
          </ul>
        )}
      </details>
    </li>
  );

  return (
    <div className="space-y-1 text-sm text-slate-700">
      {nodes.length === 0 ? <p className="text-xs text-slate-500">該当なし</p> : <ul className="space-y-1">{nodes.map((n) => renderNode(n))}</ul>}
    </div>
  );
}

function Tabs({ value, onChange }: { value: SectionFilter; onChange: (val: SectionFilter) => void }) {
  const items: Array<{ label: string; value: SectionFilter }> = [
    { label: "すべて", value: "all" },
    { label: "カリキュラム", value: "curriculum" },
    { label: "職種", value: "career" },
  ];
  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white/70 p-1">
      {items.map((item) => (
        <button
          key={item.value}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            value === item.value ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
          }`}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function SearchModeToggle({ value, onChange }: { value: SearchMode; onChange: (val: SearchMode) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white/70 px-2 py-1">
      <button
        className={`px-3 py-1 rounded-md text-xs font-semibold ${value === "or" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`}
        onClick={() => onChange("or")}
      >
        OR検索
      </button>
      <button
        className={`px-3 py-1 rounded-md text-xs font-semibold ${value === "and" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`}
        onClick={() => onChange("and")}
      >
        AND検索
      </button>
    </div>
  );
}

function HitToggle({ value, onChange }: { value: boolean; onChange: (val: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-xs text-slate-700">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="rounded border-slate-300" />
      ヒット項目だけ表示
    </label>
  );
}

function Badge({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm">
      {count}
    </span>
  );
}

// --- ハイライト ---
const HighlightContext = createContext<string[]>([]);

function HighlightProvider({ keywords, children }: { keywords: string[]; children: React.ReactNode }) {
  return <HighlightContext.Provider value={keywords}>{children}</HighlightContext.Provider>;
}

function Highlight({ text }: { text?: string }) {
  const keywords = useContext(HighlightContext);
  if (!text) return null;
  if (keywords.length === 0) return <>{text}</>;

  const lower = text.toLowerCase();
  const firstHit = keywords.find((k) => lower.includes(k));
  if (!firstHit) return <>{text}</>;

  const idx = lower.indexOf(firstHit);
  if (idx === -1) return <>{text}</>;
  const before = text.slice(0, idx);
  const hit = text.slice(idx, idx + firstHit.length);
  const after = text.slice(idx + firstHit.length);

  return (
    <>
      {before}
      <mark className="bg-amber-200 text-slate-900">{hit}</mark>
      <Highlight text={after} />
    </>
  );
}

