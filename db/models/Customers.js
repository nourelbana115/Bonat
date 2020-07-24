const mongoose = require('mongoose');
const _ = require('lodash');
const mongoosePaginate = require('mongoose-paginate-v2');

const CustomersSchema = new mongoose.Schema({
	segments:[{
		type: mongoose.Schema.Types.ObjectId,
		required:true,
		ref: 'Segments',
		//unique:true
	}],
	merchant:{
		type: mongoose.Schema.Types.ObjectId,
		required:true,
		ref: 'Merchent'
	},
	idCustomer:{
		type: String,
		required: true,
		trim:true,
		//unique: true
	}, 
	customerData:{
       type:Object,
       required:true
	},
	updatedAt: {
		type: Date,
		required: true,
		default: Date.now
	},
	createdAt: {
		type: Date,
		required: true,
		default: Date.now
	}
});

CustomersSchema.methods.toJSON = function () {
	let Customer = this;
	let CustomerObject = Customer.toObject();
	return _.pick(CustomerObject, ['_id','merchant',
	'segments','idCustomer','customerData','updatedAt','createdAt']);
}

CustomersSchema.plugin(mongoosePaginate);

const Customer = mongoose.model('Customers', CustomersSchema);

module.exports = Customer;