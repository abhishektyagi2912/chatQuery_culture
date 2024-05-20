const current_staff = require('../models/current_staff');

const convertTo24HourFormat = (time) => {
    const [timePart, modifier] = time.split(' ');
    let [hours, minutes] = timePart.split(':');
    if (hours === '12') {
        hours = '00';
    }
    if (modifier === 'pm') {
        hours = parseInt(hours, 10) + 12;
    }
    return `${hours}:${minutes}`;
};

const addstaff = async (req, res) => {
    try {
        const { staffTime, staffNameArray } = req.body;
        if (!staffTime || !staffNameArray || !Array.isArray(staffNameArray) || staffNameArray.length === 0) {
            return res.status(400).json({ message: 'All fields are required and staffNameArray must be a non-empty array' });
        }
        const { endTime, startTime } = staffTime[0];

        const convertedStartTime = convertTo24HourFormat(startTime);
        const convertedEndTime = convertTo24HourFormat(endTime);

        const existingTime = await current_staff.findOne({
            'staffTime.startTime': { $lte: convertedEndTime },
            'staffTime.endTime': { $gte: convertedStartTime }
        });

        if (existingTime) { 
            const existingUsernames = existingTime.staffNameArray.map(staff => staff.UserName);
            for (let i = 0; i < staffNameArray.length; i++) {
                if (existingUsernames.includes(staffNameArray[i].UserName)) {
                    return res.status(400).json({ message: `Username ${staffNameArray[i].UserName} already exists` });
                }
            }
            existingTime.staffNameArray.push(...staffNameArray);
            await existingTime.save();
            return res.status(200).json({ message: 'Staff Added' });
        }
        else {
            const staff = new current_staff({
                staffTime,
                staffNameArray
            });
            await staff.save();
            res.status(200).json({ message: 'Staff Added' });
        }
    } catch (error) {
        res.status(500).json({ messages: error.message });
    }
}

const getstaff = async (req, res) => {
    try {
        const staff = await staffModel.find();
        res.status(200).json({ staff });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { addstaff, getstaff }