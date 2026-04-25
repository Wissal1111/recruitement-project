// prisma/seed.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.interest.createMany({
    data: [
      { name: "Technology", description: "AI, SaaS, infrastructure" },
      { name: "Health", description: "Wellness and biotech" },
      { name: "Education", description: "Learning & research" },
      { name: "Business", description: "Markets & strategy" },
      { name: "Gaming", description: "Entertainment & esports" },
      { name: "Music", description: "Audio & culture" },
      { name: "Fitness", description: "Sport & wellness" },
      { name: "Food", description: "Cooking & cuisine" },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Interests seeded");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

prisma.interest.findMany().then(r => console.log("DB interests:", r));