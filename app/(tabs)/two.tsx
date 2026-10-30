import { useVehicle } from "@/contexts/VehicleContext";
import * as Haptics from "expo-haptics";
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

const sensors = [
  { name: "Door monitoring", detail: "Detects vehicle door activity" },
  { name: "Motion detection", detail: "Monitors movement inside the vehicle" },
  { name: "Shock detection", detail: "Detects impacts and vibrations" },
  { name: "Glass-break detection", detail: "Monitors for glass break events" },
  { name: "GPS tracking", detail: "Provides vehicle location information" },
  { name: "Backup power", detail: "Monitors the security system power supply" },
];

export default function SecurityScreen() {
  const { activeVehicle, command, commandStatus, setSecurityState } =
    useVehicle();

  const [submitting, setSubmitting] = useState(false);

  const isArmed = activeVehicle.securityState === "armed";
  const isPending = commandStatus === "pending" || submitting;

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
          <Text style={styles.eyebrow}>PROTECTION CENTRE</Text>
          <Text style={styles.title}>Security</Text>
          <Text style={styles.subtitle}>
            Manage and monitor your vehicle's protection systems.
          </Text>
        </View>

        <View style={styles.vehicleCard}>
          <View style={styles.vehicleHeader}>
            <View>
              <Text style={styles.vehicleLabel}>ACTIVE VEHICLE</Text>
              <Text style={styles.vehicleName}>
                {activeVehicle.make} {activeVehicle.model}
              </Text>
              <Text style={styles.registration}>
                {activeVehicle.registration}
              </Text>
            </View>
            <View
              style={[
                styles.stateBadge,
                { backgroundColor: isArmed ? "#153528" : "#382A19" },
              ]}
            >
              <View
                style={[
                  styles.stateDot,
                  { backgroundColor: isArmed ? C.green : C.orange },
                ]}
              />
              <Text
                style={[
                  styles.stateText,
                  { color: isArmed ? C.green : C.orange },
                ]}
              >
                {isArmed ? "ARMED" : "DISARMED"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.controlTitle}>Security controls</Text>
          <Text style={styles.controlDescription}>
            {isArmed
              ? "Your simulated protection system is currently active."
              : "Your simulated protection system is currently inactive."}
          </Text>

          <View style={styles.buttonRow}>
            <Pressable
              disabled={isPending || isArmed}
              onPress={() => void handleSecurityChange("armed")}
              style={({ pressed }) => [
                styles.button,
                styles.armButton,
                (isPending || isArmed) && styles.disabledButton,
                pressed && !isPending && !isArmed && styles.pressedButton,
              ]}
            >
              {isPending && command?.action === "armed" ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.armButtonText}>ARM SYSTEM</Text>
              )}
            </Pressable>

            <Pressable
              disabled={isPending || !isArmed}
              onPress={() => void handleSecurityChange("disarmed")}
              style={({ pressed }) => [
                styles.button,
                styles.disarmButton,
                (isPending || !isArmed) && styles.disabledButton,
                pressed && !isPending && isArmed && styles.pressedButton,
              ]}
            >
              {isPending && command?.action === "disarmed" ? (
                <ActivityIndicator color={C.text} />
              ) : (
                <Text style={styles.disarmButtonText}>DISARM</Text>
              )}
            </Pressable>
          </View>

          <Text style={styles.simulationNotice}>
            Simulation only. No physical vehicle security hardware is connected.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Protection systems</Text>
          <Text style={styles.sectionCount}>0 / {sensors.length} active</Text>
        </View>

        <View style={styles.sensorCard}>
          {sensors.map((sensor, index) => (
            <View
              key={sensor.name}
              style={[
                styles.sensorRow,
                index === sensors.length - 1 && styles.lastSensorRow,
              ]}
            >
              <View style={styles.sensorIcon}>
                <View style={styles.sensorIconInner} />
              </View>
              <View style={styles.sensorInfo}>
                <Text style={styles.sensorName}>{sensor.name}</Text>
                <Text style={styles.sensorDetail}>{sensor.detail}</Text>
              </View>
              <View style={styles.waitingBadge}>
                <Text style={styles.waitingText}>NOT CONNECTED</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.noticeCard}>
          <View style={styles.noticeIcon}>
            <Text style={styles.noticeIconText}>i</Text>
          </View>
          <View style={styles.noticeContent}>
            <Text style={styles.noticeTitle}>Hardware not connected</Text>
            <Text style={styles.noticeDescription}>
              These protection systems are waiting for compatible UVSS hardware.
              Their status will become available when real devices are
              integrated and verified.
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>UVSS CONTROL · SECURITY</Text>
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
    marginBottom: 24,
  },
  eyebrow: {
    color: C.red,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 7,
  },
  title: {
    color: C.text,
    fontSize: 29,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  subtitle: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },
  vehicleCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 17,
    padding: 17,
    marginBottom: 27,
  },
  vehicleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  vehicleLabel: {
    color: C.muted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.3,
    marginBottom: 7,
  },
  vehicleName: {
    color: C.text,
    fontSize: 17,
    fontWeight: "800",
  },
  registration: {
    color: C.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.3,
    marginTop: 4,
  },
  stateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },
  stateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stateText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 17,
  },
  controlTitle: {
    color: C.text,
    fontSize: 15,
    fontWeight: "800",
  },
  controlDescription: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flex: 1,
    minHeight: 45,
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
  armButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  disarmButtonText: {
    color: C.text,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  disabledButton: {
    opacity: 0.38,
  },
  pressedButton: {
    opacity: 0.75,
  },
  simulationNotice: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 13,
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
  sectionCount: {
    color: C.muted,
    fontSize: 10,
  },
  sensorCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 17,
  },
  sensorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 11,
  },
  lastSensorRow: {
    borderBottomWidth: 0,
  },
  sensorIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: C.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },
  sensorIconInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.muted,
  },
  sensorInfo: {
    flex: 1,
  },
  sensorName: {
    color: C.text,
    fontSize: 11,
    fontWeight: "700",
  },
  sensorDetail: {
    color: C.muted,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 4,
  },
  waitingBadge: {
    backgroundColor: "#252832",
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 6,
  },
  waitingText: {
    color: C.muted,
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  noticeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    backgroundColor: "#211B15",
    borderWidth: 1,
    borderColor: "#493522",
    borderRadius: 14,
    padding: 14,
  },
  noticeIcon: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: "#493522",
    alignItems: "center",
    justifyContent: "center",
  },
  noticeIconText: {
    color: C.orange,
    fontSize: 13,
    fontWeight: "900",
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    color: C.orange,
    fontSize: 12,
    fontWeight: "800",
  },
  noticeDescription: {
    color: "#B9A38C",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
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
