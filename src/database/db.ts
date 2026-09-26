import * as SQLite from "expo-sqlite";

export const DATABASE_NAME = "cazador_sabores.db";

export const initDatabase = async (): Promise<void> => {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS registros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      calificacion INTEGER NOT NULL,
      comentarios TEXT NOT NULL,
      fotoBase64 TEXT NOT NULL,
      fecha TEXT NOT NULL
    );
  `);

  // Cerramos la conexión inicial para liberar el archivo al SQLiteProvider
  await db.closeAsync();
};