const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save(); //mongoose save
    res.status(201).json({
      message: `${name} Registered Succsessfully`,
    });
  } catch (error) {
    res.status(500).json({
      error: `error registering the user: ${name}`,//reduntent user not inserted to MongoDb
    });
  }
});

router.post('/login',async (req,res)=>{
    const {email,password} = req.body;
    try {
        const user = await User.findOne({email});//email checking with given email
        if(!user) return res.status(404).json({error:`${email} not found`});
        
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch) return res.status(400).json({error:"password doesn't match"});

        const payload = {
                           id:user._id,
                        };
        const JWT_SECRET = process.env.JWT_SECRET;
        const properties = {
                             expiresIn:'1d',
                           };

        const token = jwt.sign(payload,JWT_SECRET,properties);
        res.status(200).json({token});//means token:token
    } catch (error) {
        res.status(500).json({error:'logging error'})
    }
});

module.exports = router;