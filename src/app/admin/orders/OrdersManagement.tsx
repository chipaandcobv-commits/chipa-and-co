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
  isCompleted: boolean;
  completedAt: Date | null;
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
  const router = useRouter();

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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-orange-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="flex items-center text-orange-600 hover:text-orange-700"
              >
                <DashboardIcon className="w-5 h-5 mr-2" />
                Panel Admin
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-700">Órdenes</span>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <LogoutIcon className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Order */}
          <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Crear Orden
              </h2>
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                size="sm"
              >
                {showCreateForm ? "Cancelar" : "Nueva Orden"}
              </Button>
            </div>

            {showCreateForm && (
              <div className="space-y-4">
                {/* Client Search */}
                <div>
                  <h3 className="text-lg font-medium mb-3">
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
                  <h3 className="text-lg font-medium mb-3">
                    Seleccionar Productos
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex justify-between items-center p-3 border border-gray-200 rounded-lg"
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
                        >
                          Agregar
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {orderItems.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Orden Actual</h3>
                    <div className="space-y-2">
                      {orderItems.map((item) => {
                        const product = products.find(
                          (p) => p.id === item.productId
                        );
                        return (
                          <div
                            key={item.productId}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
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
                    <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total: ${getTotalAmount().toLocaleString()}</span>
                        <span className="text-orange-600">
                          {getTotalPoints()} puntos
                        </span>
                      </div>
                      <p className="text-sm text-orange-600 mt-1">
                        Configuración: {config.pointsPerPeso} peso = {config.pointsPerPeso} punto
                      </p>
                    </div>
                    <Button
                      onClick={createOrder}
                      isLoading={creating}
                      className="w-full mt-4"
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
          <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Órdenes Recientes
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">
                        ${order.totalAmount.toLocaleString()}
                      </p>
                      <p className="text-sm text-orange-600">
                        {order.totalPoints} puntos
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        order.isCompleted
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.isCompleted ? "Completada" : "Pendiente"}
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
