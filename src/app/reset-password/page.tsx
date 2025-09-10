"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ClickableText from "@/components/ui/ClickableText";

function ResetPasswordContent() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setMessage({ type: "error", text: "Token de recuperación no válido" });
      setValidating(false);
      return;
    }

    // Validar token
    const validateToken = async () => {
      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`);
        const data = await response.json();

        if (data.success) {
          setUserInfo(data.user);
        } else {
          setMessage({ type: "error", text: data.error });
        }
      } catch (error) {
        setMessage({ type: "error", text: "Error al validar el token" });
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "Todos los campos son requeridos" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "La contraseña debe tener al menos 6 caracteres" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          token, 
          newPassword 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ 
          type: "success", 
          text: "Contraseña restablecida exitosamente. Redirigiendo al login..." 
        });
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen w-full bg-[#F7EFE7] text-gray-900 font-urbanist flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <Image
              src="/chipa-logo.png"
              alt="Chipa&Co Logo"
              width={120}
              height={120}
              className="object-contain"
              priority
              style={{ width: "auto", height: "auto" }}
            />
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F15A25] mx-auto"></div>
          <p className="mt-4 text-gray-600">Validando token...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F7EFE7] text-gray-900 font-urbanist flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <Image
              src="/chipa-logo.png"
              alt="Chipa&Co Logo"
              width={180}
              height={180}
              className="object-contain"
              priority
              style={{ width: "auto", height: "auto" }}
            />
          </div>
          <h2 className="text-3xl font-bold text-black">Restablecer contraseña</h2>
          {userInfo && (
            <p className="mt-2 text-sm text-gray-600">
              Hola {userInfo.name}, ingresa tu nueva contraseña
            </p>
          )}
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="relative rounded-2xl bg-[#FFE4CC] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-8 space-y-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
            <Input
              label=""
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nueva contraseña (mínimo 6 caracteres)"
              required
              className="placeholder:text-gray-400 text-gray-700"
              style={{ 
                fontSize: '16px'
              }}
            />

            <Input
              label=""
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar contraseña"
              required
              className="placeholder:text-gray-400 text-gray-700"
              style={{ 
                fontSize: '16px'
              }}
            />

            {message && (
              <div
                className={`p-3 rounded-md text-sm ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                <ClickableText text={message.text} />
              </div>
            )}

            <Button
              type="submit"
              variant="outline"
              className="w-full !bg-[#F15A25] !hover:bg-[#FF6B35] !text-white !border-[#F15A25] transition-colors duration-200"
              size="lg"
              disabled={loading || !userInfo}
            >
              {loading ? "Restableciendo..." : "Restablecer contraseña"}
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-[#F15A25] hover:text-[#E55A1A] transition-colors"
            >
              ← Volver al inicio de sesión
            </Link>
            <Link
              href="/login"
              className="inline-block mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-[#F7EFE7] text-gray-900 font-urbanist flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <Image
              src="/chipa-logo.png"
              alt="Chipa&Co Logo"
              width={120}
              height={120}
              className="object-contain"
              priority
              style={{ width: "auto", height: "auto" }}
            />
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F15A25] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
