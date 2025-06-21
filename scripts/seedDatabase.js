import { MongoClient } from "mongodb";
import { faker } from "@faker-js/faker";

const uri = "mongodb://localhost:27017"; // Ajusta según tu entorno
const dbName = "brailleApp";

const client = new MongoClient(uri);

async function seedDatabase() {
  try {
    await client.connect();
    const db = client.db(dbName);

    const usersCollection = db.collection("users");
    const translationsCollection = db.collection("translations");
    const ecoKeyboardsCollection = db.collection("ecoKeyboards");
    const aiInteractionsCollection = db.collection("aiInteractions");

    const bulkUsers = [];
    const bulkTranslations = [];
    const bulkEcoKeyboards = [];
    const bulkAiInteractions = [];

    for (let i = 0; i < 3000000; i++) {
      // Datos de Users
      bulkUsers.push({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: faker.helpers.arrayElement(["user", "admin"]),
        avatarUrl: faker.image.avatar(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Datos de Translations
      bulkTranslations.push({
        userId: faker.string.uuid(),
        inputText: faker.lorem.sentence(),
        outputText: faker.lorem.sentence(),
        direction: faker.helpers.arrayElement(["tobraille", "frombraille"]),
        timestamp: new Date(),
      });

      // Datos de EcoKeyboards
      bulkEcoKeyboards.push({
        userId: faker.string.uuid(),
        brailleCode: faker.lorem.word(),
        character: faker.lorem.word(),
        actionType: faker.helpers.arrayElement(["press", "release"]),
        timestamp: new Date(),
        deviceId: faker.string.uuid(),
      });

      // Datos de AiInteractions
      bulkAiInteractions.push({
        userId: faker.string.uuid(),
        prompt: faker.lorem.sentence(),
        response: faker.lorem.sentence(),
        timestamp: new Date(),
        metadata: { source: faker.internet.url() },
      });

      // Inserción cada 10000 registros para evitar sobrecarga
      if (i % 10000 === 0) {
        await usersCollection.insertMany(bulkUsers);
        await translationsCollection.insertMany(bulkTranslations);
        await ecoKeyboardsCollection.insertMany(bulkEcoKeyboards);
        await aiInteractionsCollection.insertMany(bulkAiInteractions);

        bulkUsers.length = 0;
        bulkTranslations.length = 0;
        bulkEcoKeyboards.length = 0;
        bulkAiInteractions.length = 0;
      }
    }

    console.log("✅ Datos insertados correctamente");
  } catch (error) {
    console.error("❌ Error al insertar datos:", error);
  } finally {
    await client.close();
  }
}

seedDatabase();
