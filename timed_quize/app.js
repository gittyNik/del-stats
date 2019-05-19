const express = require('express');
const bodyParser = require('body-parser');
const db = require('./config/database');
const app = express();

// connection to db
db.authenticate()
   .then(()=>console.log("Connected to database"))
   .catch(err=>console.log("Error connecting to db"+err));
app.get('/', (req, res)=>{
    res.send("Welcome");
});

app.use('/questions', require('./routes/questions'));
const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server is running on ${PORT}`));