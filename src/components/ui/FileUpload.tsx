"use client";

import { useState, useRef, useEffect } from "react";
import { UploadIcon, XIcon } from "lucide-react";
import Button from "./Button";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  onUpload: (file: File) => Promise<string>;
  currentImageUrl?: string;
  isLoading?: boolean;
  className?: string;
}

export default function FileUpload({
  onFileSelect,
  onUpload,
  currentImageUrl,
  isLoading = false,
  className = "",
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Actualizar preview cuando cambie currentImageUrl
  useEffect(() => {
    setPreviewUrl(currentImageUrl || null);
  }, [currentImageUrl]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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

      setSelectedFile(file);
      onFileSelect(file);

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      console.log('🚀 FileUpload: Starting upload for file:', selectedFile.name);
      const imageUrl = await onUpload(selectedFile);
      console.log('✅ FileUpload: Upload successful, URL:', imageUrl);
      setPreviewUrl(imageUrl);
      setSelectedFile(null);
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('❌ FileUpload: Upload failed:', error);
      alert(`Error al subir la imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setSelectedFile(null);
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReplaceImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onFileSelect(null);
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
            >
              <UploadIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              title="Eliminar imagen"
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

      {/* Botones de acción */}
      {selectedFile && !previewUrl && (
        <div className="flex space-x-2">
          <Button
            onClick={handleUpload}
            isLoading={uploading}
            className="flex-1 bg-[#F15A25] hover:bg-[#E55A1A] text-white"
          >
            {uploading ? "Subiendo..." : "Subir Imagen"}
          </Button>
          <Button
            onClick={handleRemove}
            variant="outline"
            className="border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Cancelar
          </Button>
        </div>
      )}

      {/* Botón para cambiar imagen cuando ya hay una */}
      {previewUrl && !selectedFile && (
        <div className="flex space-x-2">
          <Button
            onClick={handleClick}
            variant="outline"
            className="flex-1 border-[#F15A25] text-[#F15A25] hover:bg-[#FCE6D5]"
          >
            Cambiar Imagen
          </Button>
        </div>
      )}
    </div>
  );
}
