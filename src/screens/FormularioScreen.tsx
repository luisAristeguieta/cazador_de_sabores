import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSQLiteContext } from "expo-sqlite";

export default function FormularioScreen({ route, navigation }: any) {
  const db = useSQLiteContext();

  const idEdicion = route.params?.id;
  const tituloEdicion = route.params?.tituloActual || "";
  const califEdicion = route.params?.calificacionActual?.toString() || "";
  const comenEdicion = route.params?.comentariosActuales || "";
  const fotoEdicion = route.params?.fotoBase64Actual || null;

  const [titulo, setTitulo] = useState(tituloEdicion);
  const [calificacion, setCalificacion] = useState(califEdicion);
  const [comentarios, setComentarios] = useState(comenEdicion);
  const [fotoPreview, setFotoPreview] = useState<string | null>(fotoEdicion);

  const abrirCamara = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      return Alert.alert(
        "Permiso necesario",
        "Se requiere acceso a la cámara para capturar el plato"
      );
    }

    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.3,
    });

    if (!result.canceled && result.assets[0].base64) {
      setFotoPreview(result.assets[0].base64);
    }
  };

  const guardarRegistro = async () => {
    if (
      !titulo.trim() ||
      !calificacion.trim() ||
      !comentarios.trim() ||
      !fotoPreview
    ) {
      return Alert.alert(
        "Campos incompletos",
        "Por favor completa todos los datos e incluye una fotografía"
      );
    }

    const califNumero = parseInt(calificacion, 10);
    if (isNaN(califNumero) || califNumero < 1 || califNumero > 5) {
      return Alert.alert(
        "Calificación inválida",
        "La calificación debe ser un valor entero entre 1 y 5"
      );
    }

    const fechaActual = new Date().toLocaleDateString();

    try {
      if (idEdicion) {
        await db.runAsync(
          "UPDATE registros SET titulo = ?, calificacion = ?, comentarios = ?, fotoBase64 = ?, fecha = ? WHERE id = ?",
          [
            titulo.trim(),
            Number(califNumero),
            comentarios.trim(),
            String(fotoPreview),
            String(fechaActual),
            Number(idEdicion),
          ]
        );
        Alert.alert("Éxito", "Registro actualizado correctamente");
      } else {
        await db.runAsync(
          "INSERT INTO registros (titulo, calificacion, comentarios, fotoBase64, fecha) VALUES (?, ?, ?, ?, ?)",
          [
            titulo.trim(),
            Number(califNumero),
            comentarios.trim(),
            String(fotoPreview),
            String(fechaActual),
          ]
        );
        Alert.alert("Éxito", "Sabor guardado con éxito");
      }

      navigation.goBack();
    } catch (error) {
      console.error("Error al persistir registro:", error);
      Alert.alert("Error", "Ocurrió un problema al procesar la operación");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Nombre del plato o restaurante</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Hamburguesa Artesanal"
          placeholderTextColor="#A0A0A0"
          value={titulo}
          onChangeText={setTitulo}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Calificación (1 al 5)</Text>
        <TextInput
          style={styles.input}
          placeholder="5"
          placeholderTextColor="#A0A0A0"
          keyboardType="numeric"
          maxLength={1}
          value={calificacion}
          onChangeText={setCalificacion}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Comentarios y notas de sabor</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe la experiencia, ingredientes destacados o recomendación..."
          placeholderTextColor="#A0A0A0"
          multiline
          numberOfLines={4}
          value={comentarios}
          onChangeText={setComentarios}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Fotografía</Text>
        <TouchableOpacity style={styles.cameraButton} onPress={abrirCamara}>
          <Text style={styles.cameraButtonText}>
            {fotoPreview ? "Cambiar foto" : "Tomar foto con la cámara"}
          </Text>
        </TouchableOpacity>

        {fotoPreview && (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: `data:image/jpeg;base64,${fotoPreview}` }}
              style={styles.previewImage}
            />
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={guardarRegistro}>
        <Text style={styles.submitButtonText}>
          {idEdicion ? "Actualizar Registro" : "Guardar Registro"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    minHeight: "100%",
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2B2D42",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#212529",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  cameraButton: {
    backgroundColor: "#E9ECEF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cameraButtonText: {
    color: "#495057",
    fontWeight: "600",
    fontSize: 15,
  },
  previewContainer: {
    alignItems: "center",
    marginTop: 14,
  },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 32,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});