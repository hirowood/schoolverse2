import { toPng } from "html-to-image";

export async function exportPng(element: HTMLElement): Promise<string> {
  return toPng(element);
}
