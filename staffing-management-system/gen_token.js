const { createAuthTokens } = require('./src/lib/auth');
const prisma = require('./src/lib/prisma').default || require('./src/lib/prisma');

async function main() {
  // Find admin user
  const admin = await prisma.user.findUnique({ where: { email: 'admin@staffing.com' } });
  if (!admin) throw new Error("Admin not found");
  
  // Generate token
  const { accessToken } = await createAuthTokens(admin.id);
  
  console.log("Token:", accessToken);
}
main().catch(console.error);
