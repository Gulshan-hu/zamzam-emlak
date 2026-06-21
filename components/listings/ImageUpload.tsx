"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

type ImageUploadProps = {
  images: File[];
  onChange: (images: File[]) => void;
  maxImages?: number;
};

export function ImageUpload({
  images,
  onChange,
  maxImages = 10,
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const newFiles = Array.from(files).filter((file) => {
        // Validate MIME type
        if (!file.type.startsWith("image/")) {
          alert(`${file.name} şəkil faylı deyil`);
          return false;
        }

        // Validate allowed types (jpg, png, webp)
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          alert(`${file.name} yalnız JPG, PNG və WebP faylları qəbul edilir`);
          return false;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          alert(`${file.name} 5MB-dan böyükdür`);
          return false;
        }

        return true;
      });

      if (images.length + newFiles.length > maxImages) {
        alert(`Maksimum ${maxImages} şəkil yükləyə bilərsiniz`);
        return;
      }

      // Check for duplicate files (by name and size)
      const existingFiles = new Set(images.map(img => `${img.name}-${img.size}`));
      const uniqueNewFiles = newFiles.filter(file => {
        const key = `${file.name}-${file.size}`;
        if (existingFiles.has(key)) {
          alert(`${file.name} artıq əlavə edilib`);
          return false;
        }
        return true;
      });

      if (uniqueNewFiles.length === 0) return;

      const updatedImages = [...images, ...uniqueNewFiles];
      onChange(updatedImages);

      // Generate previews
      uniqueNewFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    },
    [images, maxImages, onChange]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    onChange(updatedImages);
    setPreviews(updatedPreviews);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border bg-surface-muted hover:border-primary/50"
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 cursor-pointer opacity-0"
          disabled={images.length >= maxImages}
        />

        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Upload className="h-8 w-8 text-primary" />
          </div>

          <div>
            <p className="text-sm font-medium text-text-primary">
              Şəkilləri sürükləyin və ya seçin
            </p>
            <p className="mt-1 text-xs text-text-muted">
              PNG, JPG, WEBP (maks {maxImages} şəkil)
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={images.length >= maxImages}
          >
            Şəkil seç
          </Button>
        </div>
      </div>

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="group relative aspect-video overflow-hidden rounded-xl border border-border bg-surface-muted"
            >
              <Image
                src={preview}
                alt={`Şəkil ${index + 1}`}
                fill
                className="object-cover"
              />

              {/* Order Badge */}
              <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs font-semibold text-white backdrop-blur-sm">
                {index + 1}
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-error text-white opacity-0 transition-opacity hover:bg-error/90 group-hover:opacity-100"
                aria-label="Şəkili sil"
              >
                <X className="h-4 w-4" />
              </button>

              {/* First Image Badge */}
              {index === 0 && (
                <div className="absolute bottom-2 left-2 rounded-full bg-primary px-2 py-1 text-xs font-medium text-white">
                  Əsas şəkil
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      {images.length > 0 && (
        <p className="text-xs text-text-muted">
          {images.length} / {maxImages} şəkil yükləndi. İlk şəkil əsas şəkil
          olaraq göstəriləcək.
        </p>
      )}
    </div>
  );
}
