import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  // Upsert the test repository
  const repo = await prisma.repository.upsert({
    where: { githubId: 999999999 },
    update: {},
    create: {
      githubId: 999999999,
      name: 'Leoenglish',
      fullName: 'Leoenglish/starter-vip',
      url: 'https://github.com/Leoenglish/starter-vip',
      description: '16 foundational English units from zero — greetings, family, food, daily life & more....',
      primaryWebsiteUrl: 'https://leo-english-starter-16units.vercel.app/',
    },
  })

  // Upsert the website preview
  await prisma.websitePreview.upsert({
    where: { repositoryId: repo.id },
    update: {},
    create: {
      repositoryId: repo.id,
      url: 'https://leo-english-starter-16units.vercel.app/',
      title: 'STARTER VIP LEOENGLISH | Speak With Confidence',
      description: '16 foundational English units from zero — greetings, family, food, daily life & more....',
      domain: 'leo-english-starter-16units.vercel.app',
      hosting: 'Vercel',
      status: 'LIVE',
      image: 'https://via.placeholder.com/1280x720/e2e8f0/64748b?text=Leo+English+Starter',
      favicon: 'https://leo-english-starter-16units.vercel.app/favicon.ico',
      httpStatus: 200,
    },
  })

  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
