"use client";

// カメラ撮影とOCRモーダルをまとめた小さなコンポーネント
import CameraCapture from "@/components/notes/CameraCapture";
import OcrProcessor from "@/components/notes/OcrProcessor";

type Props = {
  showCamera: boolean;
  showOcr: boolean;
  ocrImageUrl: string | null;
  onCapture: (dataUrl: string) => void;
  onCloseCamera: () => void;
  onOcrComplete: (text: string) => void;
  onCloseOcr: () => void;
};

export function CanvasCaptureModals({
  showCamera,
  showOcr,
  ocrImageUrl,
  onCapture,
  onCloseCamera,
  onOcrComplete,
  onCloseOcr,
}: Props) {
  return (
    <>
      {showCamera && (
        <CameraCapture
          onCapture={onCapture}
          onClose={onCloseCamera}
        />
      )}

      {showOcr && ocrImageUrl && (
        <OcrProcessor
          imageUrl={ocrImageUrl}
          onComplete={onOcrComplete}
          onCancel={onCloseOcr}
        />
      )}
    </>
  );
}
