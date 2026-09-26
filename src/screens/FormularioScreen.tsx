import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from "react-native";
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
      return Alert.alert("Error", "Permiso denegado");
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
    if (!titulo || !calificacion || !comentarios || !fotoPreview) {
      return Alert.alert("Error", "Por favor completa todos los campos y la foto");
    }

    const califNumero = parseInt(calificacion, 10);
    if (isNaN(califNumero) || califNumero < 1 || califNumero > 5) {
      return Alert.alert("Error", "La calificación debe ser un número del 1 al 5");
    }

    const fechaActual = new Date().toLocaleDateString();

    try {
      if (idEdicion) {
        await db.runAsync(
          `UPDATE registros 
           SET titulo = ?, calificacion = ?, comentarios = ?, fotoBase64 = ?, fecha = ? 
           WHERE id = ?`,
          [titulo, califNumero, comentarios, fotoPreview, fechaActual, idEdicion]
        );
        Alert.alert("Éxito", "Registro actualizado correctamente");
      } else {
        await db.runAsync(
          `INSERT INTO registros (titulo, calificacion, comentarios, fotoBase64, fecha) 
           VALUES (?, ?, ?, ?, ?)`,
          [titulo, califNumero, comentarios, fotoPreview, fechaActual]
        );
        Alert.alert("Éxito", "Sabor guardado con éxito");
      }

      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo guardar el registro");
    }
  };

  return (
    <View>
      <Text>Nombre del plato o restaurante:</Text>
      <TextInput
        placeholder="Ej: Hamburguesa Suprema"
        value={titulo}
        onChangeText={setTitulo}
      />

      <Text>Calificación (1 al 5):</Text>
      <TextInput
        placeholder="Ej: 5"
        keyboardType="numeric"
        value={calificacion}
        onChangeText={setCalificacion}
      />

      <Text>Comentarios y sabor:</Text>
      <TextInput
        placeholder="Ej: Muy buena cocción y salsa especial"
        value={comentarios}
        onChangeText={setComentarios}
      />

      <TouchableOpacity onPress={abrirCamara}>
        <Text>Tomar foto</Text>
      </TouchableOpacity>

      {fotoPreview && (
        <Image
          source={{ uri: `data:image/jpeg;base64,${fotoPreview}` }}
          style={{ width: 120, height: 120 }}
        />
      )}

      <TouchableOpacity onPress={guardarRegistro}>
        <Text>{idEdicion ? "Actualizar Registro" : "Guardar Registro"}</Text>
      </TouchableOpacity>
    </View>
  );
}