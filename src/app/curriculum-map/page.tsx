"use client";

import { useMemo, useState } from "react";
import { CURRICULUM_MAP } from "@/lib/curriculum/map";
import type { CurriculumLine, CurriculumNode, CareerLine } from "@/lib/curriculum/types";

export default function CurriculumMapPage() {
  const [keyword, setKeyword] = useState("");
  const [sectionFilter, setSectionFilter] = useState<"all" | "curriculum" | "career">("all");
  const data = CURRICULUM_MAP;
  const term = keyword.trim().toLowerCase();

  const filtered = useMemo(() => {
    const match = (text?: string | null) => (text ?? "").toLowerCase().includes(term);

    const filterNodes = (nodes: CurriculumNode[]): CurriculumNode[] =>
      nodes
        .map((n) => {
          const childMatches = n.children ? filterNodes(n.children) : [];
          const selfMatch = match(n.name) || match(n.description);
          if (selfMatch || childMatches.length > 0 || term === "" || sectionFilter === "career") {
            return { ...n, children: childMatches.length ? childMatches : n.children };
          }
          return null;
        })
        .filter(Boolean) as CurriculumNode[];

    const filterLine = (line: CurriculumLine): CurriculumLine | null => {
      const unitHit = line.units.some((u) => match(u.title) || match(u.description));
      const missionHit = line.missions?.some((m) => match(m));
      const selfHit = match(line.title) || match(line.summary);
      if (term === "" || selfHit || unitHit || missionHit || sectionFilter === "career") return line;
      return null;
    };

    const filterCareer = (c: CareerLine): CareerLine | null => {
      const hit =
        match(c.name) || match(c.what) || c.linkedCurriculumIds.some((id) => match(id)) || c.sampleMissions?.some(match);
      return term === "" || hit || sectionFilter === "curriculum" ? c : null;
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
      roleLines: data.contentLines.roleLines.map(filterLine).filter(Boolean) as CurriculumLine[],
      careers: {
        engineer: data.careers.engineer.map(filterCareer).filter(Boolean) as CareerLine[],
        office: data.careers.office.map(filterCareer).filter(Boolean) as CareerLine[],
        axDxData: data.careers.axDxData.map(filterCareer).filter(Boolean) as CareerLine[],
      },
    };
  }, [data, term]);

  return (
    <HighlightProvider keyword={keyword}>
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
      <header className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm text-slate-500">MECE Curriculum Map</p>
          <h1 className="text-2xl font-semibold">Schoolverse2 カリキュラム＆職種マップ</h1>
          <p className="text-sm text-slate-600">
            カテゴリ / ライン / 職種の対応関係をひと目で確認できます。学習パスやクエスト生成の土台として使うことを想定しています。
          </p>
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
          <Tabs value={sectionFilter} onChange={setSectionFilter} />
        </div>
      </header>

      {(sectionFilter === "all" || sectionFilter === "curriculum") && (
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

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">コンテンツライン</h2>
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
                </div>
              </Card>
            </div>
          </section>
        </>
      )}

      {(sectionFilter === "all" || sectionFilter === "career") && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">職種マップ（カリキュラムとのリンク）</h2>
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

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs border transition ${
        active ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-700 border-slate-200"
      }`}
    >
      {label}
    </button>
  );
}

function Tabs({
  value,
  onChange,
}: {
  value: "all" | "curriculum" | "career";
  onChange: (val: "all" | "curriculum" | "career") => void;
}) {
  const items: Array<{ label: string; value: "all" | "curriculum" | "career" }> = [
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

function Highlight({ text }: { text: string }) {
  const { keyword } = useHighlightContext();
  if (!keyword) return <>{text}</>;
  const lower = text.toLowerCase();
  const term = keyword.toLowerCase();
  const idx = lower.indexOf(term);
  if (idx === -1) return <>{text}</>;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + term.length);
  const after = text.slice(idx + term.length);
  return (
    <>
      {before}
      <mark className="bg-yellow-200 text-slate-900 rounded px-[1px]">{match}</mark>
      {after}
    </>
  );
}

// 簡易コンテキストで検索語を共有
import { createContext, useContext } from "react";

const HighlightContext = createContext<{ keyword: string }>({ keyword: "" });

function HighlightProvider({ keyword, children }: { keyword: string; children: React.ReactNode }) {
  return <HighlightContext.Provider value={{ keyword }}>{children}</HighlightContext.Provider>;
}

function useHighlightContext() {
  return useContext(HighlightContext);
}
