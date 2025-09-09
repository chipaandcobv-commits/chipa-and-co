"use client";

import { useState, useRef } from "react";
import { UploadIcon, XIcon } from "lucide-react";

interface SimpleImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImageUrl?: string;
  className?: string;
}

export default function SimpleImageUpload({
  onImageUploaded,
  currentImageUrl,
  className = "",
}: SimpleImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de archivo no permitido. Solo se permiten: JPEG, PNG, WebP');
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. Máximo 5MB');
      return;
    }

    setUploading(true);

    try {
      // Crear FormData
      const formData = new FormData();
      formData.append('image', file);

      // Subir a Cloudinary usando nuestro endpoint
      const response = await fetch('/api/upload-simple', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success || !result.imageUrl) {
        throw new Error(result.error || 'Error al subir la imagen');
      }

      console.log('✅ Upload successful:', result.imageUrl);
      setPreviewUrl(result.imageUrl);
      onImageUploaded(result.imageUrl);

    } catch (error) {
      console.error('❌ Upload failed:', error);
      alert(`Error al subir la imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setUploading(false);
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Imagen del Premio
      </label>

      {/* Preview de imagen */}
      {previewUrl && (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-300"
            onError={(e) => {
              console.error('Error loading image:', previewUrl);
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              type="button"
              onClick={handleClick}
              className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition-colors"
              title="Cambiar imagen"
              disabled={uploading}
            >
              <UploadIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              title="Eliminar imagen"
              disabled={uploading}
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Área de carga */}
      {!previewUrl && (
        <div
          onClick={handleClick}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#F15A25] hover:bg-[#FCE6D5] transition-colors cursor-pointer"
        >
          <UploadIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Haz clic para seleccionar una imagen
          </p>
          <p className="text-xs text-gray-500 mt-1">
            JPEG, PNG, WebP (máximo 5MB)
          </p>
        </div>
      )}

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Estado de carga */}
      {uploading && (
        <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-blue-600">Subiendo imagen...</span>
        </div>
      )}
    </div>
  );
}

