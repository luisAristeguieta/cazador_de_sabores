import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Ionicons } from "@expo/vector-icons";

type Registro = {
  id: number;
  titulo: string;
  calificacion: number;
  comentarios: string;
  fotoBase64: string;
  fecha: string;
};

export default function ListaScreen({ navigation }: any) {
  const db = useSQLiteContext();
  const [registros, setRegistros] = useState<Registro[]>([]);

  const cargarRegistros = async () => {
    try {
      const resultado = await db.getAllAsync<Registro>(
        "SELECT * FROM registros ORDER BY id DESC"
      );
      setRegistros(resultado);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      cargarRegistros();
    });
    return unsubscribe;
  }, [navigation]);

  const handleDelete = (id: number, titulo: string) => {
    Alert.alert(
      "Confirmar eliminación",
      `¿Deseas eliminar "${titulo}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await db.runAsync("DELETE FROM registros WHERE id = ?", [id]);
              cargarRegistros();
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el registro");
            }
          },
        },
      ]
    );
  };

  const handleEdit = (item: Registro) => {
    navigation.navigate("Formulario", {
      id: item.id,
      tituloActual: item.titulo,
      calificacionActual: item.calificacion,
      comentariosActuales: item.comentarios,
      fotoBase64Actual: item.fotoBase64,
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={registros}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listPadding}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="fast-food-outline" size={64} color="#C4C4C4" />
            <Text style={styles.emptyTitle}>Sin registros aún</Text>
            <Text style={styles.emptySubtitle}>
              Toca el botón + para guardar tu primer plato o reseña.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{ uri: `data:image/jpeg;base64,${item.fotoBase64}` }}
              style={styles.foodImage}
            />

            <View style={styles.infoWrapper}>
              <Text style={styles.plateTitle} numberOfLines={1}>
                {item.titulo}
              </Text>
              <View style={styles.badgeRating}>
                <Ionicons name="star" size={14} color="#FFA000" />
                <Text style={styles.badgeText}>{item.calificacion} / 5</Text>
              </View>
              <Text style={styles.commentText} numberOfLines={2}>
                {item.comentarios}
              </Text>
              <Text style={styles.dateText}>{item.fecha}</Text>
            </View>

            <View style={styles.actionsColumn}>
              <TouchableOpacity
                style={[styles.actionIconBtn, styles.editIconBtn]}
                onPress={() => handleEdit(item)}
              >
                <Ionicons name="pencil-outline" size={18} color="#FF6B35" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionIconBtn, styles.deleteIconBtn]}
                onPress={() => handleDelete(item.id, item.titulo)}
              >
                <Ionicons name="trash-outline" size={18} color="#D32F2F" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("Formulario")}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  listPadding: {
    padding: 16,
    paddingBottom: 90,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  foodImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#ECECEC",
  },
  infoWrapper: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  plateTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2B2D42",
  },
  badgeRating: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  badgeText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: "700",
    color: "#FFA000",
  },
  commentText: {
    marginTop: 4,
    fontSize: 13,
    color: "#6C757D",
    lineHeight: 18,
  },
  dateText: {
    marginTop: 4,
    fontSize: 11,
    color: "#ADB5BD",
  },
  actionsColumn: {
    justifyContent: "space-between",
    gap: 8,
  },
  actionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  editIconBtn: {
    backgroundColor: "#FFF0EB",
  },
  deleteIconBtn: {
    backgroundColor: "#FFEBEE",
  },
  emptyBox: {
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#495057",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#868E96",
    textAlign: "center",
    marginTop: 6,
  },
  floatingButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
});