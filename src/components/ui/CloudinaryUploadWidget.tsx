"use client";

import { useState } from "react";
import { CldUploadWidget, CldImage } from "next-cloudinary";
import { UploadIcon, XIcon } from "lucide-react";

interface CloudinaryUploadWidgetProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImageUrl?: string;
  className?: string;
}

export default function CloudinaryUploadWidget({
  onImageUploaded,
  currentImageUrl,
  className = "",
}: CloudinaryUploadWidgetProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);

  // Verificar que las variables de entorno estén configuradas
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    return (
      <div className={`space-y-4 ${className}`}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Imagen del Premio
        </label>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">
            Error de configuración: Las variables de entorno de Cloudinary no están configuradas.
          </p>
          <p className="text-red-500 text-xs mt-1">
            Cloud Name: {cloudName ? "✅" : "❌"} | Upload Preset: {uploadPreset ? "✅" : "❌"}
          </p>
        </div>
      </div>
    );
  }

  const handleUpload = (result: any) => {
    console.log('Upload result:', result);
    if (result?.event === "success") {
      const imageUrl = result.info.secure_url;
      console.log('✅ Upload successful:', imageUrl);
      setPreviewUrl(imageUrl);
      onImageUploaded(imageUrl);
    } else if (result?.event === "error") {
      console.error('❌ Upload error:', result);
      alert('Error al subir la imagen. Por favor, inténtalo de nuevo.');
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onImageUploaded('');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Imagen del Premio
      </label>

      {/* Preview de imagen */}
      {previewUrl && (
        <div className="relative">
          <CldImage
            src={previewUrl}
            alt="Preview"
            width={400}
            height={300}
            className="w-full h-48 object-cover rounded-lg border border-gray-300"
            crop="fill"
            gravity="auto"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <CldUploadWidget
              uploadPreset={uploadPreset}
              onUpload={handleUpload}
              options={{
                maxFiles: 1,
                folder: "rewards",
                resourceType: "image",
                clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
                maxFileSize: 5000000, // 5MB
                sources: ['local', 'url', 'camera'],
                cropping: true,
                multiple: false,
              }}
            >
              {({ open, isLoading }) => (
                <button
                  type="button"
                  onClick={() => {
                    if (open && typeof open === 'function') {
                      open();
                    } else {
                      console.error('Cloudinary widget not ready');
                      alert('El widget de carga no está listo. Por favor, recarga la página.');
                    }
                  }}
                  className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition-colors"
                  title="Cambiar imagen"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <UploadIcon className="w-4 h-4" />
                  )}
                </button>
              )}
            </CldUploadWidget>
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
        <CldUploadWidget
          uploadPreset={uploadPreset}
          onUpload={handleUpload}
          options={{
            maxFiles: 1,
            folder: "rewards",
            resourceType: "image",
            clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
            maxFileSize: 5000000, // 5MB
            sources: ['local', 'url', 'camera'],
            cropping: true,
            multiple: false,
          }}
        >
          {({ open, isLoading }) => (
            <div
              onClick={() => {
                if (open && typeof open === 'function') {
                  open();
                } else {
                  console.error('Cloudinary widget not ready');
                  alert('El widget de carga no está listo. Por favor, recarga la página.');
                }
              }}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#F15A25] hover:bg-[#FCE6D5] transition-colors cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F15A25]"></div>
                  <p className="ml-2 text-sm text-gray-600">Cargando widget...</p>
                </div>
              ) : (
                <>
                  <UploadIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Haz clic para seleccionar una imagen
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPEG, PNG, WebP (máximo 5MB)
                  </p>
                </>
              )}
            </div>
          )}
        </CldUploadWidget>
      )}
    </div>
  );
}
