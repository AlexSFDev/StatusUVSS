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

interface VehicleContextValue {
  vehicles: Vehicle[];
  activeVehicle: Vehicle;
  activeVehicleId: string;
  activities: VehicleActivity[];
  command: SecurityCommand | null;
  commandStatus: CommandStatus;
  selectVehicle: (vehicleId: string) => void;
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

  const selectVehicle = useCallback((vehicleId: string) => {
    setActiveVehicleId(vehicleId);
    setCommand(null);
  }, []);

  const setSecurityState = useCallback(
    async (targetState: SecurityState) => {
      if (commandLock.current) return;

      const vehicle = vehicles.find((item) => item.id === activeVehicleId);
      if (!vehicle || vehicle.securityState === targetState) return;

      commandLock.current = true;

      const commandId = `command_${Date.now()}`;
      const createdAt = new Date().toISOString();

      setCommand({
        id: commandId,
        vehicleId: activeVehicleId,
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
            item.id === activeVehicleId
              ? { ...item, securityState: result.state }
              : item,
          ),
        );

        setCommand({
          id: commandId,
          vehicleId: activeVehicleId,
          action: targetState,
          status: "confirmed",
          createdAt,
          completedAt: new Date().toISOString(),
          error: null,
        });

        setActivities((current) => [
          createActivity(
            activeVehicleId,
            targetState === "armed" ? "System armed" : "System disarmed",
            "Simulated command confirmed. No physical vehicle control occurred.",
            "security",
          ),
          ...current,
        ]);
      } catch {
        setCommand({
          id: commandId,
          vehicleId: activeVehicleId,
          action: targetState,
          status: "failed",
          createdAt,
          completedAt: new Date().toISOString(),
          error: "The simulated command could not be completed.",
        });

        setActivities((current) => [
          createActivity(
            activeVehicleId,
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
