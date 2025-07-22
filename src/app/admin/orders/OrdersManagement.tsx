"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
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

interface Order {
  id: string;
  totalAmount: number;
  totalPoints: number;
  qrCode: string;
  isScanned: boolean;
  scannedAt: Date | null;
  createdAt: Date;
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
  const [config, setConfig] = useState<SystemConfig>({ pointsPerPeso: 1000 });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState("");
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  // Generar QR code visual cuando se crea una orden
  useEffect(() => {
    if (generatedQR) {
      generateQRImage();
    }
    // generateQRImage is stable, doesn't need dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatedQR]);

  const generateQRImage = async () => {
    if (!generatedQR) return;

    try {
      const qrUrl = `${window.location.origin}/scan/${generatedQR}`;
      const dataUrl = await QRCode.toDataURL(qrUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

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
    if (quantity <= 0) {
      setOrderItems(orderItems.filter((item) => item.productId !== productId));
    } else {
      setOrderItems(
        orderItems.map((item) =>
          item.productId === productId
            ? { ...item, quantity, total: quantity * item.unitPrice }
            : item
        )
      );
    }
  };

  const getTotalAmount = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0);
  };

  const getTotalPoints = () => {
    return Math.floor(getTotalAmount() / config.pointsPerPeso);
  };

  const createOrder = async () => {
    if (orderItems.length === 0) {
      setMessage("Agrega al menos un producto a la orden");
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
          items: orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedQR(data.order.qrCode);
        setOrderItems([]);
        setShowCreateForm(false);
        fetchData(); // Refresh orders
        setMessage("Orden creada exitosamente");
        setTimeout(() => setMessage(""), 3000);
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

  const copyQRLink = () => {
    if (generatedQR) {
      navigator.clipboard.writeText(
        `${window.location.origin}/scan/${generatedQR}`
      );
      setMessage("Enlace QR copiado al portapapeles");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const downloadQR = () => {
    if (qrDataUrl) {
      const link = document.createElement("a");
      link.download = `qr-order-${generatedQR}.png`;
      link.href = qrDataUrl;
      link.click();
    }
  };

  const printQR = () => {
    if (qrDataUrl) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>QR Code - ${generatedQR}</title>
              <style>
                body { 
                  display: flex; 
                  flex-direction: column; 
                  align-items: center; 
                  justify-content: center; 
                  height: 100vh; 
                  margin: 0; 
                  font-family: Arial, sans-serif;
                }
                .qr-container {
                  text-align: center;
                  padding: 20px;
                  border: 2px solid #ccc;
                  border-radius: 10px;
                }
                img { 
                  max-width: 300px; 
                  height: auto; 
                }
                h2 { 
                  margin-bottom: 20px;
                  color: #333;
                }
                p {
                  margin-top: 20px;
                  font-size: 14px;
                  color: #666;
                }
              </style>
            </head>
            <body>
              <div class="qr-container">
                <h2>Código QR - Orden</h2>
                <img src="${qrDataUrl}" alt="QR Code" />
                <p>Código: ${generatedQR}</p>
                <p>Escanea para ganar puntos</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
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
              <span className="text-gray-300">/</span>
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
              message.includes("Error")
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* QR Generated Modal */}
        {generatedQR && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4 text-center">
                ¡QR Generado Exitosamente!
              </h3>

              {/* QR Code Visual */}
              <div className="text-center mb-6">
                {qrDataUrl ? (
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrDataUrl}
                      alt="QR Code"
                      className="w-64 h-64 mx-auto"
                    />
                  </div>
                ) : (
                  <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                    <div className="text-gray-500">Generando QR...</div>
                  </div>
                )}
              </div>

              {/* QR Info */}
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  Código QR:{" "}
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {generatedQR}
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  Los clientes pueden escanear este código para ganar puntos
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={printQR}
                  className="w-full"
                  disabled={!qrDataUrl}
                >
                  🖨️ Imprimir QR
                </Button>
                <Button
                  onClick={downloadQR}
                  variant="outline"
                  className="w-full"
                  disabled={!qrDataUrl}
                >
                  📥 Descargar QR
                </Button>
                <Button
                  onClick={copyQRLink}
                  variant="outline"
                  className="w-full"
                >
                  📋 Copiar Enlace
                </Button>
                <Button
                  onClick={() => {
                    setGeneratedQR(null);
                    setQrDataUrl(null);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  ✕ Cerrar
                </Button>
              </div>
            </div>
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
                    </div>
                    <Button
                      onClick={createOrder}
                      isLoading={creating}
                      className="w-full mt-4"
                    >
                      Crear Orden y Generar QR
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
                        order.isScanned
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.isScanned ? "Escaneado" : "Pendiente"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    {order.items.map((item, index) => (
                      <p key={index}>
                        {item.quantity}x {item.product.name} - $
                        {item.total.toLocaleString()}
                      </p>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      QR: {order.qrCode} |{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <Button
                      onClick={() => {
                        setGeneratedQR(order.qrCode);
                      }}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      Ver QR
                    </Button>
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
