const mongoose = require('mongoose');

const appliedSchema = new mongoose.Schema({
    "jobid" : {type : 'ObjectId', ref : 'JobsPosted'},
    "students" : [{type : 'ObjectId', ref : 'Students'}],
    "accepted" : [{type : 'ObjectId', ref : 'Students'}],
    "compid" : 'ObjectId',
}, {collection : 'AppliedJobs'});

module.exports = mongoose.model("AppliedJobs", appliedSchema);