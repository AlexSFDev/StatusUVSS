import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const C = {
  background: "#090A0D",
  surface: "#121419",
  border: "#252832",
  text: "#F5F5F7",
  muted: "#858B98",
  orange: "#F0A34A",
};

export default function SecurityScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brand}>
          UVSS<Text style={styles.red}>.</Text>
        </Text>
        <Text style={styles.heading}>Security</Text>
        <Text style={styles.subtitle}>Vehicle protection configuration</Text>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Simulation environment</Text>
          <Text style={styles.noticeText}>
            These settings are currently informational. No vehicle hardware is
            connected, and no real security functions can be activated yet.
          </Text>
        </View>

        <Text style={styles.section}>PROTECTION SYSTEMS</Text>

        {[
          ["Door monitoring", "Awaiting hardware"],
          ["Motion detection", "Awaiting hardware"],
          ["Shock detection", "Awaiting hardware"],
          ["Glass-break detection", "Awaiting hardware"],
          ["GPS tracking", "Awaiting hardware"],
          ["Backup power monitoring", "Awaiting hardware"],
        ].map(([title, status]) => (
          <View style={styles.item} key={title}>
            <View style={styles.itemIndicator} />
            <View style={styles.itemText}>
              <Text style={styles.itemTitle}>{title}</Text>
              <Text style={styles.itemStatus}>{status}</Text>
            </View>
            <Text style={styles.pending}>—</Text>
          </View>
        ))}

        <Text style={styles.vehicle}>Honda CR-V · RE22 WUX</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  brand: {
    color: C.text,
    fontSize: 29,
    fontWeight: "900",
    letterSpacing: -1.5,
    marginTop: 12,
  },
  red: {
    color: "#F04444",
  },
  heading: {
    color: C.text,
    fontSize: 27,
    fontWeight: "800",
    marginTop: 35,
  },
  subtitle: {
    color: C.muted,
    fontSize: 12,
    marginTop: 7,
    marginBottom: 25,
  },
  notice: {
    backgroundColor: "#2C251A",
    borderColor: "#594126",
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 30,
  },
  noticeTitle: {
    color: C.orange,
    fontWeight: "800",
    fontSize: 13,
    marginBottom: 7,
  },
  noticeText: {
    color: "#C9B9A3",
    fontSize: 11,
    lineHeight: 18,
  },
  section: {
    color: C.muted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  item: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 13,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },
  itemIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.orange,
    marginRight: 13,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    color: C.text,
    fontSize: 12,
    fontWeight: "700",
  },
  itemStatus: {
    color: C.muted,
    fontSize: 10,
    marginTop: 5,
  },
  pending: {
    color: C.muted,
    fontSize: 18,
  },
  vehicle: {
    color: C.muted,
    textAlign: "center",
    fontSize: 10,
    marginTop: 25,
    letterSpacing: 1,
  },
});
