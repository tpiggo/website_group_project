const mongoose = require('mongoose');

const CoursesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    credits: {
        type: String,
        required: true
    },
    termsOffered: {
        type: [String],
        required: true
    },
    instructor: {
        type: [String],
        required: true
    },
    prerequisites: {
        type: String,
        required: true
    },
    notes: String,
    restrictions: String,
    syllabus: {
        type: String,
        required: true
    },
    mcgillCalendar: String
});

const Courses = mongoose.model('Courses', CoursesSchema);
module.exports = Courses;