const bcrypt = require('bcryptjs');
const prisma = require('./config/prisma');

async function main() {
  try {
    // Clean up: Delete old user if exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@test.com' }
    });

    if (existingUser) {
      console.log('🗑️  Deleting old locked user...');
      // Delete related records first
      await prisma.authToken.deleteMany({ where: { userId: existingUser.userId } });
      await prisma.userRole.deleteMany({ where: { userId: existingUser.userId } });
      await prisma.userProfile.deleteMany({ where: { userId: existingUser.userId } });
      await prisma.user.delete({ where: { userId: existingUser.userId } });
      console.log('✅ Old user deleted\n');
    }

    // Create fresh user
    const rawPassword = 'sarra123';
    const passwordHash = await bcrypt.hash(rawPassword, 12);
    
    const user = await prisma.user.create({
      data: {
        firstname: "Sarra",
        lastname: "Test",
        email: "test@test.com",
        passwordHash: passwordHash,
        isActive: true
      }
    });

    console.log('✅ Fresh user created:');
    console.log({
      userId: user.userId,
      email: user.email,
      isActive: user.isActive,
      accountLocked: user.accountLocked
    });
    console.log('\n📝 Login with Postman:');
    console.log({
      email: "test@test.com",
      password: "sarra123"
    });
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();