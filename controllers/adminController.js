//models
const schemas = require('../models/schemas');
const Admin = schemas.Admin;

let adminController = {
    sysDefaults: async(req,res) =>{
        let admin = await Admin.findOne({name:"ROOT"});
        res.end(JSON.stringify(admin.sysDefaults));
    }
};

module.exports = adminController;