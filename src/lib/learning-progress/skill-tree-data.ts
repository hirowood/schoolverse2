export type SkillNode = {
  name: string;
  requiredXp: number;
  prerequisites?: string[];
  children?: Record<string, SkillNode>;
  icon?: string;
  color?: string;
};

export type SkillTree = Record<string, SkillNode>;

export const SKILL_TREE_DATA: SkillTree = {
  // ===== プログラミング系 =====
  programming: {
    name: "プログラミング",
    icon: "💻",
    color: "#3B82F6",
    requiredXp: 0,
    children: {
      programming_basic: {
        name: "プログラミング基礎",
        requiredXp: 500,
        children: {
          variables: { name: "変数と型", requiredXp: 100 },
          conditions: { name: "条件分岐", requiredXp: 100, prerequisites: ["variables"] },
          loops: { name: "ループ", requiredXp: 100, prerequisites: ["conditions"] },
          functions: { name: "関数", requiredXp: 150, prerequisites: ["loops"] },
          data_structures: { name: "データ構造", requiredXp: 200, prerequisites: ["functions"] },
        },
      },
      programming_web: {
        name: "Web開発",
        requiredXp: 1000,
        prerequisites: ["programming_basic"],
        children: {
          html_css: { name: "HTML/CSS", requiredXp: 200 },
          javascript: { name: "JavaScript", requiredXp: 300, prerequisites: ["html_css"] },
          react: { name: "React", requiredXp: 400, prerequisites: ["javascript"] },
          nextjs: { name: "Next.js", requiredXp: 500, prerequisites: ["react"] },
        },
      },
    },
  },

  // ===== AI系 =====
  ai: {
    name: "AI・機械学習",
    icon: "🤖",
    color: "#8B5CF6",
    requiredXp: 0,
    children: {
      ai_prompt: {
        name: "プロンプトエンジニアリング",
        requiredXp: 300,
        children: {
          prompt_basics: { name: "プロンプト基礎", requiredXp: 100 },
          prompt_advanced: { name: "高度なプロンプト", requiredXp: 150, prerequisites: ["prompt_basics"] },
          prompt_chain: { name: "プロンプトチェーン", requiredXp: 200, prerequisites: ["prompt_advanced"] },
        },
      },
      ai_vibe_coding: {
        name: "バイブコーディング",
        requiredXp: 400,
        prerequisites: ["ai_prompt"],
        children: {
          vibe_intro: { name: "AI協調開発入門", requiredXp: 100 },
          vibe_iteration: { name: "イテレーション技法", requiredXp: 150 },
          vibe_review: { name: "AIコードレビュー", requiredXp: 200 },
        },
      },
      ai_driven_dev: {
        name: "AI駆動開発",
        requiredXp: 600,
        prerequisites: ["ai_vibe_coding"],
      },
      ai_ml: {
        name: "機械学習",
        requiredXp: 1000,
        prerequisites: ["python_data"],
        children: {
          ml_basics: { name: "ML基礎", requiredXp: 200 },
          ml_supervised: { name: "教師あり学習", requiredXp: 300 },
          ml_unsupervised: { name: "教師なし学習", requiredXp: 300 },
          ml_deep: { name: "ディープラーニング", requiredXp: 500 },
        },
      },
    },
  },

  // ===== ビジネス変革系 =====
  business: {
    name: "ビジネス変革",
    icon: "📊",
    color: "#10B981",
    requiredXp: 0,
    children: {
      ax: {
        name: "AX (Agent Transformation)",
        requiredXp: 500,
        children: {
          ax_concept: { name: "AX概念理解", requiredXp: 150 },
          ax_design: { name: "エージェント設計", requiredXp: 200 },
          ax_implement: { name: "AX実装", requiredXp: 300 },
        },
      },
      dx: {
        name: "DX (Digital Transformation)",
        requiredXp: 500,
        children: {
          dx_basics: { name: "DX基礎", requiredXp: 150 },
          dx_strategy: { name: "DX戦略", requiredXp: 200 },
          dx_execution: { name: "DX実行", requiredXp: 300 },
        },
      },
    },
  },

  // ===== アプリ開発プロセス =====
  app_development: {
    name: "アプリ開発",
    icon: "📱",
    color: "#F59E0B",
    requiredXp: 0,
    children: {
      app_planning: {
        name: "企画",
        requiredXp: 300,
        children: {
          ideation: { name: "アイデア発想", requiredXp: 100 },
          market_research: { name: "市場調査", requiredXp: 100 },
          mvp_design: { name: "MVP設計", requiredXp: 150 },
        },
      },
      app_requirements: {
        name: "要件定義",
        requiredXp: 400,
        prerequisites: ["app_planning"],
        children: {
          user_story: { name: "ユーザーストーリー", requiredXp: 150 },
          functional_req: { name: "機能要件", requiredXp: 150 },
          non_functional: { name: "非機能要件", requiredXp: 200 },
        },
      },
      app_design: {
        name: "詳細設計",
        requiredXp: 500,
        prerequisites: ["app_requirements"],
        children: {
          db_design: { name: "DB設計", requiredXp: 200 },
          api_design: { name: "API設計", requiredXp: 200 },
          ui_design: { name: "UI設計", requiredXp: 250 },
        },
      },
      app_implementation: {
        name: "実装",
        requiredXp: 800,
        prerequisites: ["app_design", "programming_web"],
      },
      app_testing: {
        name: "テスト",
        requiredXp: 400,
        prerequisites: ["app_implementation"],
        children: {
          unit_test: { name: "単体テスト", requiredXp: 150 },
          integration_test: { name: "結合テスト", requiredXp: 150 },
          e2e_test: { name: "E2Eテスト", requiredXp: 200 },
        },
      },
      app_deploy: {
        name: "デプロイ",
        requiredXp: 300,
        prerequisites: ["app_testing"],
        children: {
          ci_cd: { name: "CI/CD", requiredXp: 150 },
          monitoring: { name: "監視", requiredXp: 150 },
        },
      },
    },
  },

  // ===== 事務系 =====
  office: {
    name: "事務スキル",
    icon: "📝",
    color: "#6366F1",
    requiredXp: 0,
    children: {
      office_excel: {
        name: "Excel",
        requiredXp: 400,
        children: {
          excel_basics: { name: "Excel基礎", requiredXp: 100 },
          excel_functions: { name: "関数", requiredXp: 150 },
          excel_pivot: { name: "ピボットテーブル", requiredXp: 200 },
        },
      },
      office_vba: {
        name: "VBA",
        requiredXp: 500,
        prerequisites: ["office_excel"],
        children: {
          vba_basics: { name: "VBA基礎", requiredXp: 150 },
          vba_automation: { name: "業務自動化", requiredXp: 200 },
          vba_advanced: { name: "VBA応用", requiredXp: 250 },
        },
      },
      office_spreadsheet: {
        name: "Google Spreadsheet",
        requiredXp: 300,
      },
      office_gas: {
        name: "Google Apps Script",
        requiredXp: 500,
        prerequisites: ["office_spreadsheet"],
      },
    },
  },

  // ===== Python系 =====
  python: {
    name: "Python",
    icon: "🐍",
    color: "#EAB308",
    requiredXp: 0,
    children: {
      python_basic: {
        name: "Python基礎",
        requiredXp: 400,
        children: {
          py_syntax: { name: "基本構文", requiredXp: 100 },
          py_data_types: { name: "データ型", requiredXp: 100 },
          py_control: { name: "制御構文", requiredXp: 100 },
          py_oop: { name: "オブジェクト指向", requiredXp: 200 },
        },
      },
      python_data: {
        name: "データ分析",
        requiredXp: 600,
        prerequisites: ["python_basic"],
        children: {
          pandas: { name: "pandas", requiredXp: 200 },
          numpy: { name: "NumPy", requiredXp: 200 },
          visualization: { name: "データ可視化", requiredXp: 250 },
        },
      },
      python_automation: {
        name: "自動化",
        requiredXp: 400,
        prerequisites: ["python_basic"],
        children: {
          file_ops: { name: "ファイル操作", requiredXp: 150 },
          web_scraping: { name: "Webスクレイピング", requiredXp: 200 },
          task_automation: { name: "タスク自動化", requiredXp: 250 },
        },
      },
    },
  },
};

// スキルノード総数を計算
export function countTotalSkills(): number {
  let count = 0;
  function traverse(obj: Record<string, unknown>) {
    for (const key of Object.keys(obj)) {
      if (key === "children") {
        const children = obj[key];
        if (children && typeof children === "object") {
          traverse(children as Record<string, unknown>);
        }
      } else {
        const node = obj[key];
        if (node && typeof node === "object" && "name" in (node as Record<string, unknown>)) {
          count++;
          const nodeChildren = (node as Record<string, unknown>).children;
          if (nodeChildren && typeof nodeChildren === "object") {
            traverse(nodeChildren as Record<string, unknown>);
          }
        }
      }
    }
  }

  traverse(SKILL_TREE_DATA);
  return count;
}
