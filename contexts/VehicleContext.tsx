import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type {
  CommandStatus,
  SecurityCommand,
  SecurityState,
  Vehicle,
  VehicleActivity,
} from "@/types/vehicle";

import {
  createActivity,
  createInitialVehicle,
  sendSimulatedSecurityCommand,
} from "@/services/vehicleSimulator";

export interface NewVehicleInput {
  make: string;
  model: string;
  registration: string;
  year: number | null;
}

type AddVehicleResult =
  | { success: true; vehicleId: string }
  | { success: false; error: string };

interface VehicleContextValue {
  vehicles: Vehicle[];
  activeVehicle: Vehicle;
  activeVehicleId: string;
  activities: VehicleActivity[];
  command: SecurityCommand | null;
  commandStatus: CommandStatus;
  selectVehicle: (vehicleId: string) => void;
  addVehicle: (input: NewVehicleInput) => AddVehicleResult;
  setSecurityState: (state: SecurityState) => Promise<void>;
}

const VehicleContext = createContext<VehicleContextValue | null>(null);

export function VehicleProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([createInitialVehicle()]);

  const [activeVehicleId, setActiveVehicleId] = useState(
    "vehicle_honda_crv_001",
  );

  const [activities, setActivities] = useState<VehicleActivity[]>([
    createActivity(
      "vehicle_honda_crv_001",
      "System initialised",
      "UVSS Control simulation started",
    ),
    createActivity(
      "vehicle_honda_crv_001",
      "Vehicle registered",
      "Honda CR-V · RE22 WUX",
      "vehicle",
    ),
  ]);

  const [command, setCommand] = useState<SecurityCommand | null>(null);
  const commandLock = useRef(false);

  const activeVehicle = useMemo(() => {
    const selected = vehicles.find((vehicle) => vehicle.id === activeVehicleId);

    if (!selected) {
      throw new Error("No active vehicle is available");
    }

    return selected;
  }, [vehicles, activeVehicleId]);

  const commandStatus: CommandStatus = command?.status ?? "idle";

  const selectVehicle = useCallback(
    (vehicleId: string) => {
      setActiveVehicleId((current) =>
        vehicles.some((vehicle) => vehicle.id === vehicleId)
          ? vehicleId
          : current,
      );
      setCommand(null);
    },
    [vehicles],
  );

  const addVehicle = useCallback(
    (input: NewVehicleInput): AddVehicleResult => {
      const make = input.make.trim();
      const model = input.model.trim();
      const registration = input.registration
        .trim()
        .toUpperCase()
        .replace(/\s+/g, " ");

      if (!make || !model || !registration) {
        return {
          success: false,
          error: "Make, model and registration are required.",
        };
      }

      if (make.length > 40 || model.length > 40 || registration.length > 12) {
        return {
          success: false,
          error: "One or more fields are too long.",
        };
      }

      const registrationKey = registration.replace(/\s/g, "");

      const duplicate = vehicles.some(
        (vehicle) =>
          vehicle.registration.replace(/\s/g, "").toUpperCase() ===
          registrationKey,
      );

      if (duplicate) {
        return {
          success: false,
          error: "A vehicle with this registration is already registered.",
        };
      }

      if (
        input.year !== null &&
        (!Number.isInteger(input.year) ||
          input.year < 1886 ||
          input.year > new Date().getFullYear() + 1)
      ) {
        return {
          success: false,
          error: "Enter a valid vehicle year.",
        };
      }

      const vehicleId = `vehicle_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

      const vehicle: Vehicle = {
        id: vehicleId,
        name: `${make} ${model}`,
        registration,
        make,
        model,
        year: input.year,
        dataSource: "simulated",
        connectionStatus: "disconnected",
        securityState: "disarmed",
        telemetry: {
          batteryPercentage: null,
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
      };

      setVehicles((current) => [...current, vehicle]);
      setActiveVehicleId(vehicleId);
      setCommand(null);

      setActivities((current) => [
        createActivity(
          vehicleId,
          "Vehicle registered",
          `${make} ${model} · ${registration}`,
          "vehicle",
        ),
        ...current,
      ]);

      return { success: true, vehicleId };
    },
    [vehicles],
  );

  const setSecurityState = useCallback(
    async (targetState: SecurityState) => {
      if (commandLock.current) return;

      const vehicle = vehicles.find((item) => item.id === activeVehicleId);

      if (!vehicle || vehicle.securityState === targetState) return;

      commandLock.current = true;

      const vehicleId = vehicle.id;
      const commandId = `command_${Date.now()}`;
      const createdAt = new Date().toISOString();

      setCommand({
        id: commandId,
        vehicleId,
        action: targetState,
        status: "pending",
        createdAt,
        completedAt: null,
        error: null,
      });

      try {
        const result = await sendSimulatedSecurityCommand(targetState);

        setVehicles((current) =>
          current.map((item) =>
            item.id === vehicleId
              ? { ...item, securityState: result.state }
              : item,
          ),
        );

        setCommand({
          id: commandId,
          vehicleId,
          action: targetState,
          status: "confirmed",
          createdAt,
          completedAt: new Date().toISOString(),
          error: null,
        });

        setActivities((current) => [
          createActivity(
            vehicleId,
            targetState === "armed" ? "System armed" : "System disarmed",
            "Simulated command confirmed. No physical vehicle control occurred.",
            "security",
          ),
          ...current,
        ]);
      } catch {
        setCommand({
          id: commandId,
          vehicleId,
          action: targetState,
          status: "failed",
          createdAt,
          completedAt: new Date().toISOString(),
          error: "The simulated command could not be completed.",
        });

        setActivities((current) => [
          createActivity(
            vehicleId,
            "Security command failed",
            "The simulated command could not be completed.",
            "error",
          ),
          ...current,
        ]);
      } finally {
        commandLock.current = false;
      }
    },
    [activeVehicleId, vehicles],
  );

  const value = useMemo<VehicleContextValue>(
    () => ({
      vehicles,
      activeVehicle,
      activeVehicleId,
      activities,
      command,
      commandStatus,
      selectVehicle,
      addVehicle,
      setSecurityState,
    }),
    [
      vehicles,
      activeVehicle,
      activeVehicleId,
      activities,
      command,
      commandStatus,
      selectVehicle,
      addVehicle,
      setSecurityState,
    ],
  );

  return (
    <VehicleContext.Provider value={value}>{children}</VehicleContext.Provider>
  );
}

export function useVehicle() {
  const context = useContext(VehicleContext);

  if (!context) {
    throw new Error("useVehicle must be used inside VehicleProvider");
  }

  return context;
}
