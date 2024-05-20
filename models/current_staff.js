const mongoose = require('mongoose');

const staffNameSchema = new mongoose.Schema({
    UserName: {
        type: String,
        required: [true, 'Name is required'],
        unique: true,
    },
    assigned: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

const currentStaffSchema = new mongoose.Schema({
    staffTime: {
        type: [
            {
                startTime: {
                    type: String,
                    required: true,
                },
                endTime: {
                    type: String,
                    required: true,
                }
            }
        ],
        required: true,
    },
    staffNameArray: {
        type: [staffNameSchema],
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('current_staff', currentStaffSchema);
