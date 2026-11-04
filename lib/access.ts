import "server-only";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { auditLog, functionPermissions, users } from "./db/schema";
import { staffFunctions, type StaffFunction } from "./command";

export async function recordAudit(actorId: string, action: string) {
  await db.insert(auditLog).values({ actorId, action: action.slice(0, 240) });
}

export async function touchLastSeen(userId: string) {
  await db.update(users).set({ lastSeenAt: new Date() }).where(eq(users.id, userId));
}

export function clearedStaffAccess() {
  return {
    staffFunction: null,
    permContracts: false,
    permOperations: false,
    permStaff: false,
    permCommunications: false,
    permPanel: false,
    permAccess: false,
    permClassified: false,
  };
}

export async function accessForFunction(staffFunction: StaffFunction) {
  const row = await db.query.functionPermissions.findFirst({
    where: eq(functionPermissions.staffFunction, staffFunction),
  });
  return {
    staffFunction,
    permContracts: row?.contracts ?? false,
    permOperations: row?.operations ?? false,
    permStaff: row?.staff ?? false,
    permCommunications: row?.communications ?? false,
    permPanel: row?.panel ?? false,
    permAccess: row?.access ?? false,
    permClassified: row?.classified ?? false,
  };
}

export function isStaffFunction(value: string): value is StaffFunction {
  return staffFunctions.some((item) => item === value);
}
