const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const userRoutes = require('./routes/user');
const sequelize = require('./util/database');
const User=require('./models/user');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended:false}));

app.use('/user', userRoutes);

sequelize
    .sync()
    .then(result => {
        app.listen(3000);
    })
    .catch(err => console.log(err));


