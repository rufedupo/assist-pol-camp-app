import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Defina a variável de ambiente MONGODB_URI");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("MongoDB conectado com sucesso");
      return mongoose;
    }).catch((err) => {
      console.error("Erro na conexão com o MongoDB:", err);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    console.error("Erro ao tentar conectar com o MongoDB:", error);
    throw new Error("Falha na conexão com o banco de dados");
  }
  
  return cached.conn;
}

export default dbConnect;