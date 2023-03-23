const express = require('express');
const cors = require("cors");
require('./db/config');

const app = express();
const port = 5000;

const Student = require('./db/Students');

const Company = require('./db/Companies');

const JobsPosted = require('./db/JobsPosted');


app.use(express.json());
app.use(cors());

app.post('/registerStudent', async(req,res) => {
    let user = new Student(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password;
    res.send(result);
});


app.post('/registerCompany', async(req,res) => {
    let user = new Company(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password;
    res.send(result);
});


app.post('/login', async(req, res) => {
    if(req.body.password && req.body.email){
    let user = await Student.findOne(req.body).select("-password");
    if(user){
        res.send(user);
    }
    else{
        let comp = await Company.findOne(req.body).select("-password");
        if(comp){
            res.send(comp);
        }
        else{
            res.send("Entered Username or Password is incorrect!");
        }
    }
    }
    
});


app.post('/jobsPosted', async(req,res) => {
    let user = new JobsPosted(req.body);
    let result = await user.save();
    result = result.toObject();
    res.send(result);
});


app.get('/jobs', async(req,res) => {
    const jobs = await JobsPosted.find();
    if(jobs.length > 0){
        res.send(jobs);
    }
    else{
        res.send({result : "No jobs found"});
    }
});



app.post('/studentedit', async(req, res) => {
    
    const _id = req.body._id;
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const roll = req.body.roll;
    const password = req.body.password;


    updateStudent(_id, name, email, phone, roll, password);

});

const updateStudent = async (_id, name1, email1, phone1, roll1, password1) => {
    try{
        await Student.updateOne({_id}, {
            $set : {
                name : name1,
                email : email1,
                phone : phone1,
                roll : roll1,
                password : password1
            }
        });
        
    }
    catch(err){
        console.log(err);
    }
}

app.listen(port);