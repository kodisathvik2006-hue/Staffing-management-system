const { createAuthTokens } = require('./src/lib/auth');
const prisma = require('./src/lib/prisma').default || require('./src/lib/prisma');

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: 'admin@staffing.com' } });
  const { accessToken } = await createAuthTokens(admin.id);
  
  const salesperson = await prisma.salesperson.findFirst();
  if (!salesperson) return console.log("No salesperson");

  const res = await fetch(`http://localhost:3000/api/salespeople/${salesperson.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `ACCESS_COOKIE=${accessToken}`
    },
    body: JSON.stringify({
      firstName: "Test",
      lastName: "Test"
    })
  });
  
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Body:", text);
}
main().catch(console.error);
