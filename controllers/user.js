const userModel = require('../models/newuser');
const Query = userModel.Query;

const getByUsername = async (req, res, next) => {
   const username = req.params.username; 
   try {  
      const user = await userModel.find(Query.USERNAME, { "value": username } );
      res.json(user); 
   } catch (err) {
      next(err);  
   }
}

module.exports = {
   getByUsername: getByUsername
}
