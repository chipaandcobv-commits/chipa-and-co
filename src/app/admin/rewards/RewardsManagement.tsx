"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SimpleImageUpload from "@/components/ui/SimpleImageUpload";

interface Reward {
  id: string;
  name: string;
  description: string | null;
  pointsCost: number;
  stock: number | null;
  isActive: boolean;
  imageUrl: string | null;
  createdAt: Date;
  _count?: {
    claims: number;
  };
}

interface RewardForm {
  name: string;
  description: string;
  pointsCost: number | null;
  stock: number | null;
  imageUrl: string;
}

interface UploadResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export default function RewardsManagement() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<RewardForm>({
    name: "",
    description: "",
    pointsCost: null,
    stock: null,
    imageUrl: "",
  });
  const router = useRouter();

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await fetch("/api/admin/rewards");
      const data = await response.json();

      if (data.success) {
        setRewards(data.rewards);
      }
    } catch (error) {
      console.error("Error fetching rewards:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      pointsCost: null,
      stock: null,
      imageUrl: "",
    });
    setEditingReward(null);
    setShowForm(false);
  };

  const handleEdit = (reward: Reward) => {
    setForm({
      name: reward.name,
      description: reward.description || "",
      pointsCost: reward.pointsCost,
      stock: reward.stock,
      imageUrl: reward.imageUrl || "",
    });
    setEditingReward(reward);
    setShowForm(true);
  };

  const handleImageUploaded = (imageUrl: string) => {
    setForm(prev => ({ ...prev, imageUrl }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.pointsCost || form.pointsCost <= 0) {
      setMessage("Nombre y costo en puntos son requeridos");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const url = editingReward
        ? `/api/admin/rewards/${editingReward.id}`
        : "/api/admin/rewards";

      const method = editingReward ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          stock: form.stock === 0 ? null : form.stock, // null = ilimitado
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(
          editingReward
            ? "Premio actualizado exitosamente"
            : "Premio creado exitosamente"
        );
        resetForm();
        fetchRewards();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.error || "Error al guardar premio");
      }
    } catch (error) {
      setMessage("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reward: Reward) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${reward.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/rewards/${reward.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        fetchRewards();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.error || "Error al eliminar premio");
      }
    } catch (error) {
      setMessage("Error de conexión");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#F7EFE7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F15A25] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando premios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F7EFE7] text-gray-900 font-urbanist">
      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes("Error")
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[#F15A25]">
                  {editingReward ? "Editar Premio" : "Nuevo Premio"}
                </h2>
                <Button
                  onClick={() => setShowForm(!showForm)}
                  size="sm"
                  variant={showForm ? "outline" : "primary"}
                  className={showForm ? "border-[#F15A25] text-[#F15A25] hover:bg-[#FCE6D5]" : "bg-[#F15A25] hover:bg-[#E55A1A] text-white"}
                >
                  {showForm ? "Cancelar" : "Nuevo"}
                </Button>
              </div>

              {showForm && (
                <div className="space-y-4">
                  <Input
                    label="Nombre del Premio"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ej: Descuento 20%"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      placeholder="Descripción del premio..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A25] focus:border-[#F15A25]"
                      rows={3}
                    />
                  </div>

                  <Input
                    label="Costo en Puntos"
                    type="number"
                    value={form.pointsCost || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        pointsCost: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    placeholder="25000 por ejemplo "
                    min="1"
                  />

                  <Input
                    label="Stock (vacío = ilimitado)"
                    type="number"
                    value={form.stock || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        stock: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    placeholder="Dejar vacío para ilimitado"
                    min="0"
                  />

                  <SimpleImageUpload
                    onImageUploaded={handleImageUploaded}
                    currentImageUrl={form.imageUrl}
                  />

                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSubmit}
                      isLoading={saving}
                      className="flex-1 bg-[#F15A25] hover:bg-[#E55A1A] text-white"
                    >
                      {editingReward ? "Actualizar" : "Crear"}
                    </Button>
                    {editingReward && (
                      <Button onClick={resetForm} variant="outline" className="border-[#F15A25] text-[#F15A25] hover:bg-[#FCE6D5]">
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rewards List */}
          <div className="lg:col-span-2">
            <div className="relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
              <h2 className="text-xl font-semibold text-[#F15A25] mb-6">
                Premios ({rewards.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="border border-white rounded-lg p-4 bg-[#FCE6D5] hover:bg-[#F4E7DB] transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {reward.name}
                        </h3>
                        {reward.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {reward.description}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          reward.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {reward.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        💎<strong className="text-[#F15A25]">{reward.pointsCost}</strong> puntos
                      </p>
                      <p>
                        📦 Stock:{" "}
                        {reward.stock === null ? "Ilimitado" : reward.stock}
                      </p>
                      <p>🎁 Canjes: {reward._count?.claims || 0}</p>
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <Button
                        onClick={() => handleEdit(reward)}
                        size="sm"
                        variant="outline"
                        className="flex-1 border-[#F15A25] text-[#F15A25] hover:bg-[#FCE6D5]"
                      >
                        Editar
                      </Button>
                      <Button
                        onClick={() => handleDelete(reward)}
                        size="sm"
                        variant="outline"
                        className="flex-1 text-red-600 hover:bg-red-50 border-red-300"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {rewards.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay premios creados. ¡Crea el primero!
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
