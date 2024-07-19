const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const empdata = new mongoose.Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        validate(value){
        if(!validator.isEmail){
            throw new Error("invalid email")
        }
    }
    },
    password:{
        type:String,
        required:true
    },
    confirmpassword:{
        type:String,
        required:true
    },
    tokens:[{
        token:{
        type:String,
        required:true
        }
    }]
    
})



// generate token 

empdata.methods.generateToken = async function(){
    try {
        const token =  jwt.sign({_id:this._id}, process.env.SECRET_KEY); 
        this.tokens = this.tokens.concat({token:token})
        await this.save();
        return token;   
    } catch (error) {
        // res.send("the error part")
        console.log("the error part");
    }
}



// add password in database in hash form 

empdata.pre("save", async function(next){

    if(this.isModified("password")){
        console.log(`the current password ${this.password}`);
        this.password = await bcrypt.hash(this.password,10);
        console.log(`the current password ${this.password}`);
   
        this.confirmpassword = await bcrypt.hash(this.confirmpassword,10);
    }
    next();

})






const Data = new mongoose.model("Data",empdata);

module.exports = Data;