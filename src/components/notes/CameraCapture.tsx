"use client";

import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
}

const isHttps = () =>
  typeof window !== "undefined" && (window.location.protocol === "https:" || window.location.hostname === "localhost");

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [isSupported, setIsSupported] = useState(() => isHttps());
  const [isMobile] = useState(() =>
    typeof navigator !== "undefined" ? /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) : false
  );
  const [captured, setCaptured] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    isHttps() ? null : "カメラにはHTTPS接続が必要です。"
  );

  const startCamera = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setIsSupported(false);
      return;
    }

    try {
      stream?.getTracks().forEach((track) => track.stop());
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920, max: 2560 },
          height: { ideal: 1080, max: 1920 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
          };
        }
    } catch (err) {
      console.error("Camera access error:", err);
      const message = err instanceof Error ? err.message : "";
      if (message.includes("Permission denied") || message.includes("NotAllowedError")) {
        setError("カメラの許可が必要です。ブラウザで許可してください。");
      } else if (message.includes("NotFoundError")) {
        setError("カメラが見つかりません。");
        setIsSupported(false);
      } else {
        setError("カメラにアクセスできません。ファイル選択をご利用ください。");
      }
    }
  }, [facingMode, stream]);

  useEffect(() => {
    if (!isSupported || captured) return;
    const id = requestAnimationFrame(() => {
      void startCamera();
    });
    return () => {
      cancelAnimationFrame(id);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [captured, facingMode, isSupported, startCamera, stream]);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCaptured(dataUrl);
    stream?.getTracks().forEach((track) => (track.enabled = false));
  }, [stream]);

  const handleRetake = useCallback(() => {
    setCaptured(null);
    stream?.getTracks().forEach((track) => (track.enabled = true));
  }, [stream]);

  const handleConfirm = useCallback(() => {
    if (!captured) return;
    stream?.getTracks().forEach((track) => track.stop());
    onCapture(captured);
  }, [captured, onCapture, stream]);

  const handleClose = useCallback(() => {
    stream?.getTracks().forEach((track) => track.stop());
    onClose();
  }, [onClose, stream]);

  const toggleCamera = useCallback(() => {
    setCaptured(null);
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  const handleFileSelect = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setCaptured(dataUrl);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }, []);

  const openFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl sm:p-4">
        <div className="flex items-center justify-between border-b border-slate-200 p-3">
          <h2 className="text-lg font-semibold text-slate-900">📷 OCR用カメラ</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>
        <div className="p-3">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
          <div className="mt-4 aspect-[4/3] w-full overflow-hidden rounded-lg bg-black">
            {!isSupported && (
              <div className="flex h-full items-center justify-center text-white">
                <p>カメラ非対応です。ファイルを選択してください。</p>
              </div>
            )}
            {captured ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={captured} alt="撮影画像" className="h-full w-full object-contain" />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
                style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
              />
            )}
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {captured ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50"
                >
                  🔁 撮り直す
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white hover:bg-emerald-500"
                >
                  ✅ 確定
                </button>
              </div>
            ) : (
              <>
                {isSupported && (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    {isMobile && (
                      <button
                        type="button"
                        onClick={toggleCamera}
                        className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        🔄 カメラ切り替え
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleCapture}
                      className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white hover:bg-emerald-500"
                    >
                      📸 撮影
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={openFileSelect}
                  className="rounded-2xl border-2 border-dashed border-slate-300 px-4 py-3 text-base font-semibold text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                >
                  🖼️ ファイルから選択
                </button>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
