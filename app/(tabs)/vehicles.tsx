import { useVehicle } from "@/contexts/VehicleContext";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

export default function VehiclesScreen() {
  const { vehicles, activeVehicleId, selectVehicle, addVehicle } = useVehicle();

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [registration, setRegistration] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAddVehicle = () => {
    Keyboard.dismiss();
    setError("");
    setSuccess("");

    const parsedYear = year.trim() ? Number(year.trim()) : null;

    if (year.trim() && !/^\d{4}$/.test(year.trim())) {
      setError("Enter the year using four digits, or leave it blank.");
      return;
    }

    const result = addVehicle({
      make,
      model,
      registration,
      year: parsedYear,
    });

    if (!result.success) {
      setError(result.error);
      return;
    }

    setMake("");
    setModel("");
    setRegistration("");
    setYear("");
    setSuccess("Vehicle registered and selected successfully.");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>YOUR GARAGE</Text>
          <Text style={styles.title}>Vehicles</Text>
          <Text style={styles.subtitle}>
            Manage the vehicles connected to your UVSS account.
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>REGISTERED VEHICLES</Text>
            <Text style={styles.summaryValue}>{vehicles.length}</Text>
          </View>
          <View style={styles.summaryIcon}>
            <Text style={styles.summaryIconText}>🚘</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your vehicles</Text>
          <Text style={styles.sectionSubtitle}>Select an active vehicle</Text>
        </View>

        <View style={styles.vehicleList}>
          {vehicles.map((vehicle) => {
            const isActive = vehicle.id === activeVehicleId;
            const isArmed = vehicle.securityState === "armed";

            return (
              <Pressable
                key={vehicle.id}
                onPress={() => {
                  selectVehicle(vehicle.id);
                  setSuccess("");
                  setError("");
                }}
                style={({ pressed }) => [
                  styles.vehicleCard,
                  isActive && styles.activeVehicleCard,
                  pressed && styles.pressedCard,
                ]}
              >
                <View style={styles.vehicleCardTop}>
                  <View style={styles.vehicleIcon}>
                    <Text style={styles.vehicleIconText}>🚘</Text>
                  </View>
                  <View style={styles.vehicleDetails}>
                    <Text style={styles.vehicleName}>
                      {vehicle.make} {vehicle.model}
                    </Text>
                    <Text style={styles.vehicleRegistration}>
                      {vehicle.registration}
                    </Text>
                    <Text style={styles.vehicleYear}>
                      {vehicle.year ?? "Year not specified"}
                    </Text>
                  </View>
                  <View style={styles.selectionArea}>
                    {isActive ? (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeText}>ACTIVE</Text>
                      </View>
                    ) : (
                      <View style={styles.selectCircle} />
                    )}
                  </View>
                </View>

                <View style={styles.vehicleDivider} />

                <View style={styles.vehicleCardBottom}>
                  <View>
                    <Text style={styles.cardLabel}>SECURITY</Text>
                    <Text
                      style={[
                        styles.cardValue,
                        { color: isArmed ? C.green : C.orange },
                      ]}
                    >
                      {isArmed ? "Armed" : "Disarmed"}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.cardLabel}>CONNECTION</Text>
                    <Text style={[styles.cardValue, { color: C.orange }]}>
                      Device offline
                    </Text>
                  </View>
                  <Text style={styles.sourceLabel}>SIMULATED</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Register a vehicle</Text>
          <Text style={styles.sectionSubtitle}>Add to your garage</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>MAKE</Text>
          <TextInput
            value={make}
            onChangeText={setMake}
            placeholder="e.g. Honda"
            placeholderTextColor="#626875"
            style={styles.input}
            maxLength={40}
            autoCapitalize="words"
          />

          <Text style={styles.fieldLabel}>MODEL</Text>
          <TextInput
            value={model}
            onChangeText={setModel}
            placeholder="e.g. CR-V"
            placeholderTextColor="#626875"
            style={styles.input}
            maxLength={40}
            autoCapitalize="words"
          />

          <Text style={styles.fieldLabel}>REGISTRATION</Text>
          <TextInput
            value={registration}
            onChangeText={(value) => setRegistration(value.toUpperCase())}
            placeholder="e.g. RE22 WUX"
            placeholderTextColor="#626875"
            style={styles.input}
            maxLength={12}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <Text style={styles.fieldLabel}>YEAR (OPTIONAL)</Text>
          <TextInput
            value={year}
            onChangeText={setYear}
            placeholder="e.g. 2022"
            placeholderTextColor="#626875"
            style={styles.input}
            maxLength={4}
            keyboardType="number-pad"
          />

          {error ? (
            <View style={styles.messageError}>
              <Text style={styles.messageErrorText}>{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={styles.messageSuccess}>
              <Text style={styles.messageSuccessText}>{success}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleAddVehicle}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
          >
            <Text style={styles.addButtonText}>+ REGISTER VEHICLE</Text>
          </Pressable>

          <Text style={styles.formNotice}>
            Vehicles are currently stored in AsyncStorage.
          </Text>
        </View>

        <Text style={styles.footer}>UVSS CONTROL · VEHICLE MANAGEMENT</Text>
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
    marginBottom: 23,
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
  summaryCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 27,
  },
  summaryLabel: {
    color: C.muted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.3,
  },
  summaryValue: {
    color: C.text,
    fontSize: 27,
    fontWeight: "900",
    marginTop: 6,
  },
  summaryIcon: {
    width: 49,
    height: 49,
    borderRadius: 14,
    backgroundColor: C.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryIconText: {
    fontSize: 25,
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
    fontSize: 10,
  },
  vehicleList: {
    gap: 12,
    marginBottom: 27,
  },
  vehicleCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 15,
  },
  activeVehicleCard: {
    borderColor: C.red,
  },
  pressedCard: {
    opacity: 0.8,
  },
  vehicleCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  vehicleIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: C.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },
  vehicleIconText: {
    fontSize: 24,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleName: {
    color: C.text,
    fontSize: 14,
    fontWeight: "800",
  },
  vehicleRegistration: {
    color: C.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    marginTop: 4,
  },
  vehicleYear: {
    color: C.muted,
    fontSize: 9,
    marginTop: 4,
  },
  selectionArea: {
    alignItems: "center",
    justifyContent: "center",
  },
  selectedBadge: {
    backgroundColor: "#3B1B1D",
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  selectedBadgeText: {
    color: C.red,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  selectCircle: {
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: C.muted,
  },
  vehicleDivider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 14,
  },
  vehicleCardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 7,
  },
  cardLabel: {
    color: C.muted,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.9,
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 10,
    fontWeight: "700",
  },
  sourceLabel: {
    color: C.muted,
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  formCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 16,
  },
  fieldLabel: {
    color: C.muted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginBottom: 7,
    marginTop: 13,
  },
  input: {
    minHeight: 46,
    backgroundColor: C.surfaceLight,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 13,
    color: C.text,
    fontSize: 13,
  },
  messageError: {
    backgroundColor: "#351B1D",
    borderWidth: 1,
    borderColor: "#693035",
    borderRadius: 9,
    padding: 11,
    marginTop: 14,
  },
  messageErrorText: {
    color: "#FF9A9A",
    fontSize: 11,
    lineHeight: 16,
  },
  messageSuccess: {
    backgroundColor: "#153528",
    borderWidth: 1,
    borderColor: "#286044",
    borderRadius: 9,
    padding: 11,
    marginTop: 14,
  },
  messageSuccessText: {
    color: C.green,
    fontSize: 11,
    lineHeight: 16,
  },
  addButton: {
    minHeight: 47,
    backgroundColor: C.red,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 17,
  },
  addButtonPressed: {
    opacity: 0.75,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  formNotice: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 12,
  },
  footer: {
    color: "#555B66",
    textAlign: "center",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.3,
    marginTop: 25,
  },
});
