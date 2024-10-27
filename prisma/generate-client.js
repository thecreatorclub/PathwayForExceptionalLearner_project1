require('dotenv').config({path:__dirname+'/./../../.env'})
const { execSync } = require('child_process');

try {
  execSync('prisma generate', { stdio: 'inherit' });
} catch (error) {
  console.error('Error generating Prisma client:', error);
  process.exit(1);
}
