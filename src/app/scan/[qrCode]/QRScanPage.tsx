"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "../../../components/ui/Button";

interface QRScanPageProps {
  qrCode: string;
}

interface OrderItem {
  product: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface OrderInfo {
  id: string;
  totalAmount: number;
  totalPoints: number;
  items: OrderItem[];
  createdAt: string;
}

export default function QRScanPage({ qrCode }: QRScanPageProps) {
  const router = useRouter();
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pointsEarned, setPointsEarned] = useState(0);
  const [newTotalPoints, setNewTotalPoints] = useState(0);

  useEffect(() => {
    fetchOrderInfo();
  }, [qrCode]);

  const fetchOrderInfo = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/scan/${qrCode}`);
      const data = await response.json();

      if (data.success) {
        setOrderInfo(data.order);
      } else {
        setError(data.error || "Error al cargar la información del QR");
        if (data.scannedAt) {
          setScanned(true);
        }
      }
    } catch (error) {
      console.error("Error fetching order info:", error);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    try {
      setScanning(true);
      setError("");

      const response = await fetch(`/api/scan/${qrCode}`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setPointsEarned(data.pointsEarned);
        setNewTotalPoints(data.newTotalPoints);
        setScanned(true);
        setOrderInfo(null); // Limpiar info del pedido
      } else {
        setError(data.error || "Error al escanear el código QR");
      }
    } catch (error) {
      console.error("Error scanning QR:", error);
      setError("Error de conexión al escanear");
    } finally {
      setScanning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del código QR...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="h-16 w-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h4M4 4h4m4 0h4"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Código QR Encontrado
            </h1>
            <p className="text-gray-600">
              Código: <span className="font-mono font-semibold">{qrCode}</span>
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <div className="flex items-center">
                <svg
                  className="h-6 w-6 text-red-500 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="text-red-800 font-semibold">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>

              {scanned && (
                <div className="mt-4">
                  <Link href="/dashboard">
                    <Button variant="outline">Volver al Dashboard</Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Success State */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="text-center">
                <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-green-800 font-semibold text-xl mb-2">
                  ¡Éxito!
                </h3>
                <p className="text-green-700 mb-4">{success}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-orange-100 rounded-lg p-4">
                    <p className="text-orange-800 font-semibold text-2xl">
                      +{pointsEarned}
                    </p>
                    <p className="text-orange-600 text-sm">Puntos Ganados</p>
                  </div>
                  <div className="bg-blue-100 rounded-lg p-4">
                    <p className="text-blue-800 font-semibold text-2xl">
                      {newTotalPoints}
                    </p>
                    <p className="text-blue-600 text-sm">Total de Puntos</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link href="/dashboard">
                    <Button className="w-full">Ir al Dashboard</Button>
                  </Link>
                  <Link href="/rewards">
                    <Button variant="outline" className="w-full">
                      Ver Premios Disponibles
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Order Info */}
          {orderInfo && !scanned && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Detalles del Pedido
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-orange-800 font-semibold text-xl">
                    ${orderInfo.totalAmount.toFixed(2)}
                  </p>
                  <p className="text-orange-600 text-sm">Total del Pedido</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-blue-800 font-semibold text-xl">
                    {orderInfo.totalPoints}
                  </p>
                  <p className="text-blue-600 text-sm">Puntos a Ganar</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-gray-900">Productos:</h3>
                {orderInfo.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-gray-100"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.product}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} x ${item.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ${item.total.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleScan}
                isLoading={scanning}
                disabled={scanning}
                className="w-full"
              >
                {scanning
                  ? "Escaneando..."
                  : `Escanear y Ganar ${orderInfo.totalPoints} Puntos`}
              </Button>
            </div>
          )}

          {/* Back Button */}
          {!success && !orderInfo && (
            <div className="text-center">
              <Link href="/dashboard">
                <Button variant="outline">Volver al Dashboard</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
