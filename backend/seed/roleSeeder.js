const logger = require('../utils/logger');
const { seedDefaultRoles } = require('../services/role.service');

const seedRoles = async () => {
  const created = await seedDefaultRoles();
  if (created === 0) {
    logger.info('Default roles already exist, skipping role seeding');
  }
};

module.exports = seedRoles;
