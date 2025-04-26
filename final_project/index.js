const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
  // Get token from session
  const token = req.session.authorization;
  // Check if token exists
  if (!token) {
    return res.status(401).json({message: "No token provided"});
  }

  console.log("/customer/auth/*");
  console.log(token);
  
  // Verify token
  try {
    const decoded = jwt.verify(token.token, "fingerprint_customer");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({message: "Invalid token"});
  }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
