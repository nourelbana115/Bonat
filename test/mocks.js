const loyaltyProgramController = require('../controllers/loyaltyProgramsController')
module.exports = {
mockAddingLoyaltyProgoram:(req,res) =>{
    loyaltyProgramController.addLoyaltyProgram(req,res)
}

}