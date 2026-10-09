import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../src/config/env.js';
import { UserModel } from '../src/modules/auth/user.model.js';
import { StartupModel } from '../src/modules/startups/startup.model.js';
import { InterestModel } from '../src/modules/interests/interest.model.js';
import { BookmarkModel } from '../src/modules/bookmarks/bookmark.model.js';
import { generateSlug } from '../src/utils/slug.js';

async function seed() {
  console.log('Connecting to database...');
  await mongoose.connect(config.mongodbUri);

  console.log('Cleaning existing database collections...');
  await Promise.all([
    UserModel.deleteMany({}),
    StartupModel.deleteMany({}),
    InterestModel.deleteMany({}),
    BookmarkModel.deleteMany({}),
  ]);

  console.log('Synchronizing indexes...');
  await Promise.all([
    UserModel.init(),
    StartupModel.init(),
    InterestModel.init(),
    BookmarkModel.init(),
  ]);

  console.log('Creating demo users...');
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Primary demo founder
  const founder1 = await UserModel.create({
    name: 'Asha Shah',
    email: 'founder@ventureflow.demo',
    passwordHash,
    role: 'FOUNDER',
  });

  // 2. Secondary demo founder
  const founder2 = await UserModel.create({
    name: 'Rohan Varma',
    email: 'rohan@ventureflow.demo',
    passwordHash,
    role: 'FOUNDER',
  });

  // 3. Primary demo investor
  const investor1 = await UserModel.create({
    name: 'Vikram Malhotra',
    email: 'investor@ventureflow.demo',
    passwordHash,
    role: 'INVESTOR',
  });

  // 4. Secondary demo investor
  const investor2 = await UserModel.create({
    name: 'Priya Nair',
    email: 'priya@ventureflow.demo',
    passwordHash,
    role: 'INVESTOR',
  });

  console.log('Creating demo startups...');
  const startupsData = [
    {
      founderId: founder1._id,
      name: 'Northstar Health',
      tagline: 'Intelligent clinical triage and digital patient intake workflows',
      description:
        'Northstar Health modernizes the front door of tier-2 and tier-3 outpatient clinics. Our clinical intake engine structures chief complaints into EHR-ready summaries, reducing physician triage administrative time by 42% while improving patient routing accuracy.',
      industry: 'HEALTHTECH',
      stage: 'MVP',
      targetAmount: 2500000, // ₹25,00,000 (25 Lakhs)
      location: 'Bengaluru, Karnataka',
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
    {
      founderId: founder1._id,
      name: 'LedgerStack AI',
      tagline: 'Automated treasury reconciliation for high-velocity cross-border commerce',
      description:
        'LedgerStack AI consolidates multi-currency payment gateway settlements, banking feeds, and ERP entries in real-time. By utilizing rule-based reconciliation heuristics with high-precision discrepancy resolution, finance teams close books in hours instead of weeks.',
      industry: 'FINTECH',
      stage: 'EARLY_REVENUE',
      targetAmount: 5000000, // ₹50,00,000 (50 Lakhs)
      location: 'Mumbai, Maharashtra',
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      founderId: founder1._id,
      name: 'Kavach Sentinel',
      tagline: 'Zero-trust privilege access verification for cloud infrastructure',
      description:
        'Kavach Sentinel gives engineering and security leads unified, ephemeral credentials and contextual session recordings across multi-cloud Kubernetes clusters. We eliminate standing privileges and reduce incident dwell time significantly.',
      industry: 'SAAS',
      stage: 'IDEA',
      targetAmount: 1500000, // ₹15,00,000 (15 Lakhs)
      location: 'Pune, Maharashtra',
      status: 'DRAFT',
    },
    {
      founderId: founder2._id,
      name: 'SkillMesh Labs',
      tagline: 'Adaptive micro-learning pathways for frontline manufacturing workforce',
      description:
        'SkillMesh Labs replaces static PDF operating procedure binders with interactive, multilingual 90-second voice-assisted task guides. Field technicians learn assembly workflows on mobile devices with verified compliance logging.',
      industry: 'EDTECH',
      stage: 'EARLY_REVENUE',
      targetAmount: 3500000, // ₹35,00,000 (35 Lakhs)
      location: 'Gurugram, Delhi NCR',
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      founderId: founder2._id,
      name: 'OmniCart Direct',
      tagline: 'Hyperlocal dark store inventory routing and micro-fulfilment platform',
      description:
        'OmniCart Direct powers D2C brands with instant distributed inventory across 200+ partner neighborhood storefronts. Smart predictive reordering minimizes stockouts while guaranteeing 4-hour local customer deliveries.',
      industry: 'ECOMMERCE',
      stage: 'GROWTH',
      targetAmount: 10000000, // ₹1,00,00,000 (1 Crore)
      location: 'Hyderabad, Telangana',
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      founderId: founder2._id,
      name: 'AgriPulse Sensors',
      tagline: 'Sub-surface soil microbiome telemetry and precision fertigation',
      description:
        'AgriPulse deploys ultra-low-power IoT soil sensors that transmit continuous nitrogen, phosphorus, and moisture gradients. Our agronomy dashboard provides hyper-localized irrigation advisories directly to farmer cooperatives.',
      industry: 'OTHER',
      stage: 'MVP',
      targetAmount: 4000000, // ₹40,00,000 (40 Lakhs)
      location: 'Ahmedabad, Gujarat',
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ];

  const createdStartups = [];
  for (const item of startupsData) {
    const slug = generateSlug(item.name);
    const startup = await StartupModel.create({
      ...item,
      slug,
    });
    createdStartups.push(startup);
  }

  console.log('Seeding demo interests and bookmarks...');
  // Investor1 expresses interest in Northstar Health (PENDING)
  await InterestModel.create({
    startupId: createdStartups[0]._id,
    investorId: investor1._id,
    message: 'We actively invest in digital health infrastructure across South Asia. We would love to evaluate your clinical pilot metrics and speak with the founding team.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  });

  // Investor2 expresses interest in Northstar Health (ACCEPTED)
  await InterestModel.create({
    startupId: createdStartups[0]._id,
    investorId: investor2._id,
    message: 'Strong fit for our early-stage healthtech fund. Impressed with the clinic intake efficiency gains outlined in your deck.',
    status: 'ACCEPTED',
    respondedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  });

  // Investor1 expresses interest in LedgerStack AI (ACCEPTED)
  await InterestModel.create({
    startupId: createdStartups[1]._id,
    investorId: investor1._id,
    message: 'We lead pre-seed fintech syndicates. Treasury reconciliation is a known enterprise bottleneck. Let us schedule a product walkthrough.',
    status: 'ACCEPTED',
    respondedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  });

  // Investor1 bookmarks LedgerStack AI & OmniCart Direct
  await BookmarkModel.create({
    startupId: createdStartups[1]._id,
    investorId: investor1._id,
  });

  await BookmarkModel.create({
    startupId: createdStartups[4]._id,
    investorId: investor1._id,
  });

  console.log('----------------------------------------------------');
  console.log('✅ Deterministic VentureFlow Database Seed Completed!');
  console.log('Demo Credentials:');
  console.log('  Founder:  email: founder@ventureflow.demo | pass: Password123!');
  console.log('  Investor: email: investor@ventureflow.demo | pass: Password123!');
  console.log('  Founder2: email: rohan@ventureflow.demo    | pass: Password123!');
  console.log('  Investor2: email: priya@ventureflow.demo   | pass: Password123!');
  console.log('----------------------------------------------------');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
