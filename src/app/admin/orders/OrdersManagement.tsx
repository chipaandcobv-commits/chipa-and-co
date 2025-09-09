"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { DashboardIcon, LogoutIcon } from "../../../components/icons/Icons";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  isActive: boolean;
}

interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  dni: string;
  puntos: number;
}

interface Order {
  id: string;
  totalAmount: number;
  totalPoints: number;
  clientDni: string;
  createdAt: Date;
  client: User;
  items: Array<{
    quantity: number;
    unitPrice: number;
    total: number;
    product: {
      name: string;
    };
  }>;
}

interface SystemConfig {
  pointsPerPeso: number;
}

export default function OrdersManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [config, setConfig] = useState<SystemConfig>({ pointsPerPeso: 1 }); // 1 peso = 1 punto por defecto
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [clientDni, setClientDni] = useState("");
  const [clientInfo, setClientInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState("");
  const [searchingClient, setSearchingClient] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const router = useRouter();
  const [showBackupSection, setShowBackupSection] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, ordersRes, configRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/orders"),
        fetch("/api/admin/config"),
      ]);

      const [productsData, ordersData, configData] = await Promise.all([
        productsRes.json(),
        ordersRes.json(),
        configRes.json(),
      ]);

      if (productsData.success)
        setProducts(productsData.products.filter((p: Product) => p.isActive));
      if (ordersData.success) setOrders(ordersData.orders);
      if (configData.success) setConfig(configData.config);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchClient = async () => {
    if (!clientDni.trim()) {
      setMessage("Ingresa el DNI del cliente");
      return;
    }

    setSearchingClient(true);
    setMessage("");
    setClientInfo(null);

    try {
      const response = await fetch(`/api/users?dni=${clientDni.trim()}`);
      const data = await response.json();

      if (data.success) {
        setClientInfo(data.user);
        setMessage(`Cliente encontrado: ${data.user.name} (${data.user.puntos} puntos)`);
      } else {
        setMessage("Cliente no encontrado con ese DNI");
      }
    } catch (error) {
      console.error("Error searching client:", error);
      setMessage("Error al buscar cliente");
    } finally {
      setSearchingClient(false);
    }
  };

  const handleBackupOrders = async () => {
    if (!confirm("¿Estás seguro de que quieres hacer backup de todas las órdenes y eliminarlas? Esta acción no se puede deshacer.")) {
      return;
    }

    setBackingUp(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/orders/backup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Crear blob del archivo Excel
        const blob = await response.blob();
        
        // Crear URL para descarga
        const url = window.URL.createObjectURL(blob);
        
        // Crear elemento de descarga
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-ordenes-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        
        // Limpiar
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setMessage(`Backup completado: Se descargó el archivo Excel con ${orders.length} órdenes`);
        fetchData(); // Refresh data
        setTimeout(() => setMessage(""), 5000);
      } else {
        const data = await response.json();
        setMessage(data.error || "Error al hacer backup");
      }
    } catch (error) {
      setMessage("Error de conexión");
    } finally {
      setBackingUp(false);
    }
  };

  const addOrderItem = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const existingItem = orderItems.find(
      (item) => item.productId === productId
    );
    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.unitPrice,
              }
            : item
        )
      );
    } else {
      setOrderItems([
        ...orderItems,
        {
          productId,
          quantity: 1,
          unitPrice: product.price,
          total: product.price,
        },
      ]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    // No eliminar el producto si la cantidad es 0, solo actualizar
    setOrderItems(
      orderItems.map((item) =>
        item.productId === productId
          ? { 
              ...item, 
              quantity: Math.max(0, quantity), // No permitir cantidades negativas
              total: Math.max(0, quantity) * item.unitPrice 
            }
          : item
      )
    );
  };

  const removeOrderItem = (productId: string) => {
    setOrderItems(orderItems.filter((item) => item.productId !== productId));
  };

  const getTotalAmount = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0);
  };

  const getTotalPoints = () => {
    return Math.floor(getTotalAmount() * config.pointsPerPeso);
  };

  const createOrder = async () => {
    if (!clientInfo) {
      setMessage("Debes buscar y seleccionar un cliente primero");
      return;
    }

    // Filtrar solo productos con cantidad > 0
    const validItems = orderItems.filter(item => item.quantity > 0);
    
    if (validItems.length === 0) {
      setMessage("Agrega al menos un producto con cantidad mayor a 0");
      return;
    }

    setCreating(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: validItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          clientDni: clientInfo.dni,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOrderItems([]);
        setClientDni("");
        setClientInfo(null);
        setShowCreateForm(false);
        fetchData(); // Refresh orders
        setMessage(data.message || "Orden creada exitosamente");
        setTimeout(() => setMessage(""), 5000);
      } else {
        setMessage(data.error || "Error al crear orden");
      }
    } catch (error) {
      setMessage("Error de conexión");
    } finally {
      setCreating(false);
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
          <p className="mt-4 text-gray-600">Cargando...</p>
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
              message.includes("Error") || message.includes("no encontrado")
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Order */}
          <div className="lg:col-span-1 relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#F15A25]">
                Crear Orden
              </h2>
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                size="sm"
                className={showCreateForm ? "border-[#F15A25] text-[#F15A25] hover:bg-[#FCE6D5]" : "bg-[#F15A25] hover:bg-[#E55A1A] text-white"}
              >
                {showCreateForm ? "Cancelar" : "Nueva Orden"}
              </Button>
            </div>

            {showCreateForm && (
              <div className="space-y-4">
                {/* Client Search */}
                <div>
                  <h3 className="text-lg font-medium mb-3 text-gray-900">
                    Buscar Cliente por DNI
                  </h3>
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      placeholder="Ingresa el DNI del cliente"
                      value={clientDni}
                      onChange={(e) => setClientDni(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={searchClient}
                      isLoading={searchingClient}
                      disabled={!clientDni.trim()}
                      className="bg-[#F15A25] hover:bg-[#E55A1A] text-white"
                    >
                      Buscar
                    </Button>
                  </div>
                  
                  {clientInfo && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-green-800">{clientInfo.name}</p>
                          <p className="text-sm text-green-600">{clientInfo.email}</p>
                          <p className="text-sm text-green-600">DNI: {clientInfo.dni}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-green-800">{clientInfo.puntos}</p>
                          <p className="text-sm text-green-600">puntos actuales</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Selection */}
                <div>
                  <h3 className="text-lg font-medium mb-3 text-gray-900">
                    Seleccionar Productos
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex justify-between items-center p-3 border border-white rounded-lg text-gray-700 bg-[#FCE6D5] hover:bg-[#F4E7DB] transition-colors"
                      >
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-gray-600">
                            ${product.price.toLocaleString()}
                          </p>
                        </div>
                        <Button
                          onClick={() => addOrderItem(product.id)}
                          size="sm"
                          className="bg-[#F15A25] hover:bg-[#E55A1A] text-white"
                        >
                          Agregar
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {orderItems.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3 text-gray-900">Orden Actual</h3>
                    <div className="space-y-2 text-gray-700">
                      {orderItems.map((item) => {
                        const product = products.find(
                          (p) => p.id === item.productId
                        );
                        return (
                          <div
                            key={item.productId}
                            className="flex justify-between items-center p-2 bg-[#FCE6D5] rounded text-gray-700"
                          >
                            <span className="font-medium">{product?.name}</span>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateQuantity(
                                    item.productId,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-16"
                                min="0"
                              />
                              <span className="text-sm text-gray-600">
                                ${item.total.toLocaleString()}
                              </span>
                              <Button
                                onClick={() => removeOrderItem(item.productId)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                ✕
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 p-4 bg-[#FCE6D5] rounded-lg">
                      <div className="flex justify-between items-center text-lg font-semibold text-gray-700">
                        <span>Total: ${getTotalAmount().toLocaleString()}</span>
                        <span className="text-[#F15A25]">
                          {getTotalPoints()} puntos
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={createOrder}
                      isLoading={creating}
                      className="w-full mt-4 bg-[#F15A25] hover:bg-[#E55A1A] text-white"
                      disabled={!clientInfo || getTotalAmount() === 0}
                    >
                      Crear Orden y Asignar Puntos
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Orders List */}
          <div className="lg:col-span-2 relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#F15A25]">
                Órdenes Recientes
              </h2>
              <Button
                onClick={() => setShowBackupSection(!showBackupSection)}
                size="sm"
                variant="outline"
                className="border-[#F15A25] text-[#F15A25] hover:bg-[#FCE6D5]"
              >
                {showBackupSection ? "Ocultar" : "Backup"}
              </Button>
            </div>

            {/* Backup Section */}
            {showBackupSection && (
              <div className="mb-6 p-4 bg-[#FCE6D5] rounded-lg border border-[#F15A25]">
                <h3 className="text-lg font-medium text-[#F15A25] mb-3">
                  🔄 Backup y Limpieza de Órdenes
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  Esta función creará un backup de todas las órdenes existentes en formato Excel y luego las eliminará de la base de datos para liberar espacio.
                  <strong className="text-red-600"> Esta acción no se puede deshacer.</strong>
                </p>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Órdenes actuales:</span> {orders.length}
                  </div>
                  <Button
                    onClick={handleBackupOrders}
                    isLoading={backingUp}
                    disabled={orders.length === 0}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {backingUp ? "Procesando..." : "Hacer Backup y Descargar Excel"}
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-white rounded-lg p-4 bg-[#FCE6D5] hover:bg-[#F4E7DB] transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-green-600">
                        ${order.totalAmount.toLocaleString()}
                      </p>
                      <p className="text-sm text-[#F15A25]">
                        {order.totalPoints} puntos
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Completada
                    </span>
                  </div>
                  <div className="text-xs text-gray-700 space-y-1">
                    <p className="font-medium">Cliente: {order.client.name}</p>
                    <p className="text-gray-600">DNI: {order.client.dni}</p>
                    {order.items.map((item, index) => (
                      <p key={index}>
                        {item.quantity}x {item.product.name} - $
                        {item.total.toLocaleString()}
                      </p>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
