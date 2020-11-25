const mongoose = require('mongoose');

const CoursesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    syllabus: {
        type: File
    },
    mcgillCalendar: String
});

const Courses = mongoose.model('Courses', CoursesSchema);
module.exports = Courses;