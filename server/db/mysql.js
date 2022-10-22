const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'node',
    password: 'node',
    database: 'master'
});

connection.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL connected');
});


module.exports = connection;