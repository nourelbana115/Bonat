const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

const NotificationSchema = new mongoose.Schema({
  idMerchant: {
		type: String,
		required: true,
		minlength: 2,
		trim: true
  },
  message: {
    type: String,
    required: true,
    minlength: 2
  },
  read: {
    type: Boolean, default: false
  },
  type: {
    type: String,
    minlength: 2,
    required: true
  },
  date: {
    type: Date
  }
});

NotificationSchema.methods.toJSON = function () {
	let Notification = this;
	let NotificationObject = Notification.toObject();
	return _.pick(Notification, ['_id', 'idMerchant', 'message', 'read', 'date', 'type']);
}

let Notification = mongoose.model('Notification', NotificationSchema);

module.exports = { Notification }
