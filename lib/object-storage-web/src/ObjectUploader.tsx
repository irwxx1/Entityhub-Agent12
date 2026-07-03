import { useRef, type ReactNode } from "react";
import { useUpload } from "./use-upload";

interface ObjectUploaderProps {
  maxFileSize?: number;
  fieldName?: string;
  basePath?: string;
  onComplete?: (response: { path: string; filename: string }) => void;
  onError?: (error: Error) => void;
  buttonClassName?: string;
  accept?: string;
  children: ReactNode;
}

export function ObjectUploader({
  maxFileSize = 10 * 1024 * 1024,
  fieldName = "file",
  basePath = "/api/storage",
  onComplete,
  onError,
  buttonClassName,
  accept = "image/*,application/pdf",
  children,
}: ObjectUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading, progress } = useUpload({
    basePath,
    fieldName,
    onSuccess: onComplete,
    onError,
  });

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxFileSize) {
      onError?.(new Error(`Ukuran file maksimal ${Math.round(maxFileSize / 1024 / 1024)}MB`));
      return;
    }
    await uploadFile(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={isUploading}
        style={{ display: "none" }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className={buttonClassName}
      >
        {isUploading ? `Mengupload... ${progress}%` : children}
      </button>
    </div>
  );
}
