const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function initializeDatabase() {
  try {
    // Test the connection
    await prisma.$connect();
    console.log("Successfully connected to MongoDB Atlas");

    // Create a test reading to ensure everything works
    const testReading = await prisma.pHReading.create({
      data: {
        value: 6.5,
        timestamp: new Date(),
        alertLevel: "NORMAL",
        metadata: {
          deviceId: "test_device",
          location: "test_location",
          temperature: 25,
          humidity: 60,
        },
      },
    });
    console.log("Test reading created successfully:", {
      id: testReading.id,
      value: testReading.value,
      timestamp: testReading.timestamp,
      alertLevel: testReading.alertLevel,
    });

    // Verify we can read the data
    const readings = await prisma.pHReading.findMany({
      orderBy: {
        timestamp: "desc",
      },
      take: 1,
    });
    console.log("Successfully queried test reading:", {
      id: readings[0].id,
      value: readings[0].value,
      timestamp: readings[0].timestamp,
      alertLevel: readings[0].alertLevel,
    });

    // Clean up test data
    await prisma.pHReading.delete({
      where: { id: testReading.id },
    });
    console.log("Test reading cleaned up successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    console.log("Database initialization completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Database initialization failed:", error);
    process.exit(1);
  });
