const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser') ;
const connectDB = require('./config/db');

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");


const mongoSanitize = require('express-mongo-sanitize') ;
const helmet = require('helmet') ;
const {xss} = require('express-xss-sanitizer') ;
const rateLimit =require('express-rate-limit') ;
const hpp = require('hpp');
const cors = require('cors') ;


//Route files
const dentists = require('./routes/dentists');
const auth = require('./routes/auth');
const appointments = require('./routes/appointments') ;
const reports = require('./routes/reports') ;


//Load env vars
dotenv.config({path:'./config/config.env'}) ;

//connect to database
connectDB();


const app = express() ;

//BOdy parser
app.use(express.json());


//Cookie parser
app.use(cookieParser()) ;
// app.get('/' , (req , res) => {
//     res.send('<h1>Hello from express</h1>');
//     // res.send({name: 'Brad'}) ;
//     // res.json({name:'Brad'});
//     // res.sendStatus(400);
//     // res.status(400).json({success:false});
//     // res.status(200).json({success: true , date:{id:1}});
// });

//Sanitize data
app.use(mongoSanitize()) ;

//set security headers
app.use(helmet()) ;

//Prevent Xss attacks
app.use(xss());


//Rate Limiting
const limiter=rateLimit({
    windowsMs: 10*60*1000,//10mins
    max:100
});

app.use(limiter);

//Prevent http param pollutions 
app.use(hpp()) ;

//enable cors 
app.use(cors());


//Mount reuters
app.use('/api/v1/dentists' , dentists);
app.use('/api/v1/auth' , auth);
app.use('/api/v1/appointments' , appointments);
app.use('/api/v1/reports' , reports);






const PORT = process.env.PORT || 5000 ;
const server = app.listen(PORT , console.log('Server running in' , process.env.NODE_ENV , 'mode on port' , PORT)) ;

const swaggerOptions={
    swaggerDefinition:{
      openapi: '3.0.0',
      info: {
      title: 'Library API',
      version: '1.0.0',
      description: 'dentnaz API'
      },
      servers: [
        {
          url: "http://localhost:5000/api/v1"
          // url: process.env.HOST + ':' + 5000 + '/api/v1'
        }
      ],
    },
    apis:['./routes/*.js'],
  };

  
  const swaggerDocs=swaggerJsDoc(swaggerOptions);
  app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(swaggerDocs));

//Handle unhandled promise rejections
process.on('unhandledRejection' , (err , promise) =>
{
    console.log(`Error: ${err.message}`);
    //Close sever & exit process
    server.close(()=> process.exit(1) );
})