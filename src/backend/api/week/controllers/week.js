const { parseMultipartData, sanitizeEntity } = require('strapi-utils');
'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async create(ctx) {
        let entity;
        console.log("here ", ctx.state.user)
        console.log(ctx.request.body)
        // ctx.request.body.author = ctx.state.user.id;
        try {
            entity = await strapi.services.week.create(ctx.request.body);
        } catch (error) {
            console.log(error)
        }
            
        
        return sanitizeEntity(entity, { model: strapi.models.week });
      },

};
