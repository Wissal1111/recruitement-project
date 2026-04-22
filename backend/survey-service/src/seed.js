const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { Study } = require('./models');

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Seeding study data...');

    await Study.deleteMany({});

    const newStudy = await Study.create({
      creatorId: 'user_123',
      title: 'Enquete Satisfaction IA 2024',
      description: 'Une etude complete sur l utilisation des LLMs.',
      studyCategory: 'SURVEY',
      totalBudget: 1500.00,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      phases: [
        {
          phaseOrder: 1,
          title: 'Phase de Selection',
          description: 'Verification de l eligibilite',
          phaseType: 'SCREENING',
          rewardAmount: 2.50,
          maxParticipants: 500,
          status: 'ACTIVE',
          questions: [
            {
              text: 'Utilisez-vous l IA au quotidien ?',
              questionType: 'SINGLE_CHOICE',
              isRequired: true,
              orderIndex: 1,
              options: [
                { label: 'Oui', value: 'yes', orderIndex: 1 },
                { label: 'Non', value: 'no', orderIndex: 2 }
              ]
            },
            {
              text: 'Quel est votre metier ?',
              questionType: 'TEXT',
              isRequired: true,
              orderIndex: 2
            }
          ]
        }
      ]
    });

    console.log('Study seeded successfully');
    console.log('Study ID:', newStudy.studyId);
    console.log('Phase count:', newStudy.phases.length);
    console.log('Question count in phase 1:', newStudy.phases[0].questions.length);

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
