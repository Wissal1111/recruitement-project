require('dotenv').config();

const prisma = require('./src/config/prisma');

async function main() {
  const categories = [
    { name: 'Technology', description: 'AI, SaaS, infrastructure' },
    { name: 'Health',     description: 'Wellness and biotech' },
    { name: 'Education',  description: 'Learning & research' },
    { name: 'Business',   description: 'Markets & strategy' },
    { name: 'Gaming',     description: 'Entertainment & esports' },
    { name: 'Music',      description: 'Audio & culture' },
    { name: 'Fitness',    description: 'Sport & wellness' },
    { name: 'Food',       description: 'Cooking & cuisine' },
    { name: 'Science',    description: 'Physics, bio & space' },
    { name: 'Design',     description: 'UI/UX & visual arts' },
    { name: 'Finance',    description: 'Investing & crypto' },
    { name: 'Nature',     description: 'Ecology & outdoors' },
    { name: 'Travel',     description: 'Destinations & culture' },
    { name: 'Film & TV',  description: 'Cinema & streaming' },
    { name: 'Fashion',    description: 'Style & trends' },
    { name: 'Books',      description: 'Literature & writing' },
  ];

  console.log('🌱 Seeding database with interests...');

  for (const { name, description } of categories) {
    const existing = await prisma.interest.findFirst({ where: { name } });

    if (!existing) {
      await prisma.interest.create({ data: { name, description } });
      console.log(`➕ Added: ${name}`);
    } else {
      await prisma.interest.update({
    where: { interestId: existing.interestId },
    data: { description },
});
      console.log(`✏️ Updated: ${name}`);
    }
  }

  console.log('✅ All interests seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });