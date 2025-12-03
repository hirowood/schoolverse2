"use client";

import { CURRICULUM_MAP } from "@/lib/curriculum/map";
import type { CurriculumLine, CurriculumNode, CareerLine } from "@/lib/curriculum/types";

export default function CurriculumMapPage() {
  const data = CURRICULUM_MAP;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-slate-500">MECE Curriculum Map</p>
        <h1 className="text-2xl font-semibold">Schoolverse2 カリキュラム＆職種マップ</h1>
        <p className="text-sm text-slate-600">
          カテゴリ / ライン / 職種の対応関係をひと目で確認できます。学習パスやクエスト生成の土台として使うことを想定しています。
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Card title="カリキュラム階層 (Category→Activity)">
          <Hierarchy nodes={data.coreCurriculum} />
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
              <NodeList label="資格" nodes={data.contentLines.certifications} />
              <NodeList label="言語" nodes={data.contentLines.languages} />
              <NodeList label="Web/Framework" nodes={data.contentLines.webFrameworks} />
              <NodeList label="React" nodes={data.contentLines.react} />
              <NodeList label="Next.js" nodes={data.contentLines.nextjs} />
              <NodeList label="AI/ML" nodes={data.contentLines.ai} />
              <NodeList label="事務・DX/AX" nodes={data.contentLines.officeDxAx} />
            </div>
          </Card>
          <Card title="役割別ライン（ユニット概要とミッション例）">
            <div className="space-y-4">
              {data.contentLines.roleLines.map((line) => (
                <RoleLine key={line.id} line={line} />
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">職種マップ（カリキュラムとのリンク）</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <CareerColumn title="エンジニア系" items={data.careers.engineer} />
          <CareerColumn title="事務・バックオフィス×IT" items={data.careers.office} />
          <CareerColumn title="AX / DX / データ" items={data.careers.axDxData} />
        </div>
      </section>

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
      <div className="flex flex-wrap gap-2">
        {nodes.map((node) => (
          <div key={node.id} className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/70 min-w-[120px]">
            <p className="font-semibold text-slate-800">{node.name}</p>
            {node.children && node.children.length > 0 && (
              <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                {node.children.map((c) => c.name).join(" / ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function RoleLine({ line }: { line: CurriculumLine }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/60 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-800">{line.title}</p>
          <p className="text-xs text-slate-600">{line.summary}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {line.units.map((u) => (
          <span key={u.id} className="text-[11px] px-2 py-1 rounded-full bg-white border border-slate-200">
            {u.title}
          </span>
        ))}
      </div>
      {line.missions && line.missions.length > 0 && (
        <p className="text-[11px] text-slate-600">
          ミッション例: {line.missions.join(" / ")}
        </p>
      )}
    </div>
  );
}

function CareerColumn({ title, items }: { title: string; items: CareerLine[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/60 p-3 space-y-3">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <div className="space-y-2">
        {items.map((c) => (
          <div key={c.id} className="border border-slate-200 rounded-md p-2 bg-slate-50/80 space-y-1">
            <p className="text-sm font-semibold text-slate-800">{c.name}</p>
            <p className="text-[12px] text-slate-600">{c.what}</p>
            <p className="text-[11px] text-slate-600">
              対応カリキュラム: {c.linkedCurriculumIds.join(", ")}
            </p>
            {c.sampleMissions && c.sampleMissions.length > 0 && (
              <p className="text-[11px] text-slate-600">ミッション例: {c.sampleMissions.join(" / ")}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
