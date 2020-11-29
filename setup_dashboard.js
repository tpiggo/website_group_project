const mongoose = require('mongoose');

const TAPosting = require('./models/TAPosting'); 
const Course = require('./models/Courses')

const db = require('./config/keys').MongoURI;

// Connect to Mongo
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => { console.log('MongoDB Connected!')})
    .catch(err => { console.log(err) });


const mPostings = [
    {
        title: "COMP189 Computers and Society",
        description: "How computer technologies shape social notions such as ownership, safety, and privacy. Emphasis is on computer science powering both day-to-day technologies (e.g., online social media) and those in the news (e.g., cyberwar). Discussions will investigate technology and social issues in order to understand both",
        credits: 3, 
        termsOffered: "Winter 2020",
        instructor: ["Derek Ruths (Winter)"],
        prerequisites: "none",
        syllabus: "holder",
        mcgillCalendar: "https://www.mcgill.ca/study/2020-2021/courses/comp-189"
    },
    {
        title: "COMP202 Foundations of Programming",
        description: "Introduction to computer programming in a high level language: variables, expressions, primitive types, methods, conditionals, loops. Introduction to algorithms, data structures (arrays, strings), modular software design, libraries, file input/output, debugging, exception handling. Selected topics.",
        credits: 3, 
        termsOffered: "Fall 2019, Winter 2020, Summer 2019",
        instructor: ["Giulia Alberini", " Elizabeth Patitsas (Fall)", "Giulia Alberini (Winter)",  "Ben Yu (Summer)"],
        prerequisites: "a CEGEP level mathematics course",
        restrictions: "COMP 202 and COMP 208 cannot both be taken for credit. COMP 202 is intended as a general introductory course, while COMP 208 is intended for students interested in scientific computation. COMP 202 cannot be taken for credit with or after COMP 250",
        syllabus: "holder",
        mcgillCalendar: "https://www.mcgill.ca/study/2020-2021/courses/comp-202"
    },
    {
        title: "COMP206 Introduction to Software Systems",
        description: "Comprehensive overview of programming in C, use of system calls and libraries, debugging and testing of code; use of developmental tools like make, version control systems.",
        credits: 3, 
        termsOffered: "Fall 2019, Winter 2020",
        instructor: ["Joseph DSilva (Fall)" , "Joseph P Vybihal (Winter)"],
        prerequisites: "COMP 202 or COMP 250",
        syllabus: "holder",
        mcgillCalendar: "https://www.mcgill.ca/study/2020-2021/courses/comp-206"
    },
    {
        title: "COMP250 Introduction to Computer Science",
        description: "Mathematical tools (binary numbers, induction, recurrence relations, asymptotic complexity, establishing correctness of programs), Data structures (arrays, stacks, queues, linked lists, trees, binary trees, binary search trees, heaps, hash tables), Recursive and non-recursive algorithms (searching and sorting, tree and graph traversal). Abstract data types, inheritance. Selected topics.",
        credits: 3, 
        termsOffered: "Fall 2019, Winter 2020",
        instructor: ["Michael Langer", "Giulia Alberini (Fall)", "Reihaneh Rabbany", "Giulia Alberini (Winter)"],
        prerequisites: " Familiarity with a high level programming language and CEGEP level Math.",
        notes: "Students with limited programming experience should take COMP 202 or equivalent before COMP 250. See COMP 202 Course Description for a list of topics.",
        syllabus: "holder",
        mcgillCalendar: "https://www.mcgill.ca/study/2020-2021/courses/comp-189"
    }
]

mPostings.forEach(course =>{
    Course.findOne({title: course.title})
        .then(fCourse => {
            if (!fCourse){
                console.log("Adding course!", course);
                const mCourse = new Course({
                    title: course.title,
                    description: course.description,
                    credits: course.credits,
                    termsOffered: course.termsOffered,
                    instructor: course.instructor,
                    prerequisites: course.prerequisites,
                    syllabus: course.syllabus,
                    mcgillCalendar: course.mcgillCalendar,
                    notes: course.notes,
                    restrictions: course.restrictions
                });
                mCourse.save();
            } else {
                console.log("Course found!", course);
            }
        })
        .catch(err=> console.log(err));
})