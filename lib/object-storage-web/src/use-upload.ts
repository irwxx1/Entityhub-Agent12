import { useState, useCallback } from "react";

interface UploadResponse {
  path: string;
  filename: string;
}

interface UseUploadOptions {
  basePath?: string;
  fieldName?: string;
  onSuccess?: (response: UploadResponse) => void;
  onError?: (error: Error) => void;
}

export function useUpload(options: UseUploadOptions = {}) {
  const basePath = options.basePath ?? "/api/storage";
  const fieldName = options.fieldName ?? "file";
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(
    async (file: File): Promise<UploadResponse | null> => {
      setIsUploading(true);
      setError(null);
      setProgress(10);

      try {
        const formData = new FormData();
        formData.append(fieldName, file);

        setProgress(30);
        const response = await fetch(`${basePath}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || "Upload gagal");
        }

        const data: UploadResponse = await response.json();
        setProgress(100);
        options.onSuccess?.(data);
        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Upload gagal");
        setError(error);
        options.onError?.(error);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [basePath, fieldName, options]
  );

  return { uploadFile, isUploading, error, progress };
}
