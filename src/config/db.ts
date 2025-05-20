import mongoose from "mongoose";

/**
 * Conecta a la base de datos de MongoDB.
 *
 * Esta función utiliza la biblioteca `mongoose` para conectar a una base de datos MongoDB
 * utilizando la URI especificada en la variable de entorno `MONGO_URI`.
 * En caso de que la conexión sea exitosa, se imprime un mensaje en la consola.
 * Si ocurre un error durante la conexión, se imprime el error y el proceso termina con un código de estado 1.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!, {
      // Puedes agregar opciones adicionales de configuración aquí, si es necesario.
    });
    console.log("Base de datos de MongoDB conectada");
  } catch (err) {
    console.error("Error conectando a la base de datos MongoDB: ", err);
  }
};

export default connectDB;
