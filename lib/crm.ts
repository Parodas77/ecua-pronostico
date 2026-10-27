import fs from "fs";
import path from "path";
import crypto from "crypto";

export type EstadoSuscripcion = "activo" | "inactivo" | "expirado";

export interface UserRecord {
  id: number;
  nombre: string;
  apellido: string;
  telefono_whatsapp: string;
  ciudad: string;
  correo: string;
  username: string;
  password_hash: string;
  estado_suscripcion: EstadoSuscripcion;
  fecha_inicio_suscripcion: string;
  fecha_expiracion_suscripcion: string;
  created_at: string;
  notas_admin?: string;
}

const DB_PATH = path.join(process.cwd(), "data", "users_db.json");

// Hasheo seguro de contraseña con SHA-256 + Salt
export function hashPassword(password: string): string {
  const salt = "ecua_salt_2026";
  return crypto.createHash("sha256").update(password + salt).digest("hex");
}

export function verifyPassword(password: string, storedHash: string): boolean {
  return hashPassword(password) === storedHash;
}

// Datos iniciales de demostración si la base de datos está vacía
const INITIAL_USERS: UserRecord[] = [
  {
    id: 1,
    nombre: "Pedro",
    apellido: "Administrador",
    telefono_whatsapp: "+593979198755",
    ciudad: "Guayaquil",
    correo: "admin@ecuapronostico.com",
    username: "admin",
    password_hash: hashPassword("ecuapronostico2026@"),
    estado_suscripcion: "activo",
    fecha_inicio_suscripcion: new Date(Date.now() - 60 * 86400000).toISOString(),
    fecha_expiracion_suscripcion: new Date(Date.now() + 365 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    notas_admin: "Superadministrador de la plataforma",
  },
  {
    id: 2,
    nombre: "Carlos",
    apellido: "Mendoza",
    telefono_whatsapp: "+593991234567",
    ciudad: "Quito",
    correo: "carlos.mendoza@gmail.com",
    username: "carlosm",
    password_hash: hashPassword("carlos123"),
    estado_suscripcion: "activo",
    fecha_inicio_suscripcion: new Date(Date.now() - 10 * 86400000).toISOString(),
    fecha_expiracion_suscripcion: new Date(Date.now() + 20 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    notas_admin: "Pago confirmado vía transferencia Banco Pichincha",
  },
  {
    id: 3,
    nombre: "Javier",
    apellido: "Alvarado",
    telefono_whatsapp: "+593987654321",
    ciudad: "Cuenca",
    correo: "javier.alvarado@hotmail.com",
    username: "javier_alv",
    password_hash: hashPassword("javier2026"),
    estado_suscripcion: "expirado",
    fecha_inicio_suscripcion: new Date(Date.now() - 35 * 86400000).toISOString(),
    fecha_expiracion_suscripcion: new Date(Date.now() - 5 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
    notas_admin: "Suscripción mensual vencida hace 5 días. Candidato a descuento de reenganche 20%",
  },
  {
    id: 4,
    nombre: "Andrés",
    apellido: "García",
    telefono_whatsapp: "+593998877665",
    ciudad: "Ambato",
    correo: "andres.garcia@outlook.com",
    username: "andresg",
    password_hash: hashPassword("andres2026"),
    estado_suscripcion: "inactivo",
    fecha_inicio_suscripcion: new Date(Date.now() - 40 * 86400000).toISOString(),
    fecha_expiracion_suscripcion: new Date(Date.now() - 10 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
    notas_admin: "Canceló por motivo de viaje. Retargeting para torneo internacional",
  },
];

function readDb(): UserRecord[] {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_USERS, null, 2), "utf-8");
      return INITIAL_USERS;
    }
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const users: UserRecord[] = JSON.parse(raw);

    // Auto-actualizar estado a "expirado" si la fecha ya pasó y estaba activo
    const now = Date.now();
    let modified = false;
    for (const u of users) {
      if (u.estado_suscripcion === "activo" && new Date(u.fecha_expiracion_suscripcion).getTime() < now) {
        // El admin nunca expira
        if (u.username !== "admin") {
          u.estado_suscripcion = "expirado";
          modified = true;
        }
      }
    }
    if (modified) {
      fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2), "utf-8");
    }

    return users;
  } catch (err) {
    console.error("Error al leer users_db.json:", err);
    return INITIAL_USERS;
  }
}

function writeDb(users: UserRecord[]): void {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Error al escribir users_db.json:", err);
  }
}

export function getAllUsers(): UserRecord[] {
  return readDb();
}

export function getUserById(id: number): UserRecord | undefined {
  return readDb().find((u) => u.id === id);
}

export function getUserByUsername(username: string): UserRecord | undefined {
  const clean = username.trim().toLowerCase();
  return readDb().find((u) => u.username.toLowerCase() === clean);
}

export function getUserByEmail(email: string): UserRecord | undefined {
  const clean = email.trim().toLowerCase();
  return readDb().find((u) => u.correo.toLowerCase() === clean);
}

export interface CreateUserInput {
  nombre: string;
  apellido: string;
  telefono_whatsapp: string;
  ciudad: string;
  correo: string;
  username: string;
  password: string;
  estado_suscripcion?: EstadoSuscripcion;
  dias_suscripcion?: number;
  notas_admin?: string;
}

export function createUser(input: CreateUserInput): { success: boolean; user?: UserRecord; error?: string } {
  const users = readDb();

  const cleanUsername = input.username.trim().toLowerCase();
  const cleanEmail = input.correo.trim().toLowerCase();

  // Validaciones de unicidad
  if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
    return { success: false, error: `El nombre de usuario "${input.username}" ya está registrado.` };
  }
  if (users.some((u) => u.correo.toLowerCase() === cleanEmail)) {
    return { success: false, error: `El correo electrónico "${input.correo}" ya se encuentra registrado.` };
  }

  // Generar ID autoincremental
  const maxId = users.reduce((max, u) => Math.max(max, u.id || 0), 0);
  const newId = maxId + 1;

  const dias = input.dias_suscripcion || 30;
  const now = new Date();
  const expiracion = new Date(now.getTime() + dias * 86400000);

  const newUser: UserRecord = {
    id: newId,
    nombre: input.nombre.trim(),
    apellido: input.apellido.trim(),
    telefono_whatsapp: input.telefono_whatsapp.trim(),
    ciudad: input.ciudad.trim(),
    correo: cleanEmail,
    username: cleanUsername,
    password_hash: hashPassword(input.password.trim()),
    estado_suscripcion: input.estado_suscripcion || "activo",
    fecha_inicio_suscripcion: now.toISOString(),
    fecha_expiracion_suscripcion: expiracion.toISOString(),
    created_at: now.toISOString(),
    notas_admin: input.notas_admin || "Registro post-pago VIP",
  };

  users.push(newUser);
  writeDb(users);

  return { success: true, user: newUser };
}

export function updateUser(id: number, updates: Partial<UserRecord>): { success: boolean; user?: UserRecord; error?: string } {
  const users = readDb();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) {
    return { success: false, error: "Usuario no encontrado" };
  }

  const current = users[index];

  // Si cambia password, hashearlo
  let newPassHash = current.password_hash;
  if ((updates as any).password) {
    newPassHash = hashPassword((updates as any).password);
  }

  const updated: UserRecord = {
    ...current,
    ...updates,
    password_hash: newPassHash,
  };

  users[index] = updated;
  writeDb(users);
  return { success: true, user: updated };
}

export function extendSubscription(id: number, additionalDays: number = 30): { success: boolean; user?: UserRecord; error?: string } {
  const users = readDb();
  const user = users.find((u) => u.id === id);
  if (!user) return { success: false, error: "Usuario no encontrado" };

  const currentExp = new Date(user.fecha_expiracion_suscripcion).getTime();
  const baseTime = currentExp > Date.now() ? currentExp : Date.now();
  const newExp = new Date(baseTime + additionalDays * 86400000);

  user.fecha_expiracion_suscripcion = newExp.toISOString();
  user.estado_suscripcion = "activo";

  writeDb(users);
  return { success: true, user };
}

// Filtro rápido para campañas de retención (inactivos o expirados)
export function getRetargetingUsers(): UserRecord[] {
  const users = readDb();
  const now = Date.now();
  return users.filter(
    (u) =>
      u.username !== "admin" &&
      (u.estado_suscripcion === "inactivo" ||
        u.estado_suscripcion === "expirado" ||
        new Date(u.fecha_expiracion_suscripcion).getTime() < now)
  );
}

// Generador de archivo CSV para remarketing por WhatsApp
export function generateRetargetingCsv(users: UserRecord[]): string {
  const headers = ["ID", "Nombre", "Apellido", "WhatsApp", "Ciudad", "Correo", "Estado", "Fecha_Expiracion", "Dias_Vencido"];
  const rows = users.map((u) => {
    const diffDays = Math.max(0, Math.round((Date.now() - new Date(u.fecha_expiracion_suscripcion).getTime()) / 86400000));
    return [
      u.id,
      `"${u.nombre.replace(/"/g, '""')}"`,
      `"${u.apellido.replace(/"/g, '""')}"`,
      `"${u.telefono_whatsapp}"`,
      `"${u.ciudad}"`,
      `"${u.correo}"`,
      u.estado_suscripcion,
      u.fecha_expiracion_suscripcion.slice(0, 10),
      diffDays,
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}
