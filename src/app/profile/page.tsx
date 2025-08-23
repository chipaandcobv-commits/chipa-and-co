import ProfileSettings from './ProfileSettings';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Configuración de Perfil
          </h1>
          <ProfileSettings />
        </div>
      </div>
    </div>
  );
}
