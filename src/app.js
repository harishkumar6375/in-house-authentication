require('dotenv').config();
const express = require("express");
const app = new express();
const path = require("path");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth")

require("./db/conn");
const Data = require("./models/registers");
const { execPath } = require("process");
const { TokenExpiredError } = require("jsonwebtoken");
const port = process.env.PORT || 4000

const staticPath = path.join(__dirname,"../public")
app.use(express.static(staticPath))

app.set("view engine" , "hbs")

// for postman
app.use(express.json())

// for cookie 
app.use(cookieParser());

// for form 
app.use(express.urlencoded({extended:false}));

console.log(process.env.SECRET_KEY)

// route

app.get("/", (req,res)=>{
    res.render("index")
})

app.get("/secret" , auth ,(req,res)=>{
    console.log(`this is cookie awesome ${req.cookies.jwt}`);
    res.render("secret")
})

app.get("/register", (req,res)=>{
    res.render("register")
})

app.get("/login", (req,res)=>{
    res.render("login")
})

app.get("/logout", auth,  async (req,res)=>{
    try {
        console.log(req.user);

        // for single user logout

        // req.user.tokens = req.user.tokens.filter((currEle)=>{
        //     return currEle.token !== req.token;
        // })


        // for all user logout

        req.user.tokens = [];

        res.clearCookie("jwt");
        console.log("logout successfully");

        await req.user.save();
        res.render("login");
        
    } catch (error) {
        res.send(error)
    }
})

// data save in database

app.post("/register", async (req,res)=>{
    try{
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if(password===cpassword){

            const registerEmp = new Data({
                firstname : req.body.firstname,
                lastname : req.body.lastname,
                email : req.body.email,
                password : password,
                confirmpassword : cpassword
            })

            const token = await registerEmp.generateToken();
            console.log("the token is"+ token);

            res.cookie("jwt" , token,{
                expires: new Date(Date.now() + 30000),
                httpOnly : true
            })
            
            const registerd = await registerEmp.save();
            res.status(201).render("index")

        }else{
            res.send("password does not match")

        }

    }catch(e){
        console.log(e);
    }
})


// check login

app.post("/login", async (req,res)=>{
   try {

    const email = req.body.email;
    const password = req.body.password;

    const useremail = await Data.findOne({email:email});
    const isMatch = await bcrypt.compare(password, useremail.password);

    const token = await useremail.generateToken();
    console.log("the token is"+ token);

    res.cookie("jwt" , token,{
        expires: new Date(Date.now() + 30000),
        httpOnly : true
    })
    
 
    if(isMatch){
        res.status(200).render("index")
    }else{
        res.status(401).send("login details invalid")
    }

   } catch (error) {
    res.status(401).send("login details invalid")
   }


})



// secure password using bcryptjs

// const bcrypt = require("bcryptjs")

// const securepassword = async (password) =>{

//     const passwordHash = await bcrypt.hash(password,10);
//     console.log(passwordHash)

//     const passwordmatch = await bcrypt.compare(password,passwordHash);
//     console.log(passwordmatch);
 
// }

// securepassword("harish123")









app.listen(port ,()=>{
    console.log(`listening to the port ${port}`)
})