import { PrismaClient } from "../generated/prisma";
import { hashPassword } from "../lib/auth-server";
import * as readline from 'readline';

const prisma = new PrismaClient();

// Función para leer input del usuario de forma segura
function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Función para leer contraseña de forma oculta
function askPassword(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    // Ocultar la entrada (no funciona en todos los terminales)
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    let password = '';
    process.stdin.on('data', function(char: Buffer) {
      const charStr = char.toString('utf8');
      switch (charStr) {
        case '\n':
        case '\r':
        case '\u0004': // Ctrl+D
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          rl.close();
          resolve(password);
          break;
        case '\u0003': // Ctrl+C
          process.exit();
          break;
        case '\u007f': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += charStr;
          process.stdout.write('*');
          break;
      }
    });
  });
}

// Validaciones
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateDNI(dni: string): boolean {
  // DNI argentino: 7-8 dígitos
  const dniRegex = /^\d{7,8}$/;
  return dniRegex.test(dni);
}

function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Debe tener al menos 8 caracteres");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Debe contener al menos una letra mayúscula");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Debe contener al menos una letra minúscula");
  }
  
  if (!/\d/.test(password)) {
    errors.push("Debe contener al menos un número");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

async function createAdmin() {
  try {
    console.log("🔧 === CREACIÓN SEGURA DE ADMINISTRADOR ===\n");

    // Verificar si ya existe un admin
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (existingAdmin) {
      console.log("⚠️  Ya existe un usuario administrador:");
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Nombre: ${existingAdmin.name}`);
      console.log(`   Creado: ${existingAdmin.createdAt}`);
      
      const overwrite = await askQuestion("\n¿Deseas crear otro admin? (s/N): ");
      if (overwrite.toLowerCase() !== 's' && overwrite.toLowerCase() !== 'si') {
        console.log("❌ Operación cancelada.");
        return;
      }
    }

    console.log("\n📝 Ingresa los datos del administrador:\n");

    // Solicitar datos
    let name = '';
    while (!name.trim()) {
      name = await askQuestion("Nombre completo: ");
      if (!name.trim()) {
        console.log("❌ El nombre es requerido.");
      }
    }

    let email = '';
    while (!email.trim() || !validateEmail(email)) {
      email = await askQuestion("Email: ");
      if (!email.trim()) {
        console.log("❌ El email es requerido.");
      } else if (!validateEmail(email)) {
        console.log("❌ Email inválido. Formato: usuario@dominio.com");
      }
    }

    let dni = '';
    while (!dni.trim() || !validateDNI(dni)) {
      dni = await askQuestion("DNI (7-8 dígitos): ");
      if (!dni.trim()) {
        console.log("❌ El DNI es requerido.");
      } else if (!validateDNI(dni)) {
        console.log("❌ DNI inválido. Debe tener 7-8 dígitos.");
      }
    }

    // Verificar si email o DNI ya existen
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      console.log(`❌ El email ${email} ya está registrado.`);
      return;
    }

    const existingUserByDni = await prisma.user.findUnique({
      where: { dni },
    });

    if (existingUserByDni) {
      console.log(`❌ El DNI ${dni} ya está registrado.`);
      return;
    }

    // Solicitar contraseña
    let password = '';
    let passwordValid = false;
    
    while (!passwordValid) {
      password = await askPassword("Contraseña: ");
      
      const validation = validatePassword(password);
      if (validation.valid) {
        passwordValid = true;
      } else {
        console.log("\n❌ Contraseña inválida:");
        validation.errors.forEach(error => console.log(`   - ${error}`));
        console.log("");
      }
    }

    const confirmPassword = await askPassword("Confirmar contraseña: ");
    
    if (password !== confirmPassword) {
      console.log("\n❌ Las contraseñas no coinciden.");
      return;
    }

    // Confirmar creación
    console.log("\n📋 Resumen del administrador:");
    console.log(`   Nombre: ${name}`);
    console.log(`   Email: ${email}`);
    console.log(`   DNI: ${dni}`);
    console.log(`   Contraseña: ${'*'.repeat(password.length)}`);

    const confirm = await askQuestion("\n¿Crear el administrador? (s/N): ");
    if (confirm.toLowerCase() !== 's' && confirm.toLowerCase() !== 'si') {
      console.log("❌ Operación cancelada.");
      return;
    }

    // Hash de la contraseña
    console.log("\n🔐 Generando hash de contraseña...");
    const hashedPassword = await hashPassword(password);

    // Crear admin
    console.log("💾 Creando administrador en la base de datos...");
    const admin = await prisma.user.create({
      data: {
        name,
        email,
        dni,
        password: hashedPassword,
        role: "ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        dni: true,
        role: true,
        createdAt: true,
      },
    });

    console.log("\n✅ ¡Usuario administrador creado exitosamente!");
    console.log("📋 Detalles del administrador:");
    console.log(`   ID: ${admin.id}`);
    console.log(`   Nombre: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   DNI: ${admin.dni}`);
    console.log(`   Creado: ${admin.createdAt}`);
    console.log("");
    console.log("🔐 IMPORTANTE:");
    console.log("   - Cambia la contraseña después del primer login");
    console.log("   - Mantén estas credenciales seguras");
    console.log("   - Accede al panel en: /admin");
    console.log("");
    console.log("🎉 ¡Listo para usar!");

  } catch (error) {
    console.error("\n❌ Error creando administrador:", error);
    if (error instanceof Error) {
      console.error("   Detalle:", error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Función para crear admin con datos por defecto (modo rápido)
async function createAdminQuick() {
  try {
    console.log("🚀 === CREACIÓN RÁPIDA DE ADMINISTRADOR ===\n");

    // Verificar si ya existe un admin
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (existingAdmin) {
      console.log("⚠️  Ya existe un usuario administrador:");
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Nombre: ${existingAdmin.name}`);
      return;
    }

    // Datos por defecto
    const adminData = {
      name: "Administrador",
      email: "admin@chipa.com",
      dni: "00000000",
      password: "Admin123!",
    };

    console.log("📋 Creando admin con datos por defecto:");
    console.log(`   Nombre: ${adminData.name}`);
    console.log(`   Email: ${adminData.email}`);
    console.log(`   DNI: ${adminData.dni}`);
    console.log(`   Contraseña: ${adminData.password}`);

    // Hash de la contraseña
    const hashedPassword = await hashPassword(adminData.password);

    // Crear admin
    const admin = await prisma.user.create({
      data: {
        name: adminData.name,
        email: adminData.email,
        dni: adminData.dni,
        password: hashedPassword,
        role: "ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        dni: true,
        role: true,
        createdAt: true,
      },
    });

    console.log("\n✅ ¡Usuario administrador creado exitosamente!");
    console.log("🔐 IMPORTANTE: Cambia la contraseña después del primer login");
    console.log("🌐 Accede al panel de administración en: /admin");

  } catch (error) {
    console.error("❌ Error creando administrador:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar según argumentos
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--quick') || args.includes('-q')) {
    createAdminQuick();
  } else {
    createAdmin();
  }
}

export { createAdmin, createAdminQuick };
