'use strict';
/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#bootstrap
 */
 const _ = require("lodash");

const adminSetup = async () => {
    const DROP_ADMINS = true
    const admins = await strapi.query('user', 'admin').find({ username: 'boss' })
    // if (admins.length > 0 && DROP_ADMINS) {
    //   strapi.log.warn('Dropping Admin');
    //   const username = admins[0].username
    //   await strapi.query('user', 'admin').delete({ username })
    // }
    // const admins = await admin_orm.find({username: 'boss'})
    if ( admins.length === 0) {
        const params  = { 
            blocked: false, 
            username: 'boss', 
            password: 'bosshaharighto', 
            email: 'boss@yep.com', 
            isActive: true }
        let verifyRole = await strapi.query('role', 'admin').findOne({ code: 'strapi-super-admin' });
        if (!verifyRole) {
            verifyRole = await strapi.query('role', 'admin').create({
              name: 'Super Admin',
              code: 'strapi-super-admin',
              description: 'Super Admins can access and manage all features and settings.',
             });
        }
        params.roles = [verifyRole.id];
        params.password = await strapi.admin.services.auth.hashPassword(params.password);
        const bigdog = await strapi.query('user', 'admin').create({
          ...params,
        });
        strapi.log.info('Admin account was successfully created.');
        strapi.log.info(`Email: ${params.email}`);
        strapi.log.info(`Password: ${params.password}`);
        strapi.log.warn(`Bootstrapped Admin User: ${JSON.stringify(bigdog)}`)
      }
}

const testUserSetup = async () => {
  const params = { 
    username: 'test', 
    email: 'test@yep.com',
    password: 'yeah1234',
    confirmed: true
  }
  const testUser = await strapi.query('user', 'users-permissions').findOne({username: 'test'})
  if (!testUser) {
    const testuser = await strapi.query('user', 'users-permissions').create({...params})
  }
}

const testPermissionsSetup = async () => {
  const service = await strapi.plugins["users-permissions"].services.userspermissions;
  const plugins = await service.getPlugins("en");
  const getRole = async (type) => {
    const {id} = _.find(roles, x => x.type === type);
    return service.getRole(id, plugins);
  }
  const roles = await service.getRoles();

  const setPermission = (role, type, controller, action, enabled) => {
    try {
      role.permissions[type].controllers[controller][action].enabled = enabled;
    }
    catch (e) {
      console.error(`Couldn't set permission ${role.name} ${type}:${controller}:${action}:${enabled}`);
    }
  }

  const role = await getRole("authenticated");
  setPermission(role, "application", "activity", "count", true);
  setPermission(role, "application", "activity", "find", true);
  setPermission(role, "application", "activity", "findone", true);
  setPermission(role, "application", "activity", "create", true);
  setPermission(role, "application", "activity", "delete", true);
  setPermission(role, "application", "activity", "update", true);
  setPermission(role, "application", "activity-set", "count", true);
  setPermission(role, "application", "activity-set", "find", true);
  setPermission(role, "application", "activity-set", "findone", true);
  setPermission(role, "application", "activity-set", "create", true);
  setPermission(role, "application", "activity-set", "delete", true);
  setPermission(role, "application", "activity-set", "update", true);
  setPermission(role, "application", "day", "count", true);
  setPermission(role, "application", "day", "find", true);
  setPermission(role, "application", "day", "findone", true);
  setPermission(role, "application", "day", "create", true);
  setPermission(role, "application", "day", "delete", true);
  setPermission(role, "application", "day", "update", true);
  setPermission(role, "application", "week", "count", true);
  setPermission(role, "application", "week", "find", true);
  setPermission(role, "application", "week", "findone", true);
  setPermission(role, "application", "week", "create", true);
  setPermission(role, "application", "week", "delete", true);
  setPermission(role, "application", "week", "update", true);

  setPermission(role, "users-permissions", "user", "find", true);
  await service.updateRole(role.id, role);

}

module.exports = async () => {
    // create admin users  - TODO: replace with ENV vars
    console.log("here")
    strapi.log.info("Creating admin user")
    await adminSetup()
    
    // create permissions
    strapi.log.info("Creating public permissions")
    await testPermissionsSetup()

    // create test user
    strapi.log.info("Creating test user")
    await testUserSetup()
};
