let {Merchant} = require('./../db/models/merchant');

let authenticate = (req, res, next) => {
	let token = req.header('x-auth');
	Merchant.findByToken(token).then((merchant) => {
		if(!merchant){
			return Promise.reject();
		}
		req.merchant = merchant;
		req.token = token;
		next();
	}).catch((e) => {
		res.status(401).send();
	});
};

module.exports = {authenticate};

