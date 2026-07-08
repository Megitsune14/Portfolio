import 'dotenv/config';
import { connectMongo, disconnectMongo } from '../shared/db/mongodb.js';
import { seedPortfolioData } from '../modules/portfolio/portfolio.seed.js';

async function main() {
  await connectMongo();
  const result = await seedPortfolioData();
  console.log(`Portfolio seed OK - ${result.projects} projets, ${result.social} réseaux`);
  await disconnectMongo();
}

main().catch((error) => {
  console.error('Portfolio seed failed:', error);
  process.exit(1);
});
