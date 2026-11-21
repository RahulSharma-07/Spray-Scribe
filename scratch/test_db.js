const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.count()
  .then(c => { console.log('Connected! Users:', c); return p.$disconnect(); })
  .catch(e => { console.error('FAILED:', e.message); return p.$disconnect(); });
