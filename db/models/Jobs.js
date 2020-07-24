const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

let JobSchema = new mongoose.Schema({
	jobfile:{
		type: String,
		required: true,
		minlenght: 3,
		trim: true
    },
    data:{
        type:Object,
        requried:true
    },
    runOn:{
        type: String,
        enum: ['hourly','daily'],
        required:true
    },
    priority:{
       type:Number,
       required: true
    },
    createdAt:{
            type: Date,
            required: true,
            default:Date.now
    },
    updatedAt:{
        type: Date,
        required: true,
        default:Date.now
    }

	
});

JobSchema.methods.toJSON = function () {
	let Job = this;
	let JobObject = Job.toObject();
	return _.pick(JobObject, ['_id', 'jobfile','data','runOn','createdAt','updatedAt']);
}


const Job = mongoose.model('Jobs', JobSchema);

module.exports = { Job }