import type {
  SecurityState,
  Vehicle,
  VehicleActivity,
  VehicleTelemetry,
} from "@/types/vehicle";

const delay = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export const createInitialVehicle = (): Vehicle => ({
  id: "vehicle_honda_crv_001",
  name: "My Honda",
  registration: "RE22 WUX",
  make: "Honda",
  model: "CR-V",
  year: 2022,
  dataSource: "simulated",
  connectionStatus: "disconnected",
  securityState: "disarmed",
  telemetry: {
    batteryPercentage: 94,
    signalStrength: null,
    temperature: null,
    location: {
      latitude: null,
      longitude: null,
      accuracy: null,
      updatedAt: null,
    },
    lastUpdated: new Date().toISOString(),
  },
});

export const createActivity = (
  vehicleId: string,
  title: string,
  description: string,
  type: VehicleActivity["type"] = "system",
): VehicleActivity => ({
  id: `activity_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
  vehicleId,
  type,
  title,
  description,
  timestamp: new Date().toISOString(),
  source: "simulated",
});

export const sendSimulatedSecurityCommand = async (
  targetState: SecurityState,
): Promise<{ confirmed: true; state: SecurityState }> => {
  await delay(1200);

  return {
    confirmed: true,
    state: targetState,
  };
};

export const generateSimulatedTelemetry = (
  current: VehicleTelemetry,
): VehicleTelemetry => ({
  ...current,
  batteryPercentage: current.batteryPercentage,
  lastUpdated: new Date().toISOString(),
});
