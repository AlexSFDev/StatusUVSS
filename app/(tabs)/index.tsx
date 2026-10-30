import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
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

type SecurityState = "armed" | "disarmed";
type CommandState = "idle" | "pending" | "confirmed";

export default function DashboardScreen() {
  const [security, setSecurity] = useState<SecurityState>("disarmed");
  const [command, setCommand] = useState<CommandState>("idle");
  const [battery] = useState(94);

  useEffect(() => {
    if (command !== "pending") return;

    const timer = setTimeout(() => {
      setSecurity((current) => (current === "armed" ? "disarmed" : "armed"));
      setCommand("confirmed");
    }, 1200);

    return () => clearTimeout(timer);
  }, [command]);

  useEffect(() => {
    if (command !== "confirmed") return;

    const timer = setTimeout(() => setCommand("idle"), 2500);
    return () => clearTimeout(timer);
  }, [command]);

  const toggleSecurity = async () => {
    if (command === "pending") return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCommand("pending");
  };

  const armed = security === "armed";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>
              UVSS<Text style={styles.brandAccent}>.</Text>
            </Text>
            <Text style={styles.headerSubtitle}>VEHICLE SECURITY SYSTEM</Text>
          </View>

          <View style={styles.profileButton}>
            <Text style={styles.profileInitial}>A</Text>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.eyebrow}>YOUR VEHICLE</Text>
          <Text style={styles.lastUpdated}>DEMO ENVIRONMENT</Text>
        </View>

        <LinearGradient
          colors={["#20232B", "#13151B", "#101116"]}
          style={styles.vehicleCard}
        >
          <View style={styles.vehicleTop}>
            <View>
              <Text style={styles.vehicleName}>Honda CR-V</Text>
              <Text style={styles.registration}>RE22 WUX</Text>
            </View>
            <View style={styles.vehicleIcon}>
              <Text style={styles.carEmoji}>🚘</Text>
            </View>
          </View>

          <View style={styles.vehicleDivider} />

          <View style={styles.vehicleFooter}>
            <View>
              <Text style={styles.smallLabel}>SYSTEM STATUS</Text>
              <View style={styles.statusLine}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: armed ? C.green : C.orange },
                  ]}
                />
                <Text style={styles.statusText}>
                  {armed ? "Protected" : "Disarmed"}
                </Text>
              </View>
            </View>

            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>SIMULATED</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Security control</Text>
          <Text style={styles.sectionSubtitle}>
            Manage your vehicle protection
          </Text>
        </View>

        <View style={styles.securityCard}>
          <View style={styles.securityIconContainer}>
            <Text style={styles.securityIcon}>{armed ? "🔒" : "🔓"}</Text>
          </View>

          <Text style={styles.securityTitle}>
            {armed ? "Your vehicle is armed" : "Your vehicle is disarmed"}
          </Text>

          <Text style={styles.securityDescription}>
            {armed
              ? "Security monitoring is currently enabled."
              : "Your vehicle is not currently being monitored."}
          </Text>

          <Pressable
            onPress={toggleSecurity}
            disabled={command === "pending"}
            style={({ pressed }) => [
              styles.armButton,
              armed ? styles.disarmButton : styles.armButtonEnabled,
              pressed && styles.pressed,
              command === "pending" && styles.disabledButton,
            ]}
          >
            {command === "pending" ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.armButtonText}>
                {armed ? "DISARM SYSTEM" : "ARM SYSTEM"}
              </Text>
            )}
          </Pressable>

          <Text style={styles.commandFeedback}>
            {command === "pending"
              ? "Processing simulated command..."
              : command === "confirmed"
                ? "Simulated state updated successfully"
                : "Simulation only · No vehicle hardware connected"}
          </Text>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>System overview</Text>
          <Text style={styles.sectionSubtitle}>Latest simulated telemetry</Text>
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard
            icon="📡"
            title="Device"
            value="Offline"
            detail="No hardware connected"
            color={C.orange}
          />
          <MetricCard
            icon="📍"
            title="GPS"
            value="Unavailable"
            detail="Waiting for hardware"
            color={C.muted}
          />
          <MetricCard
            icon="🔋"
            title="Battery"
            value={`${battery}%`}
            detail="Simulated reading"
            color={C.green}
          />
          <MetricCard
            icon="🛡️"
            title="Protection"
            value={armed ? "Armed" : "Inactive"}
            detail="App simulation"
            color={armed ? C.green : C.orange}
          />
        </View>

        <View style={styles.activityHeader}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <Text style={styles.viewAll}>VIEW ALL</Text>
        </View>

        <View style={styles.activityCard}>
          <ActivityRow
            icon="⚙️"
            title="System initialised"
            detail="UVSS Control simulation started"
            time="Just now"
          />
          <View style={styles.activityDivider} />
          <ActivityRow
            icon="🚘"
            title="Vehicle registered"
            detail="Honda CR-V · RE22 WUX"
            time="Today"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>UVSS CONTROL</Text>
          <Text style={styles.footerVersion}>EARLY DEVELOPMENT BUILD</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({
  icon,
  title,
  value,
  detail,
  color,
}: {
  icon: string;
  title: string;
  value: string;
  detail: string;
  color: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricTop}>
        <Text style={styles.metricIcon}>{icon}</Text>
        <View style={[styles.metricIndicator, { backgroundColor: color }]} />
      </View>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricDetail}>{detail}</Text>
    </View>
  );
}

function ActivityRow({
  icon,
  title,
  detail,
  time,
}: {
  icon: string;
  title: string;
  detail: string;
  time: string;
}) {
  return (
    <View style={styles.activityRow}>
      <View style={styles.activityIcon}>
        <Text>{icon}</Text>
      </View>
      <View style={styles.activityInfo}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activityDetail}>{detail}</Text>
      </View>
      <Text style={styles.activityTime}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.background,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 35,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 32,
  },
  brand: {
    color: C.text,
    fontSize: 29,
    fontWeight: "900",
    letterSpacing: -1.5,
  },
  brandAccent: {
    color: C.red,
  },
  headerSubtitle: {
    color: C.muted,
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: "700",
    marginTop: 2,
  },
  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.surfaceLight,
    borderWidth: 1,
    borderColor: C.border,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitial: {
    color: C.text,
    fontSize: 16,
    fontWeight: "700",
  },
  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
    marginTop: 5,
  },
  eyebrow: {
    color: C.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
  },
  lastUpdated: {
    color: C.orange,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  vehicleCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 30,
  },
  vehicleTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 90,
  },
  vehicleName: {
    color: C.text,
    fontSize: 23,
    fontWeight: "800",
  },
  registration: {
    color: C.muted,
    fontSize: 13,
    marginTop: 7,
    letterSpacing: 2,
    fontWeight: "700",
  },
  vehicleIcon: {
    width: 75,
    height: 65,
    backgroundColor: "#292D37",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  carEmoji: {
    fontSize: 36,
  },
  vehicleDivider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 17,
  },
  vehicleFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  smallLabel: {
    color: C.muted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  statusLine: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
  },
  demoBadge: {
    backgroundColor: "#3A2C1C",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 7,
  },
  demoBadgeText: {
    color: C.orange,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 17,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: C.muted,
    fontSize: 11,
    marginTop: 4,
  },
  securityCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 21,
    alignItems: "center",
    marginBottom: 29,
  },
  securityIconContainer: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: C.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  securityIcon: {
    fontSize: 28,
  },
  securityTitle: {
    color: C.text,
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },
  securityDescription: {
    color: C.muted,
    fontSize: 12,
    marginTop: 7,
    textAlign: "center",
  },
  armButton: {
    width: "100%",
    minHeight: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  armButtonEnabled: {
    backgroundColor: C.red,
  },
  disarmButton: {
    backgroundColor: "#30343D",
    borderWidth: 1,
    borderColor: "#454A55",
  },
  armButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  pressed: {
    opacity: 0.8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  commandFeedback: {
    color: C.muted,
    fontSize: 10,
    textAlign: "center",
    marginTop: 12,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 30,
  },
  metricCard: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 15,
    minHeight: 140,
  },
  metricTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  metricIcon: {
    fontSize: 19,
  },
  metricIndicator: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  metricTitle: {
    color: C.muted,
    fontSize: 11,
    fontWeight: "600",
  },
  metricValue: {
    color: C.text,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 5,
  },
  metricDetail: {
    color: C.muted,
    fontSize: 9,
    marginTop: 5,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
  },
  viewAll: {
    color: C.red,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  activityCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 15,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    gap: 11,
  },
  activityIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: C.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    color: C.text,
    fontSize: 12,
    fontWeight: "700",
  },
  activityDetail: {
    color: C.muted,
    fontSize: 10,
    marginTop: 4,
  },
  activityTime: {
    color: C.muted,
    fontSize: 9,
  },
  activityDivider: {
    height: 1,
    backgroundColor: C.border,
  },
  footer: {
    alignItems: "center",
    marginTop: 28,
    gap: 5,
  },
  footerText: {
    color: C.muted,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2,
  },
  footerVersion: {
    color: "#555B66",
    fontSize: 8,
    letterSpacing: 1.2,
  },
});
