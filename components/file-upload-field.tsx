"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, Film, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface UploadedFile {
  fileId: string;
  filename: string;
  path: string;
}

interface FileUploadFieldProps {
  uploadedFiles: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
}

export function FileUploadField({
  uploadedFiles,
  onFilesChange,
  maxFiles = 10,
}: FileUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "アップロードに失敗しました");
      }

      return (await res.json()) as UploadedFile;
    },
    []
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = maxFiles - uploadedFiles.length;

      if (fileArray.length > remaining) {
        toast.error(`最大${maxFiles}ファイルまでアップロードできます`);
        return;
      }

      setUploading(true);
      const newFiles: UploadedFile[] = [];

      for (const file of fileArray) {
        try {
          const uploaded = await uploadFile(file);
          newFiles.push(uploaded);
        } catch (error) {
          toast.error(
            `${file.name}: ${error instanceof Error ? error.message : "アップロード失敗"}`
          );
        }
      }

      if (newFiles.length > 0) {
        onFilesChange([...uploadedFiles, ...newFiles]);
      }
      setUploading(false);
    },
    [uploadedFiles, onFilesChange, maxFiles, uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleRemove = useCallback(
    (fileId: string) => {
      onFilesChange(uploadedFiles.filter((f) => f.fileId !== fileId));
    },
    [uploadedFiles, onFilesChange]
  );

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (["mp4", "mov", "avi"].includes(ext || "")) {
      return <Film className="w-4 h-4 text-purple-500" />;
    }
    return <FileText className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="space-y-3">
      {/* ドロップエリア */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          dragOver
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 bg-gray-50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-600">アップロード中...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <p className="text-sm text-gray-600">
              ファイルをドラッグ&ドロップ、またはクリックして選択
            </p>
            <p className="text-xs text-gray-400">
              対応形式: PDF, DOC, DOCX, PPT, PPTX, MP4, MOV, AVI, JPG, PNG（50MB以下）
            </p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.mov,.avi,.jpg,.jpeg,.png"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files);
              e.target.value = "";
            }
          }}
        />
      </div>

      {/* アップロード済みファイル一覧 */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file) => (
            <div
              key={file.fileId}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-2 min-w-0">
                {getFileIcon(file.filename)}
                <span className="text-sm truncate">{file.filename}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-red-500 shrink-0"
                onClick={() => handleRemove(file.fileId)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* 追加ボタン */}
      {uploadedFiles.length > 0 && uploadedFiles.length < maxFiles && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Plus className="w-4 h-4 mr-1" />
          ファイルを追加
        </Button>
      )}
    </div>
  );
}
