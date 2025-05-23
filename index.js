require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require("cors");
const bcrypt = require("bcryptjs");
const https = require("https");
const fs = require("fs");
require('./db/config');

const app = express();
const port = process.env.PORT;

const Student = require('./db/Students');

const Company = require('./db/Companies');

const JobsPosted = require('./db/JobsPosted');

const AppliedJobs = require('./db/AppliedJobs');


app.use(express.json());
app.use(cors());


// POSTING STUDENT DETAILS FROM STUDENT REGISTER PAGE TO THE DATABASE
app.post('/registerStudent', async(req,res) => {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
    let user = new Student(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password;
    res.send(result);
});


// POSTING COMPANY DETAILS FROM COMPANY REGISTER PAGE TO THE DATABASE
app.post('/registerCompany', async(req,res) => {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
    let user = new Company(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password;
    res.send(result);
});


// LOGIN BACKEND FUNCTIONALITY
app.post('/login', async(req, res) => {
    if(req.body.password && req.body.email){
        let email = req.body.email;
        let user = await Student.findOne({email : email});
        if(user && (await bcrypt.compare(req.body.password, user.password))){
            delete user['password'];
            res.send(user);
        }
        else{
            let comp = await Company.findOne({email : email});
            if(comp && (await bcrypt.compare(req.body.password, comp.password))){
                delete comp['password'];
                res.send(comp);

            }
            else{
                res.send("Entered Username or Password is incorrect!");
            }
        }
    }
    
});


// POSTING THE JOBS FROM COMPANY ADD JOBS TO THE DATABASE
app.post('/jobsPosted', async(req,res) => {
    let user = new JobsPosted(req.body);
    let result = await user.save();
    result = result.toObject();
    res.send(result);
});


// FETCHING THE JOBS THAT THE COMPANY ADDED
app.get('/jobs/:comp', async(req,res) => {
    const jobs = await JobsPosted.find({name:req.params.comp});
    
    if(jobs.length > 0){
        res.send(jobs);
    }
    else{
        res.send("error");
    }
});


// FETCHING ALL THE JOBS POSTED FOR THE STUDENTS ON THE PLATFORM
app.get('/studjobs', async(req,res) => {
    const jobs = await JobsPosted.find();
    
    if(jobs.length > 0){
        res.send(jobs);
    }
    else{
        res.send({result : "No jobs found"});
    }
});



// EDITING AND UPDATING THE STUDENT DETAILS 
app.post('/studentedit', async(req, res) => {
    
    const _id = req.body._id;
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const rollno = req.body.rollno;
    // const password = req.body.password;


    updateStudent(_id, name, email, phone, rollno);

});

// FUNCTION FOR UPDATING STUDENT DETAILS
const updateStudent = async (_id, name1, email1, phone1, roll1, password1) => {
    try{
        await Student.updateOne({_id}, {
            $set : {
                name : name1,
                email : email1,
                phone : phone1,
                rollno : roll1
                // password : password1
            }
        });
        
    }
    catch(err){
        console.log(err);
    }
}


// EDITING AND UPDATING THE COMPANY DETAILS 
app.post('/companyedit', async(req, res) => {
    
    const _id = req.body._id;
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const logo = req.body.logo;
    const location = req.body.location;
    const password = req.body.password;


    updateCompany(_id, name, email, phone, location, logo, password);

});

// FUNCTION FOR UPDATING COMPANY DETAILS
const updateCompany = async (_id, name1, email1, phone1, location1, logo1, password1) => {
    try{
        await Company.updateOne({_id}, {
            $set : {
                name : name1,
                email : email1,
                phone : phone1,
                logo : logo1,
                location : location1,
                password : password1
            }
        });

        
    }
    catch(err){
        console.log(err);
    }
}


// EDITING AND UPDATING THE STUDENT PASSWORD 
app.post('/editstudpswd', async(req, res) => {
    
    const _id = req.body._id;
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);

    try{
        await Student.updateOne({_id}, {
            $set : {
                password : await bcrypt.hash(password, salt)
            }
        }, (err, doc) => {
            if(err) throw(err);
            else res.json(doc);
        });
        
    }
    catch(err){
        console.log(err);
    }

});



// EDITING AND UPDATING THE COMPANY PASSWORD 
app.post('/editcomppswd', async(req, res) => {
    
    const _id = req.body._id;
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);

    try{
        await Company.updateOne({_id}, {
            $set : {
                password : await bcrypt.hash(password, salt)
            }
        }, (err, doc) => {
            if(err) throw(err);
            else res.json(doc);
        });
        
    }
    catch(err){
        console.log(err);
    }

});



// FETCHING COMPANY DETAILS FOR COMPANY LIST
app.get('/companylist', async(req, res) => {
        const CompList = await Company.find();
        if (CompList.length > 0){
            res.send(CompList);
        }
        else{
            res.send("Companies not found!");
        }
})


// POSTING JOB ID TO APPLIED JOBS IN DATABASE
app.post('/appliedJobs', async(req, res) => {
    let user = new AppliedJobs(req.body);
    let result = await user.save();
    result = result.toObject();
    res.send(result);
})


// APPEND STUDENT ID TO APPLIED JOBM
app.post('/studentapply', async(req, res) => {
    const id = req.body.jid;
    const sid = req.body.sid;

    try{
        await AppliedJobs.findOneAndUpdate({jobid : id}, {
            $addToSet : {students : sid}
        }, {new : true}, (err, doc) => {
            if(err){
                throw(err);
            }
            else{
                res.json(doc);
            }
        })   
        
    }
    catch(err){
        console.log(err);
    }
});


// REMOVE STUDENT ID FROM APPLIED JOBS (WITHDRAW JOB APPLICATION)
app.post('/studentwithdraw', async(req, res) => {
    const id = req.body.jid;
    const sid = req.body.stid;

    try{
        await AppliedJobs.findOneAndUpdate({jobid : id}, {
            $pull : {students : sid}
        }
        , (err, doc) => {
            if(err){
                throw(err);
            }
            else{
                res.json(doc);
            }
        })   
        
    }
    catch(err){
        console.log(err);
    }
});


// FETCHING THE JOBS APPLIED BY THE STUDENTS TO STUDENT DASHBOARD
app.get('/applydjobs/:applied', async(req,res) => {
    const applied_jobs = await AppliedJobs.find({students : req.params.applied}).populate('jobid');
    
    if(applied_jobs.length > 0){
        res.send(applied_jobs);
    }
    else{
        res.send('error');
    }
});


// FETCHING THE STUDENT APPLICANTS WHO APPLIED TO JOBS THAT ARE POSTED BY THE COMPANY FROM APPLIED JOBS
app.get('/compNotify/:compidn', async (req, res) => {
    const applied_jobs = await AppliedJobs.find({compid : req.params.compidn}).populate('students').populate('jobid').populate('accepted');

    if(applied_jobs.length > 0){
        res.send(applied_jobs);
    }
    else{
        res.send('error');
    }

});


// DELETING THE JOBS POSTED BY THE COMPANY
app.delete("/deletejob/:id", async (req, res) => {
    
        let finding = await JobsPosted.find({_id : req.params.id});
        if(finding) {
            let result1 = await JobsPosted.deleteOne({_id : req.params.id});
            let result2 = await AppliedJobs.deleteOne({jobid : req.params.id});
            res.send(result1);
        }
        else{
            res.send('error');
        }
    
    
});


// DECLINING THE STUDENT JOB REQUEST (REMOVING STUDENT ID FROM STUDENTS ARRAY)
app.post('/decline', async (req, res) => {

    const id = req.body.jid;
    const sid = req.body.stid;

    try{
        await AppliedJobs.findOneAndUpdate({jobid : id}, {
            $pull : {students : sid}
        }
        , (err, doc) => {
            if(err){
                throw(err);
            }
            else{
                res.json(doc);
            }
        })   
        
    }
    catch(err){
        console.log(err);
    }
});


// ACCEPTING STUDENT APPLICATION (ADDING STUDENT ID TO ACCEPTED ARRAY IN APPLIED JOBS)
app.post('/accept', async(req, res) => {
    const id = req.body.jid;
    const sid = req.body.stid;

    try{
        await AppliedJobs.findOneAndUpdate({jobid : id}, {
            $addToSet : {accepted : sid},
            $pull : {students : sid}
        }, {new : true}, (err, doc) => {
            if(err){
                throw(err);
            }
            else{
                res.json(doc);
            }
        })
        
    }
    catch(err){
        console.log(err);
    }
});


// REMOVING STUDENT ID FROM ACCEPTED ARRAY
app.post('/remove', async(req, res) => {
    const id = req.body.jid;
    const sid = req.body.stid;

    try{
        await AppliedJobs.findOneAndUpdate({jobid : id}, {
            $pull : {accepted : sid},
        }, {new : true}, (err, doc) => {
            if(err){
                throw(err);
            }
            else{
                res.json(doc);
            }
        })
        
    }
    catch(err){
        console.log(err);
    }
});


// FETCHING THE JOBS IN WHICH STUDENT WAS SELECTED IN A COMPANY
app.get('/selected/:selected', async(req,res) => {
    const applied_jobs = await AppliedJobs.find({accepted : req.params.selected}).populate('jobid');
    
    if(applied_jobs.length > 0){
        res.send(applied_jobs);
    }
    else{
        res.send('error');
    }
});



const httpsServer = https.createServer({
    cert : fs.readFileSync("./certificates/server.crt"),
    key : fs.readFileSync("./certificates/key.pem")
}, app)

httpsServer.listen(port, () => {
    console.log(`Server running at ${port}`);
})