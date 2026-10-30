export type SecurityState = "armed" | "disarmed";

export type CommandStatus = "idle" | "pending" | "confirmed" | "failed";

export type DataSource = "simulated" | "hardware" | "backend";

export type ConnectionStatus = "connected" | "disconnected" | "connecting";

export interface VehicleLocation {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  updatedAt: string | null;
}

export interface VehicleTelemetry {
  batteryPercentage: number | null;
  signalStrength: number | null;
  temperature: number | null;
  location: VehicleLocation;
  lastUpdated: string | null;
}

export interface Vehicle {
  id: string;
  name: string;
  registration: string;
  make: string;
  model: string;
  year: number | null;
  dataSource: DataSource;
  connectionStatus: ConnectionStatus;
  securityState: SecurityState;
  telemetry: VehicleTelemetry;
}

export interface SecurityCommand {
  id: string;
  vehicleId: string;
  action: SecurityState;
  status: CommandStatus;
  createdAt: string;
  completedAt: string | null;
  error: string | null;
}

export type ActivityType =
  | "system"
  | "vehicle"
  | "security"
  | "telemetry"
  | "warning"
  | "error";

export interface VehicleActivity {
  id: string;
  vehicleId: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  source: DataSource;
}
