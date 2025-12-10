"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 3Dキャンバス用エラーバウンダリ
 * R3Fやwebglのエラーをキャッチしてページ全体の崩壊を防ぐ
 */
export class Canvas3DErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[Canvas3D Error]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="relative h-[520px] w-full rounded-2xl border border-red-200 bg-red-50 shadow-inner">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="rounded-full bg-red-100 p-3">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-red-700">3D描画エラーが発生しました</p>
              <p className="mt-1 text-sm text-red-600">
                ブラウザがWebGLをサポートしていないか、3Dライブラリの読み込みに失敗しました。
              </p>
            </div>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
            >
              再試行
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
