const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const { beforeAll, afterEach, afterAll } = require("@jest/globals");

let mongod;

// Configuration avant tous les tests
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Nettoyer les collections après chaque test
afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Fermer la connexion après tous les tests
afterAll(async () => {
  await mongoose.connection.close();
  await mongod.stop();
});

// Supprimer les avertissements de dépréciation de Mongoose
mongoose.set("strictQuery", true);
