"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Props = {
  onScan: (janCode: string) => void;
};

/**
 * オンデバイス・バーコードスキャナー
 *
 * BarcodeDetector API (Chrome/Edge) を使用。
 * Vision API等の外部APIを一切使わず、ブラウザ内で完結 → APIコスト0。
 *
 * 非対応ブラウザではJANコード手入力にフォールバック。
 */
export function BarcodeScanner({ onScan }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!("BarcodeDetector" in window)) {
      setSupported(false);
    }
  }, []);

  const startScanning = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsScanning(true);
        setError(null);
      }

      // BarcodeDetector API
      // @ts-expect-error BarcodeDetector is not yet in TypeScript lib
      const detector = new BarcodeDetector({
        formats: ["ean_13", "ean_8"],
      });

      const scan = async () => {
        if (!videoRef.current || !isScanning) return;
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const code = barcodes[0].rawValue;
            onScan(code);
            stopScanning();
            return;
          }
        } catch {
          // スキャン失敗は無視して継続
        }
        if (isScanning) {
          requestAnimationFrame(scan);
        }
      };

      scan();
    } catch {
      setError("カメラへのアクセスが拒否されました");
      setSupported(false);
    }
  }, [onScan, isScanning]);

  const stopScanning = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = manualInput.trim();
    if (code.length >= 8) {
      onScan(code);
      setManualInput("");
    }
  };

  return (
    <div className="space-y-4">
      {/* カメラスキャン */}
      {supported && (
        <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
          <video
            ref={videoRef}
            className={`w-full ${isScanning ? "block" : "hidden"}`}
            playsInline
            muted
          />
          {!isScanning && (
            <button
              onClick={startScanning}
              className="flex w-full items-center justify-center gap-2 p-8 text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-blue)]"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9V5a2 2 0 012-2h4M15 3h4a2 2 0 012 2v4M21 15v4a2 2 0 01-2 2h-4M9 21H5a2 2 0 01-2-2v-4"
                />
              </svg>
              バーコードをスキャン
            </button>
          )}
          {isScanning && (
            <button
              onClick={stopScanning}
              className="absolute right-2 top-2 rounded-lg bg-black/60 px-3 py-1 text-xs text-white"
            >
              閉じる
            </button>
          )}
        </div>
      )}

      {/* 手入力フォールバック */}
      <form onSubmit={handleManualSubmit} className="flex gap-2">
        <input
          type="text"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder="JANコードを入力 (例: 4521329401058)"
          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-blue)] focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-[var(--accent-blue)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          検索
        </button>
      </form>

      {error && (
        <p className="text-xs text-[var(--accent-red)]">{error}</p>
      )}
    </div>
  );
}
