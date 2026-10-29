import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getSupabase, isSupabaseConfigured } from "./supabase";

export type EstadoSuscripcion = "pendiente" | "activo" | "inactivo" | "expirado";

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
  metodo_pago?: string;
  referencia_pago?: string;
  monto_pago?: number;
  aprobado_por_admin?: boolean;
  fecha_aprobacion?: string;
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
    metodo_pago: "Acceso Maestro",
    referencia_pago: "Superadmin",
    monto_pago: 0,
    aprobado_por_admin: true,
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
    metodo_pago: "Banco Pichincha",
    referencia_pago: "Transf #893012",
    monto_pago: 14.99,
    aprobado_por_admin: true,
    fecha_inicio_suscripcion: new Date(Date.now() - 10 * 86400000).toISOString(),
    fecha_expiracion_suscripcion: new Date(Date.now() + 20 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    notas_admin: "Pago confirmado vía transferencia Banco Pichincha",
  },
  {
    id: 3,
    nombre: "Wilson",
    apellido: "Salazar",
    telefono_whatsapp: "+593981122334",
    ciudad: "Machala",
    correo: "wilson.salazar@gmail.com",
    username: "wilsons",
    password_hash: hashPassword("wilson2026"),
    estado_suscripcion: "pendiente",
    metodo_pago: "Banco Pichincha (Deuna)",
    referencia_pago: "Comprobante Deuna #948271 por $14.99",
    monto_pago: 14.99,
    aprobado_por_admin: false,
    fecha_inicio_suscripcion: "",
    fecha_expiracion_suscripcion: "",
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    notas_admin: "Comprobante enviado por WhatsApp. Pendiente de verificación en cuenta bancaria.",
  },
  {
    id: 4,
    nombre: "Javier",
    apellido: "Alvarado",
    telefono_whatsapp: "+593987654321",
    ciudad: "Cuenca",
    correo: "javier.alvarado@hotmail.com",
    username: "javier_alv",
    password_hash: hashPassword("javier2026"),
    estado_suscripcion: "expirado",
    metodo_pago: "Banco Guayaquil",
    referencia_pago: "Depósito #120938",
    monto_pago: 14.99,
    aprobado_por_admin: true,
    fecha_inicio_suscripcion: new Date(Date.now() - 35 * 86400000).toISOString(),
    fecha_expiracion_suscripcion: new Date(Date.now() - 5 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
    notas_admin: "Suscripción mensual vencida hace 5 días. Candidato a descuento de reenganche 20%",
  },
  {
    id: 5,
    nombre: "Andrés",
    apellido: "García",
    telefono_whatsapp: "+593998877665",
    ciudad: "Ambato",
    correo: "andres.garcia@outlook.com",
    username: "andresg",
    password_hash: hashPassword("andres2026"),
    estado_suscripcion: "inactivo",
    metodo_pago: "Banco Pichincha",
    referencia_pago: "Transf #772810",
    monto_pago: 14.99,
    aprobado_por_admin: true,
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
      if (
        u.estado_suscripcion === "activo" &&
        u.fecha_expiracion_suscripcion &&
        new Date(u.fecha_expiracion_suscripcion).getTime() < now
      ) {
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
    console.error("Error al guardar users_db.json:", err);
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
  metodo_pago?: string;
  referencia_pago?: string;
  monto_pago?: number;
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

  const now = new Date();
  const estado = input.estado_suscripcion || "pendiente";

  let fechaInicio = "";
  let fechaExpiracion = "";

  if (estado === "activo") {
    const dias = input.dias_suscripcion || 30;
    fechaInicio = now.toISOString();
    fechaExpiracion = new Date(now.getTime() + dias * 86400000).toISOString();
  }

  const newUser: UserRecord = {
    id: newId,
    nombre: input.nombre.trim(),
    apellido: input.apellido.trim(),
    telefono_whatsapp: input.telefono_whatsapp.trim(),
    ciudad: input.ciudad.trim(),
    correo: cleanEmail,
    username: cleanUsername,
    password_hash: hashPassword(input.password.trim()),
    estado_suscripcion: estado,
    metodo_pago: input.metodo_pago || "Transferencia Bancaria",
    referencia_pago: input.referencia_pago || "Comprobante enviado por WhatsApp",
    monto_pago: input.monto_pago || 14.99,
    aprobado_por_admin: estado === "activo",
    fecha_aprobacion: estado === "activo" ? now.toISOString() : "",
    fecha_inicio_suscripcion: fechaInicio,
    fecha_expiracion_suscripcion: fechaExpiracion,
    created_at: now.toISOString(),
    notas_admin: input.notas_admin || "Registro post-pago pendiente de verificación",
  };

  users.push(newUser);
  writeDb(users);

  return { success: true, user: newUser };
}

// AUTORIZACIÓN OFICIAL DEL ADMINISTRADOR:
export function approveAndActivateUser(
  id: number,
  days: number = 30
): { success: boolean; user?: UserRecord; error?: string } {
  const users = readDb();
  const user = users.find((u) => u.id === id);
  if (!user) return { success: false, error: "Usuario no encontrado" };

  const now = new Date();
  const expiracion = new Date(now.getTime() + days * 86400000);

  user.estado_suscripcion = "activo";
  user.aprobado_por_admin = true;
  user.fecha_aprobacion = now.toISOString();
  user.fecha_inicio_suscripcion = now.toISOString();
  user.fecha_expiracion_suscripcion = expiracion.toISOString();
  user.notas_admin = `${user.notas_admin || ""} | Pago verificado y autorizado por Admin el ${now.toLocaleDateString("es-EC")}`.trim();

  writeDb(users);
  return { success: true, user };
}

export function updateUser(
  id: number,
  updates: Partial<UserRecord>
): { success: boolean; user?: UserRecord; error?: string } {
  const users = readDb();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) {
    return { success: false, error: "Usuario no encontrado" };
  }

  const current = users[index];

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

export function extendSubscription(
  id: number,
  additionalDays: number = 30
): { success: boolean; user?: UserRecord; error?: string } {
  const users = readDb();
  const user = users.find((u) => u.id === id);
  if (!user) return { success: false, error: "Usuario no encontrado" };

  const now = Date.now();
  const currentExp = user.fecha_expiracion_suscripcion ? new Date(user.fecha_expiracion_suscripcion).getTime() : 0;
  const baseTime = currentExp > now ? currentExp : now;
  const newExp = new Date(baseTime + additionalDays * 86400000);

  user.fecha_expiracion_suscripcion = newExp.toISOString();
  user.estado_suscripcion = "activo";
  user.aprobado_por_admin = true;
  if (!user.fecha_inicio_suscripcion) {
    user.fecha_inicio_suscripcion = new Date().toISOString();
  }

  writeDb(users);
  return { success: true, user };
}

// ==============================================================================
// OPERACIONES HÍBRIDAS CON SUPABASE (CON FALLBACK LOCAL AUTOMÁTICO)
// ==============================================================================

export async function getAllUsersAsync(): Promise<UserRecord[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .order("id", { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) {
        writeDb(data as UserRecord[]);
        return data as UserRecord[];
      }
    } catch (err) {
      console.error("Supabase getAllUsersAsync fallback a local:", err);
    }
  }
  return getAllUsers();
}

export async function getUserByUsernameAsync(username: string): Promise<UserRecord | undefined> {
  const clean = username.trim().toLowerCase();
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .ilike("username", clean)
        .maybeSingle();
      if (!error && data) {
        return data as UserRecord;
      }
    } catch (err) {
      console.error("Supabase getUserByUsernameAsync fallback a local:", err);
    }
  }
  return getUserByUsername(username);
}

export async function createUserAsync(
  input: CreateUserInput
): Promise<{ success: boolean; user?: UserRecord; error?: string }> {
  const supabase = getSupabase();
  const cleanUsername = input.username.trim().toLowerCase();
  const cleanEmail = input.correo.trim().toLowerCase();
  const now = new Date();
  const estado = input.estado_suscripcion || "pendiente";

  let fechaInicio: string | null = null;
  let fechaExpiracion: string | null = null;

  if (estado === "activo") {
    const dias = input.dias_suscripcion || 30;
    fechaInicio = now.toISOString();
    fechaExpiracion = new Date(now.getTime() + dias * 86400000).toISOString();
  }

  const passHash = hashPassword(input.password.trim());

  if (supabase) {
    try {
      // Verificar unicidad en Supabase
      const { data: existingUser } = await supabase
        .from("usuarios")
        .select("id")
        .or(`username.ilike.${cleanUsername},correo.ilike.${cleanEmail}`)
        .maybeSingle();

      if (existingUser) {
        return { success: false, error: "El nombre de usuario o correo ya se encuentra registrado." };
      }

      const { data, error } = await supabase
        .from("usuarios")
        .insert({
          nombre: input.nombre.trim(),
          apellido: input.apellido.trim(),
          telefono_whatsapp: input.telefono_whatsapp.trim(),
          ciudad: input.ciudad.trim(),
          correo: cleanEmail,
          username: cleanUsername,
          password_hash: passHash,
          estado_suscripcion: estado,
          metodo_pago: input.metodo_pago || "Transferencia Bancaria",
          referencia_pago: input.referencia_pago || "Comprobante enviado por WhatsApp",
          monto_pago: input.monto_pago || 14.99,
          aprobado_por_admin: estado === "activo",
          fecha_aprobacion: estado === "activo" ? now.toISOString() : null,
          fecha_inicio_suscripcion: fechaInicio,
          fecha_expiracion_suscripcion: fechaExpiracion,
          notas_admin: input.notas_admin || "Registro post-pago pendiente de verificación",
        })
        .select()
        .single();

      if (error) {
        console.error("Error al registrar en Supabase:", error);
        return { success: false, error: error.message };
      }

      if (data) {
        const local = readDb();
        local.push(data as UserRecord);
        writeDb(local);
        return { success: true, user: data as UserRecord };
      }
    } catch (err: any) {
      console.error("Error al guardar en Supabase, aplicando fallback local:", err);
    }
  }

  return createUser(input);
}

export async function approveAndActivateUserAsync(
  id: number,
  days: number = 30
): Promise<{ success: boolean; user?: UserRecord; error?: string }> {
  const supabase = getSupabase();
  const now = new Date();
  const expiracion = new Date(now.getTime() + days * 86400000);

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .update({
          estado_suscripcion: "activo",
          aprobado_por_admin: true,
          fecha_aprobacion: now.toISOString(),
          fecha_inicio_suscripcion: now.toISOString(),
          fecha_expiracion_suscripcion: expiracion.toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        approveAndActivateUser(id, days);
        return { success: true, user: data as UserRecord };
      }
    } catch (err) {
      console.error("Error al autorizar en Supabase, aplicando fallback local:", err);
    }
  }

  return approveAndActivateUser(id, days);
}

export async function extendSubscriptionAsync(
  id: number,
  additionalDays: number = 30
): Promise<{ success: boolean; user?: UserRecord; error?: string }> {
  const supabase = getSupabase();
  const now = Date.now();
  const user = (await getUserByUsernameAsync(id.toString())) || getUserById(id);
  const currentExp = user?.fecha_expiracion_suscripcion
    ? new Date(user.fecha_expiracion_suscripcion).getTime()
    : 0;
  const baseTime = currentExp > now ? currentExp : now;
  const newExp = new Date(baseTime + additionalDays * 86400000);

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .update({
          estado_suscripcion: "activo",
          aprobado_por_admin: true,
          fecha_expiracion_suscripcion: newExp.toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        extendSubscription(id, additionalDays);
        return { success: true, user: data as UserRecord };
      }
    } catch (err) {
      console.error("Error al extender en Supabase, aplicando fallback local:", err);
    }
  }

  return extendSubscription(id, additionalDays);
}

export function getRetargetingUsers(): UserRecord[] {
  const users = readDb();
  return users.filter(
    (u) =>
      u.username !== "admin" &&
      (u.estado_suscripcion === "inactivo" || u.estado_suscripcion === "expirado")
  );
}

export function generateRetargetingCsv(users: UserRecord[]): string {
  const header = "ID,Nombre,Apellido,Telefono_WhatsApp,Ciudad,Correo,Usuario,Estado,Fecha_Expiracion\n";
  const rows = users.map((u) => {
    const exp = u.fecha_expiracion_suscripcion ? u.fecha_expiracion_suscripcion.slice(0, 10) : "N/A";
    return `"${u.id}","${u.nombre}","${u.apellido}","${u.telefono_whatsapp}","${u.ciudad}","${u.correo}","${u.username}","${u.estado_suscripcion}","${exp}"`;
  });
  return header + rows.join("\n");
}
