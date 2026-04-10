const bcrypt = require('bcryptjs');
const prisma = require('./config/prisma');

async function testAuth() {
  try {
    console.log('🧪 Testing Auth Flow...\n');

    // Step 1: Clean up any existing test user
    const existingUser = await prisma.user.findUnique({
      where: { email: 'sarra@test.com' }
    });
    
    if (existingUser) {
      console.log('🗑️  Cleaning up existing user...');
      await prisma.authToken.deleteMany({ where: { userId: existingUser.userId } });
      await prisma.userRole.deleteMany({ where: { userId: existingUser.userId } });
      await prisma.userProfile.deleteMany({ where: { userId: existingUser.userId } });
      await prisma.user.delete({ where: { userId: existingUser.userId } });
    }

    // Step 2: Register new user
    console.log('📝 Registering user: sarra@test.com with password: sarra123');
    const password = 'sarra123';
    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        firstname: 'Sarra',
        lastname: 'Test',
        email: 'sarra@test.com',
        passwordHash,
        isActive: true,
        profile: { create: {} }
      }
    });
    console.log('✅ User registered:', { userId: newUser.userId, email: newUser.email });

    // Step 3: Assign role
    let roleRecord = await prisma.role.findUnique({ where: { name: 'PARTICIPANT' } });
    if (!roleRecord) {
      roleRecord = await prisma.role.create({ data: { name: 'PARTICIPANT' } });
    }
    await prisma.userRole.create({ 
      data: { userId: newUser.userId, roleId: roleRecord.roleId } 
    });
    console.log('✅ Role assigned: PARTICIPANT\n');

    // Step 4: Test login logic (simulating the login controller)
    console.log('🔐 Testing login...');
    const loginUser = await prisma.user.findUnique({ where: { email: 'sarra@test.com' } });
    
    if (!loginUser) {
      console.log('❌ User not found');
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, loginUser.passwordHash);
    console.log(`Password match: ${isPasswordValid ? '✅ YES' : '❌ NO'}`);

    if (isPasswordValid) {
      await prisma.user.update({
        where: { userId: loginUser.userId },
        data: { failedLoginAttempts: 0, accountLocked: false, lastLogin: new Date() }
      });
      console.log('✅ Login successful!\n');
      console.log('📊 User after login:');
      const updatedUser = await prisma.user.findUnique({ where: { userId: loginUser.userId } });
      console.log({
        userId: updatedUser.userId,
        email: updatedUser.email,
        firstname: updatedUser.firstname,
        isActive: updatedUser.isActive,
        lastLogin: updatedUser.lastLogin,
        failedLoginAttempts: updatedUser.failedLoginAttempts
      });
    } else {
      console.log('❌ Login failed: Invalid password');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
