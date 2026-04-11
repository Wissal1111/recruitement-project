const bcrypt = require('bcryptjs');
const prisma = require('./config/prisma');

async function testRoles() {
  try {
    console.log('🧪 Testing Role Management System...\n');

    // Clean up: Delete test user if exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@test.com' }
    });

    if (existingUser) {
      console.log('🗑️  Cleaning up existing test user...');
      await prisma.authToken.deleteMany({ where: { userId: existingUser.userId } });
      await prisma.userRole.deleteMany({ where: { userId: existingUser.userId } });
      await prisma.userProfile.deleteMany({ where: { userId: existingUser.userId } });
      await prisma.user.delete({ where: { userId: existingUser.userId } });
    }

    // Create admin user
    const adminPassword = 'admin123';
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    const adminUser = await prisma.user.create({
      data: {
        firstname: "Admin",
        lastname: "User",
        email: "admin@test.com",
        passwordHash,
        isActive: true
      }
    });

    // Assign ADMIN role
    const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
    if (!adminRole) {
      console.log('❌ ADMIN role not found in database');
      return;
    }

    await prisma.userRole.create({
      data: {
        userId: adminUser.userId,
        roleId: adminRole.roleId
      }
    });

    console.log('✅ Admin user created with ADMIN role');
    console.log({
      userId: adminUser.userId,
      email: adminUser.email,
      role: 'ADMIN'
    });

    // Create regular user
    const regularUser = await prisma.user.create({
      data: {
        firstname: "Regular",
        lastname: "User",
        email: "user@test.com",
        passwordHash: await bcrypt.hash('user123', 12),
        isActive: true
      }
    });

    // Assign PARTICIPANT role
    const participantRole = await prisma.role.findUnique({ where: { name: 'PARTICIPANT' } });
    if (participantRole) {
      await prisma.userRole.create({
        data: {
          userId: regularUser.userId,
          roleId: participantRole.roleId
        }
      });
      console.log('✅ Regular user created with PARTICIPANT role');
    }

    console.log('\n📋 Test Data Ready:');
    console.log('Admin User:');
    console.log('  Email: admin@test.com');
    console.log('  Password: admin123');
    console.log('  Role: ADMIN');
    console.log('\nRegular User:');
    console.log('  Email: user@test.com');
    console.log('  Password: user123');
    console.log('  Role: PARTICIPANT');

    console.log('\n🔗 API Endpoints to Test:');
    console.log('GET  /api/roles - Get all roles');
    console.log('POST /api/roles/assign - Assign role (admin only)');
    console.log('  Body: { "userId": "...", "roleName": "CREATOR" }');
    console.log('GET  /api/roles/me - Get current user roles');
    console.log('GET  /api/roles/user/:userId - Get user roles (admin only)');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testRoles();