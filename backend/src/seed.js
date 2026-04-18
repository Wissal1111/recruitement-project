const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { Study } = require('./models');

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("🚀 Début du test de création (Schéma Imbriqué)...");

    // Suppression des anciennes données pour repartir à zéro
    await Study.deleteMany({});

    // Création d'une étude complète avec phases, formulaires et questions
    const newStudy = await Study.create({
      creatorId: "user_123",
      title: "Enquête Satisfaction IA 2024",
      description: "Une étude complète sur l'utilisation des LLMs.",
      studyCategory: "SURVEY",
      totalBudget: 1500.00,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      phases: [
        {
          phaseOrder: 1,
          title: "Phase de Sélection",
          description: "Vérification de l'éligibilité",
          phaseType: "SCREENING",
          rewardAmount: 2.50,
          maxParticipants: 500,
          status: "ACTIVE",
          form: {
            title: "Questionnaire de Screening",
            description: "Répondez à ces quelques questions.",
            questions: [
              {
                text: "Utilisez-vous l'IA au quotidien ?",
                questionType: "SINGLE_CHOICE",
                isRequired: true,
                orderIndex: 1,
                options: [
                  { label: "Oui", value: "yes", orderIndex: 1 },
                  { label: "Non", value: "no", orderIndex: 2 }
                ]
              },
              {
                text: "Quel est votre métier ?",
                questionType: "TEXT",
                isRequired: true,
                orderIndex: 2
              }
            ]
          }
        }
      ]
    });

    console.log("✅ Étude complète créée avec succès !");
    console.log("ID de l'étude :", newStudy.studyId);
    console.log("Nombre de phases :", newStudy.phases.length);
    console.log("Nombre de questions dans la phase 1 :", newStudy.phases[0].form.questions.length);

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors du test :", error);
    process.exit(1);
  }
};

seedDatabase();
