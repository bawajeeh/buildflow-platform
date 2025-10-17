const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'admin@buildflow.com' },
    update: {
      password: '$2a$12$iyAwIQpxUAhEAUiKIdaIqe0tW9Et1vqWeJpgJZSJj/PlOw8/3I6Li', // password: admin123
    },
    create: {
      email: 'admin@buildflow.com',
      password: '$2a$12$iyAwIQpxUAhEAUiKIdaIqe0tW9Et1vqWeJpgJZSJj/PlOw8/3I6Li', // password: admin123
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  })

  // Create a subscription for the user
  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      plan: 'PRO',
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  })

  // Create a test website
  const website = await prisma.website.upsert({
    where: { subdomain: 'demo-site' },
    update: {},
    create: {
      userId: user.id,
      name: 'Demo Website',
      subdomain: 'demo-site',
      status: 'PUBLISHED',
    },
  })

  // Create website settings
  await prisma.websiteSettings.upsert({
    where: { websiteId: website.id },
    update: {},
    create: {
      websiteId: website.id,
      seoTitle: 'Demo Website - Built with BuildFlow',
      seoDescription: 'A beautiful website created with BuildFlow drag & drop builder',
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
    },
  })

  // Create a home page
  const homePage = await prisma.page.upsert({
    where: { 
      websiteId_slug: {
        websiteId: website.id,
        slug: 'home'
      }
    },
    update: {},
    create: {
      websiteId: website.id,
      name: 'Home',
      slug: 'home',
      isHome: true,
      isPublished: true,
    },
  })

  // Create some sample elements
  await prisma.element.createMany({
    data: [
      {
        pageId: homePage.id,
        type: 'HERO',
        name: 'Hero Section',
        props: JSON.stringify({
          title: 'Welcome to BuildFlow',
          subtitle: 'Create amazing websites without coding',
          buttonText: 'Get Started',
          backgroundImage: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&h=600&fit=crop'
        }),
        styles: JSON.stringify({
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          padding: '80px 20px',
          textAlign: 'center'
        }),
        order: 0,
      },
      {
        pageId: homePage.id,
        type: 'FEATURES',
        name: 'Features Section',
        props: JSON.stringify({
          title: 'Why Choose BuildFlow?',
          features: [
            { title: 'Drag & Drop', description: 'Easy to use interface' },
            { title: 'Responsive', description: 'Mobile-first design' },
            { title: 'Fast', description: 'Optimized performance' }
          ]
        }),
        styles: JSON.stringify({
          padding: '60px 20px',
          backgroundColor: '#f8fafc'
        }),
        order: 1,
      },
      {
        pageId: homePage.id,
        type: 'TEXT',
        name: 'About Text',
        props: JSON.stringify({
          content: 'BuildFlow is the most powerful drag & drop website builder. Create stunning websites in minutes without any coding knowledge.'
        }),
        styles: JSON.stringify({
          padding: '40px 20px',
          fontSize: '18px',
          lineHeight: '1.6',
          textAlign: 'center'
        }),
        order: 2,
      },
    ],
  })

  // Create a sample product
  await prisma.product.upsert({
    where: { 
      websiteId_slug: {
        websiteId: website.id,
        slug: 'premium-template'
      }
    },
    update: {},
    create: {
      websiteId: website.id,
      name: 'Premium Website Template',
      description: 'A beautiful, responsive website template',
      slug: 'premium-template',
      sku: 'TMP-001',
      price: 99.99,
      comparePrice: 149.99,
      quantity: 100,
      isPublished: true,
    },
  })

  // Create a sample service
  await prisma.service.create({
    data: {
      websiteId: website.id,
      name: 'Website Design Consultation',
      description: 'One-on-one consultation for your website design',
      type: 'APPOINTMENT',
      duration: 60,
      price: 150.00,
      capacity: 1,
      isPublished: true,
    },
  })

  // Create sample analytics data
  await prisma.analytics.create({
    data: {
      websiteId: website.id,
      date: new Date(),
      visitors: 1250,
      pageViews: 3200,
      sessions: 1100,
      bounceRate: 45.2,
      avgSessionDuration: 180,
      conversions: 25,
      revenue: 1250.00,
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log(`👤 User created: ${user.email}`)
  console.log(`🌐 Website created: ${website.name} (${website.subdomain}.buildflow.com)`)
  console.log(`📄 Page created: ${homePage.name}`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
