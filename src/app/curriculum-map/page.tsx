"use client";

import { useEffect, useMemo, useState, createContext, useContext } from "react";
import type { CareerLine, CurriculumLine, CurriculumMap, CurriculumNode } from "@/lib/curriculum/types";
import { CURRICULUM_MAP } from "@/lib/curriculum/map";

type SectionFilter = "all" | "curriculum" | "career";
type SearchMode = "and" | "or";

export default function CurriculumMapPage() {
  const [keyword, setKeyword] = useState("");
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>("all");
  const [searchMode, setSearchMode] = useState<SearchMode>("or");
  const [remoteMap, setRemoteMap] = useState<CurriculumMap | null>(null);
  const [remoteLines, setRemoteLines] = useState<CurriculumLine[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHitsOnly, setShowHitsOnly] = useState(false);

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
        if (!cancelled) setError("最新データの取得に失敗したためローカル定義を使用します。");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    fetchLines(keyword);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

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
        (m) => matches(m.title) || matches(m.description) || m.tags?.some((t) => matches(t)),
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

    return {
      coreCurriculum: filterNodes(data.coreCurriculum),
      certifications: filterNodes(data.contentLines.certifications),
      languages: filterNodes(data.contentLines.languages),
      web: filterNodes(data.contentLines.webFrameworks),
      react: filterNodes(data.contentLines.react),
      nextjs: filterNodes(data.contentLines.nextjs),
      ai: filterNodes(data.contentLines.ai),
      office: filterNodes(data.contentLines.officeDxAx),
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
      filtered.office.length,
    roleLines: filtered.roleLines.length,
    careers: filtered.careers.engineer.length + filtered.careers.office.length + filtered.careers.axDxData.length,
  };

  return (
    <HighlightProvider keywords={terms}>
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
        <header className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm text-slate-500">MECE Curriculum Map</p>
            <h1 className="text-2xl font-semibold">Schoolverse2 カリキュラム＆職種マップ</h1>
            <p className="text-sm text-slate-600">
              カテゴリ / ライン / 職種の対応関係をひと目で確認できます。学習パスやクエスト生成の土台として使うことを想定しています。
            </p>
            {loading && <p className="text-xs text-slate-500">同期中...</p>}
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
                <p className="text-[11px] text-amber-600">ライン詳細の同期に失敗しました（ローカル定義を使用）</p>
              )}
            </div>
          </div>
        </header>

        {(sectionFilter === "all" || sectionFilter === "curriculum") && (!showHitsOnly || counts.core > 0) && (
          <>
            <section className="grid gap-4 md:grid-cols-2">
              <Card title="カリキュラム階層 (Category→Activity)">
                <Hierarchy nodes={filtered.coreCurriculum} />
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
                  <Card title="資格 / 言語 / Web / AI / 事務・DX/AX">
                    <div className="space-y-4">
                      <NodeList label="資格" nodes={filtered.certifications} />
                      <NodeList label="言語" nodes={filtered.languages} />
                      <NodeList label="Web/Framework" nodes={filtered.web} />
                      <NodeList label="React" nodes={filtered.react} />
                      <NodeList label="Next.js" nodes={filtered.nextjs} />
                      <NodeList label="AI/ML" nodes={filtered.ai} />
                      <NodeList label="事務・DX/AX" nodes={filtered.office} />
                    </div>
                  </Card>
                  <Card title="役割別ライン（ユニット概要とミッション例）">
                    <div className="space-y-4">
              {filtered.roleLines.map((line) => (
                <RoleLine key={line.id} line={line} />
              ))}
              {filtered.roleLines.length === 0 && <p className="text-xs text-slate-500">該当なし</p>}
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
              職種マップ（カリキュラムとのリンク） <Badge count={counts.careers} />
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <CareerColumn title="エンジニア系" items={filtered.careers.engineer} />
              <CareerColumn title="事務・バックオフィス×IT" items={filtered.careers.office} />
              <CareerColumn title="AX / DX / データ" items={filtered.careers.axDxData} />
            </div>
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-2">
          <Card title="仮説（5本）">
            <ul className="list-disc list-inside text-sm space-y-1 text-slate-700">
              {data.hypotheses.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </Card>
          <Card title="設計の落とし穴">
            <ul className="list-disc list-inside text-sm space-y-1 text-slate-700">
              {data.pitfalls.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </Card>
        </section>
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

function NodeList({ label, nodes }: { label: string; nodes: CurriculumNode[] }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-600">{label}</p>
      {nodes.length === 0 ? (
        <p className="text-[11px] text-slate-500">該当なし</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {nodes.map((node) => (
            <div
              key={node.id}
              className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/70 min-w-[120px]"
            >
              <p className="font-semibold text-slate-800">
                <Highlight text={node.name} />
              </p>
              {node.children && node.children.length > 0 && (
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                  {node.children.map((c) => c.name).join(" / ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RoleLine({ line }: { line: CurriculumLine }) {
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
            <div key={m.id} className="rounded border border-slate-200 bg-white/80 p-2">
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

function Hierarchy({ nodes }: { nodes: CurriculumNode[] }) {
  return (
    <div className="space-y-1 text-sm text-slate-700">
      {nodes.length === 0 ? (
        <p className="text-xs text-slate-500">該当なし</p>
      ) : (
        <ul className="space-y-1">
          {nodes.map((n) => (
            <li key={n.id}>
              <span className="font-semibold">
                <Highlight text={n.name} />
              </span>
              {n.children && n.children.length > 0 && (
                <ul className="ml-4 list-disc space-y-1 text-xs text-slate-600">
                  {n.children.map((c) => (
                    <li key={c.id}>
                      <Highlight text={c.name} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Tabs({ value, onChange }: { value: SectionFilter; onChange: (val: SectionFilter) => void }) {
  const items: Array<{ label: string; value: SectionFilter }> = [
    { label: "全て", value: "all" },
    { label: "カテゴリ", value: "curriculum" },
    { label: "職種", value: "career" },
  ];
  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white/70 p-1">
      {items.map((item) => {
        const active = value === item.value;
        return (
          <button
            key={item.value}
            onClick={() => onChange(item.value)}
            className={`flex-1 min-w-[90px] text-xs px-3 py-2 rounded-md border transition ${
              active ? "bg-slate-800 text-white border-slate-800 shadow-sm" : "bg-white text-slate-700 border-slate-200"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function SearchModeToggle({ value, onChange }: { value: SearchMode; onChange: (v: SearchMode) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-white/70">
      {(["or", "and"] as const).map((mode, idx) => {
        const active = value === mode;
        return (
          <button
            key={mode}
            onClick={() => onChange(mode)}
            className={`px-3 py-2 text-xs border-l ${idx === 0 ? "first:border-l-0" : ""} transition ${
              active ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-700 border-slate-200"
            }`}
          >
            {mode === "or" ? "OR（いずれか）" : "AND（すべて）"}
          </button>
        );
      })}
    </div>
  );
}

function HitToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`text-xs px-3 py-2 rounded-md border transition ${
        value ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-700 border-slate-200"
      }`}
    >
      {value ? "ヒットのみ表示中" : "ヒットのみ表示"}
    </button>
  );
}

function Highlight({ text }: { text: string }) {
  const { keywords } = useHighlightContext();
  if (!keywords.length) return <>{text}</>;
  const escaped = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={`${part}-${i}`} className="bg-yellow-200 text-slate-900 rounded px-[1px]">
            {part}
          </mark>
        ) : (
          <span key={`${part}-${i}`}>{part}</span>
        ),
      )}
    </>
  );
}

function Badge({ count }: { count: number }) {
  return (
    <span className="text-[11px] px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">{count}</span>
  );
}

const HighlightContext = createContext<{ keywords: string[] }>({ keywords: [] });

function HighlightProvider({ keywords, children }: { keywords: string[]; children: React.ReactNode }) {
  return <HighlightContext.Provider value={{ keywords }}>{children}</HighlightContext.Provider>;
}

function useHighlightContext() {
  return useContext(HighlightContext);
}
