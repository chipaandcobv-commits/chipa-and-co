"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ClickableText from "@/components/ui/ClickableText";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage({ type: "error", text: "Email es requerido" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ 
          type: "success", 
          text: data.message 
        });
        
        // En desarrollo, mostrar el enlace
        if (data.resetUrl) {
          setMessage({ 
            type: "success", 
            text: `${data.message} Enlace de desarrollo: ${data.resetUrl}` 
          });
        }
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F7EFE7] text-gray-900 font-urbanist flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <Image
              src="/Chipá&Co.png"
              alt="Chipa&Co Logo"
              width={180}
              height={180}
              className="object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-black">Recuperar contraseña</h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="relative rounded-2xl bg-[#FFE4CC] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-8 space-y-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
            <Input
              label=""
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
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
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar enlace de recuperación"}
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
              href="/"
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
