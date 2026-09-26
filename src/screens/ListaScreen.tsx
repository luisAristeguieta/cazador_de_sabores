import { View, Text, TouchableOpacity, Image, FlatList } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useState, useEffect } from "react";

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
        const resultado = await db.getAllAsync<Registro>("SELECT * FROM registros ORDER BY id DESC");
        setRegistros(resultado);
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            cargarRegistros();
        });
        return unsubscribe;
    }, [navigation]);

    const borrarRegistro = async (id: number) => {
        await db.runAsync("DELETE FROM registros WHERE id = ?", [id]);
        cargarRegistros();
    };

    return (
        <View>
            <FlatList
                data={registros}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={<Text>Aún no tienes sabores registrados</Text>}
                renderItem={({ item }) => (
                    <View>
                        <Image
                            source={{ uri: `data:image/jpeg;base64,${item.fotoBase64}` }}
                            style={{
                                width: 60,
                                height: 60,
                                borderRadius: 30,
                                marginRight: 15,
                            }}
                        />
                        <View>
                            <Text>{item.titulo}</Text>
                            <Text>⭐ {item.calificacion} / 5</Text>
                            <Text>{item.comentarios}</Text>
                            <Text>{item.fecha}</Text>
                        </View>

                        <TouchableOpacity
                            onPress={() =>
                                navigation.navigate("Formulario", {
                                    id: item.id,
                                    tituloActual: item.titulo,
                                    calificacionActual: item.calificacion,
                                    comentariosActuales: item.comentarios,
                                    fotoBase64Actual: item.fotoBase64,
                                })
                            }
                        >
                            <Text>✏️</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => borrarRegistro(item.id)}>
                            <Text>🗑️</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />

            <TouchableOpacity onPress={() => navigation.navigate("Formulario")}>
                <Text>➕</Text>
            </TouchableOpacity>
        </View>
    );
}