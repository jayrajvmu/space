require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');

app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`);
});
app.use(cors());
app.use(express.json());
app.use('/', require('./middleware/logger'))
app.use('/booking', require('./routes/api/booking'))