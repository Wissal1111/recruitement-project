const prisma = require('./config/prisma');

async function cleanup() {
  try {
    console.log('🧹 Cleaning up old user...');
    
    // Find all users with this email
    const user = await prisma.user.findUnique({
      where: { email: 'test@test.com' }
    });

    if (user) {
      console.log(`Found user: ${user.userId}`);
      
      // Delete in correct order to avoid foreign key errors
      await prisma.authToken.deleteMany({ where: { userId: user.userId } });
      console.log('✅ Deleted auth tokens');
      
      await prisma.userRole.deleteMany({ where: { userId: user.userId } });
      console.log('✅ Deleted user roles');
      
      await prisma.userProfile.deleteMany({ where: { userId: user.userId } });
      console.log('✅ Deleted user profile');
      
      await prisma.user.delete({ where: { userId: user.userId } });
      console.log('✅ Deleted user');
      
      console.log('\n🎉 Old user completely removed from database');
    } else {
      console.log('No user found to delete');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
