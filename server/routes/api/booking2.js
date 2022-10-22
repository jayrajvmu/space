const express = require('express');
const router = express.Router();
const db = require('../../db/mysql')


//create new booking

router.post('/', (req, res) => {
    //fetcj data from shift table
    let slectSqlfromShift = `SELECT * FROM shift WHERE id='${req.body.shift}';`;
    db.query(slectSqlfromShift, (err, result) => {
        if (err) {
            throw err;
        }
        //fetch data from booking table
        if(req.body.booking_type==0){
        let slectSqlfromRules = `SELECT * FROM booking_rules WHERE type='regular';`;
        db.query(slectSqlfromRules, (errRules, resultRules) => {
            if (errRules) {
                throw errRules;
            }

            let shiftStartTime = new Date(`${req.body.date}`);
            shiftStartTime.setHours(`${result[0].start_time}`);
            shiftStartTime.setMinutes(0);

            let maximumtimetobook = new Date(`${req.body.date}`);
            maximumtimetobook.setHours(`${result[0].start_time - resultRules[0].maximum_booking_time}`);
            maximumtimetobook.setMinutes(0);

            let minimumtimetobook = new Date(`${req.body.date}`);
            minimumtimetobook.setHours(`${result[0].start_time - resultRules[0].minimun_booking_time}`);
            minimumtimetobook.setMinutes(0);

            let now = new Date();
            //check booking time is not less than 6 and more than 48 hrs.
            if ((now > minimumtimetobook) && (now < maximumtimetobook)) {
                let slectSqlfromBooking = `SELECT * FROM booking WHERE emp_id='${req.body.emp_id}'AND status='1';`;
                db.query(slectSqlfromBooking, (errbook, resultbook) => {
                    if (errbook) {
                        throw errbook;
                    }

                     
                    let userDataisSame = 0;

                    //check each already booked date is inside a week
                    resultbook.forEach((element, index) => {
                            let userBookedDate = new Date(`${element.date}`);
                            let userBookingDate = new Date(`${req.body.date}`);
             
            
                                if (userBookingDate.toLocaleDateString() == userBookedDate.toLocaleDateString()) {
                                    userDataisSame = 1;
                                
                            
                            
                        }

                    });

                    //check user apply seat for same day
                    if (userDataisSame === 1) {
                        res.json({ 'sucess': false, 'message': 'You already booked for the day' });
                    } else {

                        //check user apply only 3 days in a week this is for advace booking
                  
                            let userData = { emp_id: `${req.body.emp_id}`, seat_id: `${req.body.desk_id}`, date: `${req.body.date}`, shift_id: `${1}`, status: `1` };
                            let sql = 'INSERT INTO booking SET ?';
                            db.query(sql, userData, (errinsert, resultinsert, fields) => {
                                if (errinsert) {
                                    throw errinsert;
                                }
                                res.json({ 'success': true, 'message': `${req.body.desk_id} Booked Successfully` });
                            });

                    
                    }
                });
            }
            else {
                res.json({ 'sucess': false, 'message': 'Timing Problem Not able to book seat', 'shifttime': shiftStartTime.toLocaleString(), 'maximum': maximumtimetobook.toLocaleString(), 'minimum': minimumtimetobook.toLocaleString(), 'now': now.toLocaleString() });
            }
        });
    }
    else{

        let slectSqlfromRules = `SELECT * FROM booking_rules WHERE type='advance';`;
        db.query(slectSqlfromRules, (errRules, resultRules) => {
            if (errRules) {
                throw errRules;
            }

            let now = new Date();
            let tomorrow =  new Date()
             tomorrow.setDate(now.getDate() + 1)

            //check booking time is not less than 6 and more than 48 hrs.
            if ((req.body.date>tomorrow)) {
                let slectSqlfromBooking = `SELECT * FROM booking WHERE emp_id='${req.body.emp_id}'AND status='1';`;
                db.query(slectSqlfromBooking, (errbook, resultbook) => {
                    if (errbook) {
                        throw errbook;
                    }

                    let weekStart = new Date();
                    let dayStart = weekStart.getDay(),
                        diffStart = weekStart.getDate() - dayStart + (dayStart == 0 ? -6 : 1); // adjust when day is sunday
                    let actualWeekStart = new Date(weekStart.setDate(diffStart));
                    let weekEnd = new Date();
                    let dayEnd = weekEnd.getDay(),
                        diffEnd = weekEnd.getDate() - dayEnd + (dayEnd == 0 ? -6 : 7); // adjust when day is sunday
                    let actualWeekEnd = new Date(weekEnd.setDate(diffEnd));

                    let bookingcount = 0;
                    let userDataisSame = 0;

                    //check each already booked date is inside a week
                    resultbook.forEach((element, index) => {
                       
                            let userBookedDate = new Date(`${element.date}`);
                            let userBookingDate = new Date(`${req.body.date}`);
                            console.log(userBookedDate);
                        

                                if (userBookingDate.toLocaleDateString() == userBookedDate.toLocaleDateString()) {
                                    userDataisSame = 1;
                                }
                            
                            bookingcount++
                        

                    });

                    //check user apply seat for same day
                    if (userDataisSame === 1) {
                        res.json({ 'sucess': false, 'message': 'You already booked for the day' });
                    } else {

                        //check user apply only 3 days in a week this is for advace booking
                        if (bookingcount < 3) {
                            let userData = { emp_id: `${req.body.emp_id}`, seat_id: `${req.body.desk_id}`, date: `${req.body.date}`, shift_id: `${1}`, status: `1` };
                            let sql = 'INSERT INTO booking SET ?';
                            db.query(sql, userData, (errinsert, resultinsert, fields) => {
                                if (errinsert) {
                                    throw errinsert;
                                }
                                res.json({ 'success': true, 'message': `${req.body.desk_id} Booked Successfully` });
                            });

                        } else {
                            res.json({ 'sucess': false, 'message': 'Only 3 days in a week' });
                        }
                    }
                });
            }
            else {
                res.json({ 'sucess': false, 'message': 'Timing Problem Not able to book seat' });
            }
        });
    }
});
});


//fetch data from booking table for booked status view
router.get('/:id', (req, res) => {
    let slectSqlfromBooking = `SELECT * FROM booking WHERE emp_id='${req.params.id}'AND status='1';`;
    db.query(slectSqlfromBooking, (errfetch, resultfetch) => {
        if (errfetch) {
            throw errfetch;
        }
        res.json({'sucess':true, 'message':'fetched sucessfully', 'data':resultfetch});
    });
});


//cancel booking

router.put('/:id', (req, res) => {
    let updateSqlfromBooking = `UPDATE booking SET status = '2' WHERE id = '${req.params.id}'`;
    db.query(updateSqlfromBooking, (errupdate, resultupdate) => {
        if (errupdate) {
            throw errupdate;
        }
        res.json({'sucess':true, 'message':'Seat Cancelled sucessfully'});
    });
});

module.exports = router;