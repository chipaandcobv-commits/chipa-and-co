"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { Card } from "./ui/Card";

interface HoneypotFields {
  [key: string]: string;
}

interface FormData {
  name: string;
  email: string;
  dni: string;
  password: string;
  confirmPassword: string;
  captchaToken?: string;
  startTime: number;
  timezone: string;
  screenResolution: string;
  colorDepth: string;
  platform: string;
  cookieEnabled: boolean;
  fingerprint: string;
}

export default function SecureRegisterForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    dni: "",
    password: "",
    confirmPassword: "",
    startTime: Date.now(),
    timezone: "",
    screenResolution: "",
    colorDepth: "",
    platform: "",
    cookieEnabled: false,
    fingerprint: "",
  });

  const [honeypotFields, setHoneypotFields] = useState<HoneypotFields>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter();

  useEffect(() => {
    // Generar campos honeypot
    generateHoneypotFields();
    
    // Recopilar información del navegador
    collectBrowserInfo();
  }, []);

  const generateHoneypotFields = () => {
    // Generar 3-5 campos honeypot aleatorios
    const fieldNames = [
      'website', 'url', 'homepage', 'phone_number', 'company',
      'address', 'city', 'zip_code', 'country', 'age', 'birthday',
      'gender', 'occupation', 'income', 'interests', 'newsletter',
      'terms_agreement', 'privacy_policy', 'marketing_consent'
    ];
    
    const numFields = Math.floor(Math.random() * 3) + 3;
    const shuffledFields = [...fieldNames].sort(() => 0.5 - Math.random());
    const fields: HoneypotFields = {};
    
    for (let i = 0; i < numFields; i++) {
      fields[shuffledFields[i]] = '';
    }
    
    setHoneypotFields(fields);
  };

  const collectBrowserInfo = () => {
    const info = {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth.toString(),
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      fingerprint: generateFingerprint(),
    };

    setFormData(prev => ({ ...prev, ...info }));
  };

  const generateFingerprint = (): string => {
    const components = [
      navigator.userAgent,
      navigator.language,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      `${screen.width}x${screen.height}`,
      screen.colorDepth.toString(),
      navigator.platform,
      navigator.cookieEnabled.toString(),
      navigator.doNotTrack || 'unspecified',
    ];
    
    const fingerprint = components.join('|');
    
    // Crear hash simple
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(36);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleHoneypotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHoneypotFields(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Por favor ingresa un email válido";
    }

    if (!formData.dni.trim()) {
      newErrors.dni = "El DNI es requerido";
    } else if (!/^[A-Za-z0-9]{7,}$/.test(formData.dni.trim())) {
      newErrors.dni = "El DNI debe tener al menos 7 caracteres y contener solo números y letras";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = "La contraseña debe contener al menos una letra minúscula";
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = "La contraseña debe contener al menos una letra mayúscula";
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = "La contraseña debe contener al menos un número";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Debes confirmar la contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      // Verificar que los campos honeypot estén vacíos
      const filledHoneypots = Object.entries(honeypotFields).filter(([_, value]) => value.trim() !== '');
      if (filledHoneypots.length > 0) {
        setMessage("Datos del formulario inválidos");
        setIsLoading(false);
        return;
      }

      // Preparar datos para envío
      const submitData = {
        ...formData,
        ...honeypotFields, // Incluir campos honeypot vacíos
        endTime: Date.now(),
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        // Redirect to login after successful registration
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setMessage(data.error || "Error en el registro");
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Únete a nuestro sistema de fidelización
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campos visibles */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nombre Completo
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              className={`mt-1 ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Tu nombre completo"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
              placeholder="tu@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="dni" className="block text-sm font-medium text-gray-700">
              DNI
            </label>
            <Input
              id="dni"
              name="dni"
              type="text"
              value={formData.dni}
              onChange={handleInputChange}
              className={`mt-1 ${errors.dni ? 'border-red-500' : ''}`}
              placeholder="12345678"
            />
            {errors.dni && (
              <p className="mt-1 text-sm text-red-600">{errors.dni}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`mt-1 ${errors.password ? 'border-red-500' : ''}`}
              placeholder="Mínimo 8 caracteres"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar Contraseña
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`mt-1 ${errors.confirmPassword ? 'border-red-500' : ''}`}
              placeholder="Repite tu contraseña"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Campos honeypot ocultos */}
          {Object.entries(honeypotFields).map(([fieldName, value]) => (
            <input
              key={fieldName}
              type="text"
              name={fieldName}
              value={value}
              onChange={handleHoneypotChange}
              style={{ 
                position: 'absolute', 
                left: '-9999px', 
                opacity: 0, 
                pointerEvents: 'none' 
              }}
              tabIndex={-1}
              autoComplete="off"
            />
          ))}

          {message && (
            <div className={`p-3 rounded-md ${
              message.includes('exitoso') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <button
              onClick={() => router.push('/login')}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Inicia sesión
            </button>
          </p>
        </div>
      </div>
    </Card>
  );
}
