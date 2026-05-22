
const prisma = require('./config/prisma');

const interests = [
  // Technology
  { name: 'Technology', description: 'General interest in tech trends and innovations' },
  { name: 'Artificial Intelligence', description: 'Machine learning, AI tools, and automation' },
  { name: 'Cybersecurity', description: 'Online safety, hacking, and data protection' },
  { name: 'Web Development', description: 'Frontend, backend, and full-stack development' },
  { name: 'Mobile Apps', description: 'iOS and Android applications' },
  { name: 'Gaming', description: 'Video games, esports, and game development' },

  // Science & Education
  { name: 'Science', description: 'Physics, chemistry, biology, and general science' },
  { name: 'Space & Astronomy', description: 'Space exploration, planets, and the universe' },
  { name: 'Mathematics', description: 'Pure and applied mathematics' },
  { name: 'History', description: 'World history, civilizations, and historical events' },
  { name: 'Psychology', description: 'Human behavior, mental health, and neuroscience' },
  { name: 'Philosophy', description: 'Ethics, logic, and philosophical thinking' },

  // Arts & Entertainment
  { name: 'Music', description: 'Listening, playing instruments, or music production' },
  { name: 'Movies & TV', description: 'Cinema, series, and video content' },
  { name: 'Photography', description: 'Taking and editing photos' },
  { name: 'Design & Art', description: 'Graphic design, illustration, and visual arts' },
  { name: 'Writing & Literature', description: 'Books, poetry, creative writing, and blogging' },
  { name: 'Podcasts', description: 'Audio content across various topics' },

  // Lifestyle
  { name: 'Travel', description: 'Exploring new countries and cultures' },
  { name: 'Food & Cooking', description: 'Recipes, restaurants, and culinary arts' },
  { name: 'Fashion & Style', description: 'Clothing, trends, and personal style' },
  { name: 'Health & Fitness', description: 'Exercise, nutrition, and wellness' },
  { name: 'Mindfulness & Meditation', description: 'Mental well-being and spiritual practices' },
  { name: 'Parenting', description: 'Raising children and family life' },

  // Business & Finance
  { name: 'Entrepreneurship', description: 'Starting and growing businesses' },
  { name: 'Personal Finance', description: 'Budgeting, investing, and financial planning' },
  { name: 'Marketing & Branding', description: 'Digital marketing, social media strategy' },
  { name: 'Crypto & Blockchain', description: 'Cryptocurrencies and decentralized finance' },
  { name: 'Career Development', description: 'Professional growth and job opportunities' },

  // Social & Politics
  { name: 'Politics & Current Affairs', description: 'News, governance, and political discourse' },
  { name: 'Environment & Sustainability', description: 'Climate change, ecology, and green living' },
  { name: 'Social Justice', description: 'Human rights, equality, and activism' },
  { name: 'Community & Volunteering', description: 'Local engagement and nonprofit work' },

  // Sports
  { name: 'Sports', description: 'General sports interest' },
  { name: 'Football (Soccer)', description: 'The world\'s most popular sport' },
  { name: 'Basketball', description: 'NBA, local leagues, and street ball' },
  { name: 'Esports', description: 'Competitive online gaming' },
  { name: 'Outdoor Activities', description: 'Hiking, camping, and adventure sports' },
];

async function main() {
  console.log('🌱 Seeding interests...');

  let created = 0;
  let skipped = 0;

  for (const interest of interests) {
    const existing = await prisma.interest.findFirst({
      where: { name: interest.name },
    });

    if (!existing) {
      await prisma.interest.create({ data: interest });
      console.log(`  ✅ Created: ${interest.name}`);
      created++;
    } else {
      console.log(`  ⏭️  Skipped (already exists): ${interest.name}`);
      skipped++;
    }
  }

  console.log(`\n✔ Done! ${created} created, ${skipped} skipped.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });