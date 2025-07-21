import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export default async function Home() {
  const users = await getUsers();

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-4xl">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold mb-4">App de Fidelización</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Gestión de usuarios y programa de fidelización
          </p>
        </div>

        <div className="w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Usuarios Registrados</h2>
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-3 py-1 rounded-full text-sm font-medium">
              {users.length} usuarios
            </span>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No hay usuarios registrados
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Ejecuta el seed para agregar datos de ejemplo
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                      ID: {user.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-full mt-8 p-6 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
            ¿Cómo poblar la base de datos?
          </h3>
          <p className="text-blue-800 dark:text-blue-200 mb-3">
            Para agregar datos de ejemplo a tu base de datos, ejecuta:
          </p>
          <code className="block bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 p-3 rounded text-sm font-mono">
            npm run db:seed
          </code>
        </div>
      </main>
    </div>
  );
}
