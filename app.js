require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const subgenresRouter = require('./routes/subgenres'); 
const app = express();

const port = process.env.PORT || 5000;


mongoose.set('strictQuery', false); 


const dbURI = process.env.MONGODB_URI;

if (!dbURI) 
{ 
    console.error('FATAL ERROR: MONGODB_URI is not defined in .env file.');
    process.exit(1);
}

mongoose.connect(dbURI)
  .then(() => {
    console.log('MongoDB Connected successfully!');

    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error: Could not connect to MongoDB Atlas.');
    console.error(err);
   
    process.exit(1);
  });


app.use(express.json());


app.get('/', (req, res) => {
    res.send('Welcome to the Metal Subgenres API');
});

app.use('/api/subgenres', subgenresRouter);

app.use((err, req, res, next) => {
    console.error("---ERROR STACK---");
    console.error(err.stack);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    if(err.name === 'ValidationError') {
        statusCode = 400; // Bad Request
        message = 'Validation failed. Check your input data.';
    }

    if(err.code === 11000) { 
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        message = `The value '${value}' for the field '${field}' already exists. Please use a different value.`;
        statusCode = 409;
    }

    if(err.kind=== 'ObjectId' && err.name === 'CastError') {
        statusCode = 400; 
        message = `Invalid ObjectId format for resource: ${err.path}.`;
    }

    if(err.name === 'MongoNetworkError') {
        statusCode = 503; 
        message = 'Database connection error. Please try again later.';
    }

    if(statusCode === 500 && !err.message) {
        message = 'An unexpected error occurred. Please try again later.';
        console.error('Internal Server Error:', err);
    }
    else if(statusCode===500 && err.message) {
        message = err.message;
        console.error('Internal Server Error:', err.message);
    }

    res.status(statusCode).json({ 
        status: 'error', 
        statusCode, 
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
})