import prisma from './src/lib/prisma';

async function test() {
  try {
    const admin = await prisma.user.findFirst();
    console.log("DB connected, users:", admin ? 'found' : 'none');
  } catch (e) {
    console.error("DB error:", e);
  }
}

test();
