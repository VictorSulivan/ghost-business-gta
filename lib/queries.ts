import { and, asc, desc, eq, inArray, ne } from "drizzle-orm";
import { db } from "./db";
import {
  ACTIVE_REQUEST_STATUSES,
  PAST_REQUEST_STATUSES,
  equipment,
  requests,
  services,
  staff,
  users,
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
    with: { client: { with: { profile: true } } },
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
