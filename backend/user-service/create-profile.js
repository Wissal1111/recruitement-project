// Script pour créer un profil pour un utilisateur existant
// À exécuter manuellement avec: node create-profile.js

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

console.log('🚀 Démarrage du script de création de profil...');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function createProfile() {
  try {
    console.log('🔍 Recherche d\'un utilisateur actif...');

    const user = await prisma.user.findFirst({
      where: { isActive: true },
      select: { userId: true, email: true, firstname: true, lastname: true }
    });

    if (!user) {
      console.log('❌ Aucun utilisateur actif trouvé dans la base de données');
      console.log('💡 Essayez de créer un utilisateur d\'abord avec node src/test.js');
      return;
    }

    console.log('👤 Utilisateur trouvé:', {
      email: user.email,
      name: `${user.firstname} ${user.lastname}`,
      userId: user.userId
    });

    console.log('🔍 Vérification si le profil existe déjà...');

    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId: user.userId }
    });

    if (existingProfile) {
      console.log('ℹ️  Un profil existe déjà pour cet utilisateur:');
      console.log('   - Age:', existingProfile.age);
      console.log('   - Profession:', existingProfile.profession);
      console.log('   - Pays:', existingProfile.country);
      console.log('   - Score de completion:', existingProfile.completionScore + '%');
      return;
    }

    console.log('📝 Création d\'un nouveau profil...');

    const newProfile = await prisma.userProfile.create({
      data: {
        userId: user.userId,
        age: 25,
        gender: 'FEMALE',
        dateOfBirth: new Date('1999-01-01'),
        education: 'Bachelor',
        profession: 'Software Engineer',
        country: 'France',
        city: 'Paris',
        deviceType: 'DESKTOP',
        bio: 'Développeuse passionnée par les technologies web et mobile. Expérience en React, Node.js et bases de données.',
        totalEarnings: 0,
        profileCompletedAt: new Date(),
        completionScore: 100
      }
    });

    console.log('✅ Profil créé avec succès!');
    console.log('📋 Détails du profil:');
    console.log('   - ID du profil:', newProfile.profileId);
    console.log('   - Age:', newProfile.age);
    console.log('   - Genre:', newProfile.gender);
    console.log('   - Profession:', newProfile.profession);
    console.log('   - Pays:', newProfile.country);
    console.log('   - Ville:', newProfile.city);
    console.log('   - Score de completion:', newProfile.completionScore + '%');

  } catch (error) {
    console.error('❌ Erreur lors de la création du profil:');
    console.error('   Message:', error.message);

    if (error.code) {
      console.error('   Code:', error.code);
    }

    if (error.meta) {
      console.error('   Meta:', error.meta);
    }
  } finally {
    console.log('🔌 Fermeture de la connexion à la base de données...');
    await prisma.$disconnect();
    console.log('✨ Script terminé');
  }
}

// Exécuter la fonction
createProfile();