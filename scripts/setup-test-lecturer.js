// scripts/setup-test-lecturer.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Course = require('../models/Course');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function setupTestLecturer() {
  try {
    // Check if test lecturer already exists
    let lecturer = await User.findOne({ email: 'test.lecturer@edubridge.com' });
    
    if (!lecturer) {
      console.log('Creating test lecturer...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('TestPassword123!', salt);
      
      // Create lecturer
      lecturer = new User({
        userName: 'Test Lecturer',
        email: 'test.lecturer@edubridge.com',
        password: hashedPassword,
        role: 'LECTURER',
        university: 'Test University',
        country: 'Test Country',
        isVerified: true,
        isActive: true
      });
      
      await lecturer.save();
      console.log('Test lecturer created with ID:', lecturer._id);
    } else {
      console.log('Test lecturer already exists with ID:', lecturer._id);
    }
    
    // Define courses with different subjects to improve lecturer matching
    const coursesToCreate = [
      {
        title: 'Computer Science Theory',
        code: 'CS401',
        description: 'Advanced topics in computer science including complexity theory, P vs NP problem, and algorithm analysis.',
        department: 'Computer Science',
        syllabus: 'This course covers advanced theoretical concepts in computer science including computational complexity, algorithm analysis, and the theory of computation.',
        keywords: ['complexity theory', 'P vs NP', 'algorithm analysis', 'computational theory']
      },
      {
        title: 'Advanced Algorithms',
        code: 'CS402',
        description: 'Study of advanced algorithms, data structures, and their applications in solving complex computational problems.',
        department: 'Computer Science',
        syllabus: 'This course explores advanced algorithmic techniques including dynamic programming, greedy algorithms, graph algorithms, and computational geometry.',
        keywords: ['algorithms', 'data structures', 'computational complexity', 'optimization']
      },
      {
        title: 'Artificial Intelligence Fundamentals',
        code: 'CS403',
        description: 'Introduction to artificial intelligence concepts, machine learning algorithms, and neural networks.',
        department: 'Computer Science',
        syllabus: 'This course covers the fundamentals of AI including search algorithms, knowledge representation, machine learning, and neural networks.',
        keywords: ['artificial intelligence', 'machine learning', 'neural networks', 'AI']
      }
    ];
    
    // Create or update each course
    for (const courseData of coursesToCreate) {
      // Check if course already exists
      const existingCourse = await Course.findOne({ 
        title: courseData.title,
        lecturer: lecturer._id
      });
      
      if (!existingCourse) {
        console.log(`Creating course: ${courseData.title}...`);
        
        // Create course with common fields
        const course = new Course({
          ...courseData,
          lecturer: lecturer._id,
          startDate: new Date('2024-10-01'),
          endDate: new Date('2025-02-28'),
          status: 'UPCOMING',
          enrollmentKey: `${courseData.code}-KEY`,
          isEnrollmentOpen: true,
          maxEnrollment: 50,
          students: [],
          materials: []
        });
        
        await course.save();
        console.log(`Course "${courseData.title}" created with ID:`, course._id);
        
        // Add some course materials related to the subject
        if (courseData.keywords && courseData.keywords.length > 0) {
          const materials = courseData.keywords.map(keyword => ({
            title: `Introduction to ${keyword}`,
            description: `A comprehensive guide to understanding ${keyword} in the context of ${courseData.title}.`,
            fileUrl: `https://example.com/materials/${keyword.replace(/\s+/g, '-').toLowerCase()}.pdf`,
            fileType: 'PDF',
            uploadDate: new Date()
          }));
          
          // Update the course with materials
          await Course.findByIdAndUpdate(course._id, {
            $push: { materials: { $each: materials } }
          });
          
          console.log(`Added ${materials.length} materials to course "${courseData.title}"`);
        }
      } else {
        console.log(`Course "${courseData.title}" already exists with ID:`, existingCourse._id);
      }
    }
    
    console.log('Setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up test data:', error);
    process.exit(1);
  }
}

setupTestLecturer();