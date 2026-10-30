import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Vehicle, VehicleActivity } from "@/types/vehicle";

const STORAGE_KEY = "@statusuvss/vehicle-state";
const STORAGE_VERSION = 1;

export interface PersistedVehicleState {
  version: number;
  vehicles: Vehicle[];
  activeVehicleId: string;
  activities: VehicleActivity[];
}

let writeQueue: Promise<void> = Promise.resolve();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isVehicle = (value: unknown): value is Vehicle => {
  if (!isRecord(value) || !isRecord(value.telemetry)) return false;

  const telemetry = value.telemetry;

  if (!isRecord(telemetry.location)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.registration === "string" &&
    typeof value.make === "string" &&
    typeof value.model === "string" &&
    (typeof value.year === "number" || value.year === null) &&
    ["simulated", "hardware", "backend"].includes(String(value.dataSource)) &&
    ["connected", "disconnected", "connecting"].includes(
      String(value.connectionStatus),
    ) &&
    ["armed", "disarmed"].includes(String(value.securityState)) &&
    (typeof telemetry.batteryPercentage === "number" ||
      telemetry.batteryPercentage === null) &&
    (typeof telemetry.signalStrength === "number" ||
      telemetry.signalStrength === null) &&
    (typeof telemetry.temperature === "number" ||
      telemetry.temperature === null) &&
    (typeof telemetry.lastUpdated === "string" ||
      telemetry.lastUpdated === null) &&
    (typeof telemetry.location.latitude === "number" ||
      telemetry.location.latitude === null) &&
    (typeof telemetry.location.longitude === "number" ||
      telemetry.location.longitude === null) &&
    (typeof telemetry.location.accuracy === "number" ||
      telemetry.location.accuracy === null) &&
    (typeof telemetry.location.updatedAt === "string" ||
      telemetry.location.updatedAt === null)
  );
};

const isActivity = (value: unknown): value is VehicleActivity => {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.vehicleId === "string" &&
    ["system", "vehicle", "security", "telemetry", "warning", "error"].includes(
      String(value.type),
    ) &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    typeof value.timestamp === "string" &&
    ["simulated", "hardware", "backend"].includes(String(value.source))
  );
};

export async function loadVehicleState(): Promise<PersistedVehicleState | null> {
  const storedValue = await AsyncStorage.getItem(STORAGE_KEY);

  if (storedValue === null) return null;

  let parsed: unknown;

  try {
    parsed = JSON.parse(storedValue);
  } catch {
    throw new Error(
      "Saved vehicle data could not be read because it is invalid JSON.",
    );
  }

  if (!isRecord(parsed)) {
    throw new Error("Saved vehicle data has an invalid format.");
  }

  if (parsed.version !== STORAGE_VERSION) {
    throw new Error(
      `Unsupported vehicle storage version: ${String(parsed.version)}`,
    );
  }

  if (
    !Array.isArray(parsed.vehicles) ||
    !Array.isArray(parsed.activities) ||
    typeof parsed.activeVehicleId !== "string" ||
    parsed.vehicles.length === 0 ||
    !parsed.vehicles.every(isVehicle) ||
    !parsed.activities.every(isActivity)
  ) {
    throw new Error("Saved vehicle data failed validation.");
  }

  const vehicles = parsed.vehicles as Vehicle[];
  const activities = parsed.activities as VehicleActivity[];

  if (!vehicles.some((vehicle) => vehicle.id === parsed.activeVehicleId)) {
    throw new Error("The saved active vehicle could not be found.");
  }

  const vehicleIds = new Set(vehicles.map((vehicle) => vehicle.id));

  if (vehicleIds.size !== vehicles.length) {
    throw new Error("Saved vehicle data contains duplicate vehicle IDs.");
  }

  return {
    version: STORAGE_VERSION,
    vehicles,
    activeVehicleId: parsed.activeVehicleId,
    activities: activities.filter((activity) =>
      vehicleIds.has(activity.vehicleId),
    ),
  };
}

export function saveVehicleState(
  state: Omit<PersistedVehicleState, "version">,
): Promise<void> {
  const serialized = JSON.stringify({
    version: STORAGE_VERSION,
    ...state,
  });

  writeQueue = writeQueue
    .catch(() => undefined)
    .then(() => AsyncStorage.setItem(STORAGE_KEY, serialized));

  return writeQueue;
}
