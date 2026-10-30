import { useVehicle } from "@/contexts/VehicleContext";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const C = {
  background: "#090A0D",
  surface: "#121419",
  surfaceLight: "#191C23",
  border: "#252832",
  text: "#F5F5F7",
  muted: "#858B98",
  red: "#F04444",
  green: "#35C98A",
  orange: "#F0A34A",
};

function MetricCard({
  label,
  value,
  detail,
  accent = C.text,
}: {
  label: string;
  value: string;
  detail: string;
  accent?: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: accent }]}>{value}</Text>
      <Text style={styles.metricDetail}>{detail}</Text>
    </View>
  );
}

function ActivityRow({
  title,
  description,
  timestamp,
}: {
  title: string;
  description: string;
  timestamp: string;
}) {
  const time = new Date(timestamp);
  const formattedTime = Number.isNaN(time.getTime())
    ? "Recently"
    : time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <View style={styles.activityRow}>
      <View style={styles.activityDot} />
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activityDescription}>{description}</Text>
      </View>
      <Text style={styles.activityTime}>{formattedTime}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const {
    activeVehicle,
    activities,
    commandStatus,
    command,
    setSecurityState,
  } = useVehicle();

  const [submitting, setSubmitting] = useState(false);

  const isArmed = activeVehicle.securityState === "armed";
  const isPending = commandStatus === "pending" || submitting;
  const vehicleActivities = activities
    .filter((item) => item.vehicleId === activeVehicle.id)
    .slice(0, 5);

  const handleSecurityChange = async (state: "armed" | "disarmed") => {
    if (isPending || activeVehicle.securityState === state) return;

    setSubmitting(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setSecurityState(state);
    setSubmitting(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>STATUSFIRE PRODUCT</Text>
            <Text style={styles.headerTitle}>UVSS Control</Text>
          </View>
          <View style={styles.simulationBadge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>SIMULATION</Text>
          </View>
        </View>

        <LinearGradient
          colors={["#20232B", "#14161C", "#111318"]}
          style={styles.vehicleCard}
        >
          <View style={styles.vehicleTop}>
            <View>
              <Text style={styles.vehicleEyebrow}>YOUR VEHICLE</Text>
              <Text style={styles.vehicleName}>
                {activeVehicle.make} {activeVehicle.model}
              </Text>
              <Text style={styles.vehicleRegistration}>
                {activeVehicle.registration}
              </Text>
            </View>
            <View style={styles.vehicleIcon}>
              <Text style={styles.vehicleIconText}>🚘</Text>
            </View>
          </View>

          <View style={styles.vehicleDivider} />

          <View style={styles.vehicleBottom}>
            <View>
              <Text style={styles.smallLabel}>CONNECTION</Text>
              <View style={styles.inlineStatus}>
                <View
                  style={[styles.statusDot, { backgroundColor: C.orange }]}
                />
                <Text style={styles.vehicleStatus}>Device offline</Text>
              </View>
            </View>
            <View style={styles.vehicleBottomRight}>
              <Text style={styles.smallLabel}>PROTECTION</Text>
              <Text
                style={[
                  styles.protectionStatus,
                  { color: isArmed ? C.green : C.orange },
                ]}
              >
                {isArmed ? "Armed" : "Disarmed"}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Security control</Text>
          <Text style={styles.sectionSubtitle}>Vehicle protection</Text>
        </View>

        <View style={styles.securityCard}>
          <View style={styles.securityTop}>
            <View
              style={[
                styles.securityIcon,
                { backgroundColor: isArmed ? "#153528" : "#382A19" },
              ]}
            >
              <Text style={styles.securityIconText}>{isArmed ? "✓" : "!"}</Text>
            </View>
            <View style={styles.securityInfo}>
              <Text style={styles.securityTitle}>
                {isArmed ? "Protection is armed" : "Protection is disarmed"}
              </Text>
              <Text style={styles.securityDescription}>
                {isArmed
                  ? "The simulated security system is active."
                  : "Your simulated security system is not active."}
              </Text>
            </View>
          </View>

          <View style={styles.securityDivider} />

          <View style={styles.buttonRow}>
            <Pressable
              disabled={isPending || isArmed}
              onPress={() => void handleSecurityChange("armed")}
              style={({ pressed }) => [
                styles.actionButton,
                styles.armButton,
                (isPending || isArmed) && styles.disabledButton,
                pressed && !isPending && !isArmed && styles.pressedButton,
              ]}
            >
              {isPending && command?.action === "armed" ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>ARM SYSTEM</Text>
              )}
            </Pressable>

            <Pressable
              disabled={isPending || !isArmed}
              onPress={() => void handleSecurityChange("disarmed")}
              style={({ pressed }) => [
                styles.actionButton,
                styles.disarmButton,
                (isPending || !isArmed) && styles.disabledButton,
                pressed && !isPending && isArmed && styles.pressedButton,
              ]}
            >
              {isPending && command?.action === "disarmed" ? (
                <ActivityIndicator color={C.text} />
              ) : (
                <Text style={[styles.actionButtonText, { color: C.text }]}>
                  DISARM
                </Text>
              )}
            </Pressable>
          </View>

          <Text style={styles.simulationNotice}>
            Simulation only. These controls do not communicate with or secure a
            real vehicle.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>System overview</Text>
          <Text style={styles.sectionSubtitle}>Live status</Text>
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard
            label="DEVICE"
            value="Offline"
            detail="No hardware connected"
            accent={C.orange}
          />
          <MetricCard
            label="GPS"
            value="Unavailable"
            detail="Waiting for hardware"
            accent={C.muted}
          />
          <MetricCard
            label="BATTERY"
            value={
              activeVehicle.telemetry.batteryPercentage == null
                ? "—"
                : `${activeVehicle.telemetry.batteryPercentage}%`
            }
            detail="Simulated reading"
            accent={C.green}
          />
          <MetricCard
            label="PROTECTION"
            value={isArmed ? "Armed" : "Disarmed"}
            detail="Current system state"
            accent={isArmed ? C.green : C.orange}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <Text style={styles.sectionSubtitle}>Latest events</Text>
        </View>

        <View style={styles.activityCard}>
          {vehicleActivities.length > 0 ? (
            vehicleActivities.map((item) => (
              <ActivityRow
                key={item.id}
                title={item.title}
                description={item.description}
                timestamp={item.timestamp}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No activity recorded yet.</Text>
          )}
        </View>

        <Text style={styles.footer}>UVSS CONTROL · STATUSFIRE</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.background,
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  eyebrow: {
    color: C.red,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 5,
  },
  headerTitle: {
    color: C.text,
    fontSize: 27,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  simulationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#292016",
    borderColor: "#594027",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 6,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.orange,
  },
  badgeText: {
    color: C.orange,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  vehicleCard: {
    borderRadius: 19,
    padding: 19,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 27,
  },
  vehicleTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vehicleEyebrow: {
    color: C.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  vehicleName: {
    color: C.text,
    fontSize: 22,
    fontWeight: "800",
  },
  vehicleRegistration: {
    color: C.muted,
    fontSize: 13,
    marginTop: 5,
    letterSpacing: 1.5,
    fontWeight: "700",
  },
  vehicleIcon: {
    width: 57,
    height: 57,
    borderRadius: 16,
    backgroundColor: "#292D37",
    alignItems: "center",
    justifyContent: "center",
  },
  vehicleIconText: {
    fontSize: 29,
  },
  vehicleDivider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 18,
  },
  vehicleBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  vehicleBottomRight: {
    alignItems: "flex-end",
  },
  smallLabel: {
    color: C.muted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 7,
  },
  inlineStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  vehicleStatus: {
    color: C.text,
    fontSize: 12,
    fontWeight: "600",
  },
  protectionStatus: {
    fontSize: 13,
    fontWeight: "800",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 17,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: C.muted,
    fontSize: 11,
  },
  securityCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 17,
    padding: 17,
    marginBottom: 27,
  },
  securityTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  securityIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  securityIconText: {
    color: C.text,
    fontSize: 20,
    fontWeight: "900",
  },
  securityInfo: {
    flex: 1,
  },
  securityTitle: {
    color: C.text,
    fontSize: 14,
    fontWeight: "800",
  },
  securityDescription: {
    color: C.muted,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  securityDivider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 17,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  armButton: {
    backgroundColor: C.red,
  },
  disarmButton: {
    backgroundColor: C.surfaceLight,
    borderWidth: 1,
    borderColor: C.border,
  },
  disabledButton: {
    opacity: 0.38,
  },
  pressedButton: {
    opacity: 0.75,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  simulationNotice: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 13,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 11,
    marginBottom: 27,
  },
  metricCard: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
    padding: 15,
    minHeight: 105,
  },
  metricLabel: {
    color: C.muted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: "800",
    marginTop: 10,
  },
  metricDetail: {
    color: C.muted,
    fontSize: 10,
    marginTop: 5,
  },
  activityCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
    paddingHorizontal: 15,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 10,
  },
  activityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.red,
    marginTop: 5,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    color: C.text,
    fontSize: 12,
    fontWeight: "700",
  },
  activityDescription: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  activityTime: {
    color: C.muted,
    fontSize: 9,
  },
  emptyText: {
    color: C.muted,
    fontSize: 12,
    paddingVertical: 18,
  },
  footer: {
    color: "#555B66",
    textAlign: "center",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginTop: 25,
  },
});
