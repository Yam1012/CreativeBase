"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, ImageUp, Loader2, Plus, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  CATEGORY_STYLES,
  DRINK_CATEGORIES,
  newId,
  type DrinkCategory,
  type MenuItem,
} from "@/lib/nomu";

/** 送信前に縮小する長辺の上限(px)。文字が潰れない範囲でなるべく軽くする */
const MAX_EDGE = 1600;

interface Props {
  items: MenuItem[];
  onItemsChange: (items: MenuItem[]) => void;
  photoUrl: string | null;
  onPhotoChange: (dataUrl: string | null) => void;
  isMock: boolean;
  onIsMockChange: (isMock: boolean) => void;
}

export function MenuScanner({
  items,
  onItemsChange,
  photoUrl,
  onPhotoChange,
  isMock,
  onIsMockChange,
}: Props) {
  const [scanning, setScanning] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("画像ファイルを選んでください");
      return;
    }

    setScanning(true);
    try {
      const dataUrl = await resizeImage(file);
      onPhotoChange(dataUrl);

      const res = await fetch("/api/nomu/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "メニューの読み取りに失敗しました");
        return;
      }

      const scanned: MenuItem[] = (data.items || []).map(
        (item: { name: string; price: number | null; category: DrinkCategory }) => ({
          id: newId("item"),
          name: item.name,
          price: item.price,
          category: item.category,
        })
      );

      if (scanned.length === 0) {
        toast.error("メニューを読み取れませんでした。撮り直すか、手入力で追加してください。");
        return;
      }

      onIsMockChange(Boolean(data.isMock));

      // 既に読み取り済みの品がある場合は追記（ドリンクとフードでページが分かれている想定）。
      // 撮り直しで同じ品が二重に並ばないよう、品名が同じものは取り込まない。
      const keepExisting = items.length > 0 && !isMock;
      const existingNames = new Set(
        items.map((item) => item.name.trim().toLowerCase())
      );
      const added = keepExisting
        ? scanned.filter((item) => !existingNames.has(item.name.trim().toLowerCase()))
        : scanned;

      onItemsChange(keepExisting ? [...items, ...added] : added);

      if (data.isMock) {
        toast.success(`サンプルメニューを表示しています（${added.length}品）`);
      } else if (added.length === 0) {
        toast.info("読み取った品はすべて登録済みでした");
      } else {
        toast.success(
          keepExisting ? `${added.length}品を追加しました` : `${added.length}品を読み取りました`
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("画像の処理に失敗しました。別の写真でお試しください。");
    } finally {
      setScanning(false);
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function updateItem(id: string, patch: Partial<MenuItem>) {
    onItemsChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    onItemsChange(items.filter((item) => item.id !== id));
  }

  function addItem() {
    onItemsChange([
      ...items,
      { id: newId("item"), name: "", price: null, category: "その他" },
    ]);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">1. メニューを読み取る</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              size="lg"
              disabled={scanning}
              onClick={() => cameraInputRef.current?.click()}
            >
              {scanning ? <Loader2 className="animate-spin" /> : <Camera />}
              写真を撮る
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              disabled={scanning}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageUp />
              画像を選ぶ
            </Button>
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {scanning && (
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              メニューを読み取っています…（10秒ほどかかります）
            </p>
          )}

          {photoUrl && (
            <div className="relative h-40 w-full overflow-hidden rounded-md border bg-slate-100">
              <Image
                src={photoUrl}
                alt="読み取ったメニュー写真"
                fill
                unoptimized
                className="object-contain"
              />
            </div>
          )}

          {isMock && items.length > 0 && (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
              OPENAI_API_KEY が未設定のため、サンプルメニューを表示しています。
              実際の写真を読み取るには環境変数を設定してください。
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            2. 内容を確認・修正{items.length > 0 && `（${items.length}品）`}
          </CardTitle>
          <Button type="button" size="sm" variant="outline" onClick={addItem}>
            <Plus />
            追加
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              <Wand2 className="mx-auto mb-2 size-5 text-slate-400" />
              メニュー写真を読み取るか、「追加」から手入力してください。
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-2 rounded-md border p-2"
              >
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] ${CATEGORY_STYLES[item.category]}`}
                >
                  {item.category}
                </span>
                <Input
                  value={item.name}
                  placeholder="品名"
                  className="h-8 min-w-[8rem] flex-1"
                  onChange={(e) => updateItem(item.id, { name: e.target.value })}
                />
                <div className="flex items-center gap-1">
                  <span className="text-sm text-slate-500">¥</span>
                  <Input
                    value={item.price ?? ""}
                    inputMode="numeric"
                    placeholder="—"
                    className="h-8 w-20"
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[^\d]/g, "");
                      updateItem(item.id, { price: digits === "" ? null : Number(digits) });
                    }}
                  />
                </div>
                <Select
                  value={item.category}
                  onValueChange={(value) =>
                    updateItem(item.id, { category: value as DrinkCategory })
                  }
                >
                  <SelectTrigger className="h-8 w-[10rem]" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DRINK_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`${item.name || "この品"}を削除`}
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="text-slate-400" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * 端末で撮った写真はそのままだと数MBあるので、長辺 MAX_EDGE まで縮小して JPEG data URL にする
 */
async function resizeImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("canvas context unavailable");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", 0.85);
}
