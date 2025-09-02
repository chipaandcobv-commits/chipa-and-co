"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { DashboardIcon, LogoutIcon } from "../../../components/icons/Icons";

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalSales: number;
  _count: {
    orderItems: number;
  };
}

interface ProductForm {
  name: string;
  price: string;
  description: string;
}

export default function ProductsManagement() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null
  );
  const [form, setForm] = useState<ProductForm>({
    name: "",
    price: "",
    description: "",
  });
  const [errors, setErrors] = useState<Partial<ProductForm>>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/products");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProducts(data.products);
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ProductForm> = {};

    if (!form.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!form.price.trim()) {
      newErrors.price = "El precio es requerido";
    } else if (isNaN(Number(form.price)) || Number(form.price) < 0) {
      newErrors.price = "El precio debe ser un número válido mayor a 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSavingProduct(true);
    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products";

      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          price: parseFloat(form.price),
          description: form.description || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          await fetchProducts();
          handleCancelForm();
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      price: product.price.toString(),
      description: product.description || "",
    });
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?"))
      return;

    setDeletingProductId(productId);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchProducts();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setForm({
      name: "",
      price: "",
      description: "",
    });
    setErrors({});
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#F7EFE7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F26D1F] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F7EFE7] text-gray-900 font-urbanist">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de bienvenida */}
        <div className="pt-4 mb-8">
          <div className="ml-4 rounded-l-full rounded-r-none bg-[#FCE6D5] py-3 pr-2 pl-4 shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-neutral-300 flex items-center justify-center text-neutral-600 text-sm">
              <span>📦</span>
            </div>
            <div className="leading-tight">
              <p className="text-[14px] font-medium text-neutral-800">
                Gestión de Productos
              </p>
            </div>
          </div>
        </div>

        {/* Add Product Button */}
        <div className="mb-6">
          <Button onClick={() => setShowForm(true)} disabled={showForm} className="bg-[#F26D1F] hover:bg-[#E55A1A] text-white">
            + Agregar Producto
          </Button>
        </div>

        {/* Product Form */}
        {showForm && (
          <div className="relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 mb-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
            <h2 className="text-lg font-semibold text-[#F26D1F] mb-4">
              {editingProduct ? "Editar Producto" : "Nuevo Producto"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre del producto"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  error={errors.name}
                  required
                />

                <Input
                  label="Precio"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  error={errors.price}
                  required
                />
              </div>

              <Input
                label="Descripción (opcional)"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                error={errors.description}
              />

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  isLoading={savingProduct}
                  disabled={savingProduct}
                  className="bg-[#F26D1F] hover:bg-[#E55A1A] text-white"
                >
                  {editingProduct ? "Actualizar" : "Crear"} Producto
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelForm}
                  disabled={savingProduct}
                  className="border-[#F26D1F] text-[#F26D1F] hover:bg-[#FCE6D5]"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        <div className="relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white overflow-hidden hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
          <div className="px-6 py-4 border-b border-white">
            <h2 className="text-lg font-semibold text-[#F26D1F]">
              Lista de Productos ({products.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-2 border-[#F26D1F] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando productos...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white">
                <thead className="bg-[#FCE6D5]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">
                      Total Ventas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">
                      Fecha Creación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#F4E7DB] divide-y divide-white">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-[#FCE6D5]">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          {product.description && (
                            <div className="text-sm text-gray-500">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.totalSales.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(product.createdAt).toLocaleDateString(
                          "es-ES"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            disabled={showForm}
                            className="bg-[#F26D1F] hover:bg-[#E55A1A] text-white"
                          >
                            Editar
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            isLoading={deletingProductId === product.id}
                            disabled={deletingProductId !== null || showForm}
                            className="border-[#F26D1F] text-[#F26D1F] hover:bg-[#FCE6D5]"
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {products.length === 0 && !loading && (
                <div className="p-8 text-center">
                  <DashboardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay productos registrados</p>
                  <Button onClick={() => setShowForm(true)} className="mt-4 bg-[#F26D1F] hover:bg-[#E55A1A] text-white">
                    Crear el primer producto
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
