import { and, asc, desc, eq, inArray, ne } from "drizzle-orm";
import { db } from "./db";
import {
  ACTIVE_REQUEST_STATUSES,
  PAST_REQUEST_STATUSES,
  auditLog,
  dossiers,
  equipment,
  functionPermissions,
  operations,
  reports,
  requests,
  services,
  staff,
  units,
  users,
  vipEvents,
} from "./db/schema";

export async function listClientRequests(clientId: string, scope: "active" | "past") {
  const statuses = scope === "active" ? ACTIVE_REQUEST_STATUSES : PAST_REQUEST_STATUSES;
  return db.query.requests.findMany({
    where: and(eq(requests.clientId, clientId), inArray(requests.status, [...statuses])),
    orderBy: [desc(requests.updatedAt)],
  });
}

export async function listAllRequests() {
  return db.query.requests.findMany({
    orderBy: [desc(requests.updatedAt)],
    with: {
      client: { with: { profile: true } },
      owner: { with: { profile: true } },
    },
  });
}

export async function getRequestDetail(id: string) {
  return db.query.requests.findFirst({
    where: eq(requests.id, id),
    with: {
      client: { with: { profile: true } },
      messages: {
        orderBy: (table, operators) => [operators.asc(table.createdAt)],
        with: { author: { with: { profile: true } } },
      },
      quotes: {
        orderBy: (table, operators) => [operators.desc(table.createdAt)],
        with: {
          author: { with: { profile: true } },
          lines: {
            orderBy: (table, operators) => [operators.asc(table.createdAt)],
          },
        },
      },
    },
  });
}

export async function listPublicCatalog() {
  const [serviceRows, staffRows, equipmentRows] = await Promise.all([
    db.query.services.findMany({
      where: eq(services.active, true),
      columns: { id: true, name: true, description: true },
      orderBy: [asc(services.name)],
    }),
    db.query.staff.findMany({
      where: eq(staff.active, true),
      columns: { id: true, name: true, notes: true },
      orderBy: [asc(staff.name)],
    }),
    db.query.equipment.findMany({
      where: eq(equipment.active, true),
      columns: { id: true, name: true, notes: true },
      orderBy: [asc(equipment.name)],
    }),
  ]);

  return {
    services: serviceRows.map((item) => ({ id: item.id, name: item.name, detail: item.description })),
    staff: staffRows.map((item) => ({ id: item.id, name: item.name, detail: item.notes })),
    equipment: equipmentRows.map((item) => ({ id: item.id, name: item.name, detail: item.notes })),
  };
}

export async function listServices() {
  return db.query.services.findMany({
    orderBy: [asc(services.name)],
  });
}

export async function listStaff() {
  return db.query.staff.findMany({
    orderBy: [asc(staff.name)],
  });
}

export async function listEquipment() {
  return db.query.equipment.findMany({
    orderBy: [asc(equipment.name)],
  });
}

export async function listMembers() {
  return db.query.users.findMany({
    where: ne(users.role, "admin"),
    with: { profile: true },
    orderBy: [asc(users.createdAt)],
  });
}

export async function listStaffAccounts() {
  return db.query.users.findMany({
    where: inArray(users.role, ["member", "officer", "admin"]),
    with: { profile: true, unit: true },
    orderBy: [asc(users.createdAt)],
  });
}

export async function listOperations() {
  return db.query.operations.findMany({
    orderBy: [desc(operations.updatedAt)],
    with: { owner: { with: { profile: true } } },
  });
}

export async function listUnits() {
  return db.query.units.findMany({
    orderBy: [asc(units.name)],
    with: {
      leader: { with: { profile: true } },
      members: { with: { profile: true } },
    },
  });
}

export async function listReports() {
  return db.query.reports.findMany({
    orderBy: [desc(reports.createdAt)],
    with: {
      author: { with: { profile: true } },
      reviewer: { with: { profile: true } },
      events: { orderBy: (table, operators) => [operators.desc(table.createdAt)] },
    },
  });
}

export async function listDossiers() {
  return db.query.dossiers.findMany({
    orderBy: [desc(dossiers.updatedAt)],
    with: { author: { with: { profile: true } } },
  });
}

export async function listVipClients() {
  return db.query.users.findMany({
    where: eq(users.role, "vip"),
    with: { profile: true },
    orderBy: [asc(users.createdAt)],
  });
}

export async function listVipEvents() {
  return db.query.vipEvents.findMany({
    orderBy: [desc(vipEvents.createdAt)],
    limit: 30,
    with: { actor: { with: { profile: true } } },
  });
}

export async function listAudit(limit = 20) {
  return db.query.auditLog.findMany({
    orderBy: [desc(auditLog.createdAt)],
    limit,
    with: { actor: { with: { profile: true } } },
  });
}

export async function listFunctionPermissions() {
  return db.query.functionPermissions.findMany();
}
