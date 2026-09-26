import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { SQLiteProvider } from "expo-sqlite";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { initDatabase, DATABASE_NAME } from "./src/database/db";

import ListaScreen from "./src/screens/ListaScreen";
import FormularioScreen from "./src/screens/FormularioScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [dbLista, setDbLista] = useState(false);

  useEffect(() => {
    const preparaDb = async () => {
      try {
        await initDatabase();
        setDbLista(true);
      } catch (error) {
        console.error("Error al inicializar la base de datos:", error);
      }
    };
    preparaDb();
  }, []);

  if (!dbLista) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Iniciando Cazador de Sabores...</Text>
      </View>
    );
  }

  return (
    <SQLiteProvider databaseName={DATABASE_NAME}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: "#FF6B35" },
            headerTintColor: "#FFFFFF",
            headerTitleStyle: { fontWeight: "700" },
          }}
        >
          <Stack.Screen
            name="Lista"
            component={ListaScreen}
            options={{ title: "Cazador de Sabores" }}
          />
          <Stack.Screen
            name="Formulario"
            component={FormularioScreen}
            options={{ title: "Registro de Sabor" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFF8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#5C3D2E",
    fontWeight: "600",
  },
});