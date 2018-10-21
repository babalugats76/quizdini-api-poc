const userModel = require('../models/newuser');
const Query = userModel.Query;
const Validate = userModel.Validate;

const getByUsername = async (req, res, next) => {
  try {  
    const username = req.params.username; 
    const user = await userModel.find(Query.USERNAME, { "value": username } );
    res.json(user); 
  } catch (e) { next(e); }
}

const postUser = async (req, res, next) => { 
  try {
    const {results, errors} = await userModel.validate(Validate.CREATE, req.body); 
    let user;
    if (!errors) { // Passed Validation
      const {affectedRows, insertId} = await userModel.create(results); 
      user = await userModel.find(Query.ID, { "value" : insertId });
      /** Trap UK */
    } 
    /** TODO format response */
    res.json((user ? user : errors));
  } catch (e) { next(e); }
}

module.exports = {
  getByUsername: getByUsername,
  postUser: postUser
}
