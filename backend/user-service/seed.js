require('dotenv').config(); 


const prisma = require('./src/config/prisma');

async function main() {
  const categories = [
    'Technology', 'Health', 'Education', 'Business',
    'Gaming', 'Science', 'Travel', 'Food',
    'Artificial Intelligence', 'Cybersecurity', 'Software Engineering',
    'Mindfulness', 'Gastronomy', 'Wellness', 'Astrophysics', 'BioTech'
  ];

  console.log('🌱 Seeding database with interests...');

  for (const name of categories) {
    const existing = await prisma.interest.findFirst({
      where: { name: name }
    });

    if (!existing) {
      await prisma.interest.create({
        data: { name: name }
      });
      console.log(`➕ Added: ${name}`);
    } else {
      console.log(`⏭ Skipped: ${name} (Already exists)`);
    }
  }

  console.log('All interests seeded successfully!');
}

main()
  .catch((e) => {
    console.error(' Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });