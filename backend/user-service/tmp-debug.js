require('dotenv').config();
const prisma = require('./src/config/prisma');
(async () => {
  try {
    const user = await prisma.user.findFirst({ select: { userId: true, email: true }, where: { isActive: true } });
    console.log('user:', user);
    if (user) {
      const profile = await prisma.userProfile.findUnique({ where: { userId: user.userId } });
      console.log('profile:', profile);
    }
  } catch (e) {
    console.error('error', e);
  } finally {
    await prisma.$disconnect();
  }
})();