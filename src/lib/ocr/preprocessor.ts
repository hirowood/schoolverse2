// src/lib/ocr/preprocessor.ts

export interface PreprocessOptions {
  resize?: { maxWidth: number; maxHeight: number };
  contrast?: number;      // 1.0 = 変更なし
  brightness?: number;    // 0 = 変更なし
  sharpen?: boolean;
  denoise?: boolean;
  binarize?: boolean;     // 二値化
}

// 文書タイプ別の推奨設定
export const PREPROCESS_PRESETS: Record<string, PreprocessOptions> = {
  // 印刷物（教科書・プリント）
  printed: {
    resize: { maxWidth: 2000, maxHeight: 2000 },
    contrast: 1.2,
    sharpen: true,
    denoise: false,
    binarize: false,
  },
  
  // 手書きノート
  handwritten: {
    resize: { maxWidth: 2500, maxHeight: 2500 },
    contrast: 1.4,
    sharpen: true,
    denoise: true,
    binarize: true,
  },
  
  // 写真（斜め撮り等）
  photo: {
    resize: { maxWidth: 3000, maxHeight: 3000 },
    contrast: 1.3,
    sharpen: true,
    denoise: true,
    binarize: false,
  },
};

/**
 * 画像を読み込む
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
    img.src = src;
  });
}

/**
 * リサイズ後のサイズを計算
 */
function calculateSize(
  img: HTMLImageElement,
  resize?: { maxWidth: number; maxHeight: number }
): { width: number; height: number } {
  if (!resize) {
    return { width: img.width, height: img.height };
  }

  const { maxWidth, maxHeight } = resize;
  let { width, height } = { width: img.width, height: img.height };

  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }
  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }

  return { width: Math.round(width), height: Math.round(height) };
}

/**
 * グレースケール変換
 */
function toGrayscale(imageData: ImageData): void {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
}

/**
 * コントラスト調整
 */
function adjustContrast(imageData: ImageData, contrast: number): void {
  const data = imageData.data;
  const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
    data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
    data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
  }
}

/**
 * シャープ化（ラプラシアンフィルタ）
 */
function sharpenImage(imageData: ImageData): void {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
  const copy = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += copy[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        const idx = (y * width + x) * 4 + c;
        data[idx] = Math.min(255, Math.max(0, sum));
      }
    }
  }
}

/**
 * メディアンフィルタ（ノイズ除去）
 */
function medianFilter(imageData: ImageData): void {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const copy = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        const values: number[] = [];
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            values.push(copy[idx]);
          }
        }
        values.sort((a, b) => a - b);
        const idx = (y * width + x) * 4 + c;
        data[idx] = values[4]; // 中央値
      }
    }
  }
}

/**
 * 大津の二値化
 */
function otsuBinarize(imageData: ImageData): void {
  const data = imageData.data;
  
  // ヒストグラム作成
  const histogram = new Array(256).fill(0);
  for (let i = 0; i < data.length; i += 4) {
    histogram[data[i]]++;
  }
  
  const total = data.length / 4;
  let sum = 0;
  for (let i = 0; i < 256; i++) {
    sum += i * histogram[i];
  }
  
  let sumB = 0;
  let wB = 0;
  let maxVariance = 0;
  let threshold = 0;
  
  for (let i = 0; i < 256; i++) {
    wB += histogram[i];
    if (wB === 0) continue;
    
    const wF = total - wB;
    if (wF === 0) break;
    
    sumB += i * histogram[i];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const variance = wB * wF * (mB - mF) * (mB - mF);
    
    if (variance > maxVariance) {
      maxVariance = variance;
      threshold = i;
    }
  }
  
  // 二値化適用
  for (let i = 0; i < data.length; i += 4) {
    const value = data[i] > threshold ? 255 : 0;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }
}

/**
 * 画像前処理のメイン関数
 */
export async function preprocessImage(
  imageData: string,
  options: PreprocessOptions = {}
): Promise<string> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  // 1. 画像読み込み
  const img = await loadImage(imageData);

  // 2. リサイズ
  const { width, height } = calculateSize(img, options.resize);
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  // 3. ピクセルデータ取得
  const imgData = ctx.getImageData(0, 0, width, height);

  // 4. グレースケール変換
  toGrayscale(imgData);

  // 5. コントラスト調整
  if (options.contrast && options.contrast !== 1.0) {
    adjustContrast(imgData, options.contrast - 1);
  }

  // 6. シャープ化
  if (options.sharpen) {
    sharpenImage(imgData);
  }

  // 7. ノイズ除去
  if (options.denoise) {
    medianFilter(imgData);
  }

  // 8. 二値化
  if (options.binarize) {
    otsuBinarize(imgData);
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL("image/png");
}
