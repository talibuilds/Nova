const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Activity = require('./models/Activity');

const seedDatabase = async () => {
  try {
    // Connect to DB
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nova';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    await Activity.deleteMany();
    console.log('🧹 Cleared existing database');

    // Create Demo User
    const demoUser = await User.create({
      name: 'Demo Admin',
      email: 'demo@nova.com',
      password: 'demo123',
      department: 'Product Management',
      bio: 'Product Manager leading the core Nova teams.',
      role: 'admin'
    });

    const user2 = await User.create({
      name: 'Sarah Chen',
      email: 'sarah@nova.com',
      password: 'demo123',
      department: 'Engineering',
      role: 'user'
    });

    const user3 = await User.create({
      name: 'Marcus Johnson',
      email: 'marcus@nova.com',
      password: 'demo123',
      department: 'Design',
      role: 'user'
    });
    
    console.log('👥 Created Demo Users');

    // Create Projects
    const project1 = await Project.create({
      name: 'Nova Platform v2.0',
      description: 'Major redesign and architecture upgrade for the main Nova productivity platform. Includes new features like dark mode and improved Kanban boards.',
      status: 'active',
      priority: 'high',
      color: '#6366f1',
      owner: demoUser._id,
      members: [
        { user: demoUser._id, role: 'admin' },
        { user: user2._id, role: 'member' },
        { user: user3._id, role: 'member' }
      ],
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 2))
    });

    const project2 = await Project.create({
      name: 'Mobile App Launch',
      description: 'Q4 initiative to release the companion iOS and Android applications for Nova.',
      status: 'planning',
      priority: 'medium',
      color: '#f59e0b',
      owner: demoUser._id,
      members: [
        { user: demoUser._id, role: 'admin' },
        { user: user3._id, role: 'member' }
      ]
    });

    console.log('📁 Created Projects');

    // Create Tasks for Project 1
    const tasksData = [
      {
        title: 'Design System Overhaul',
        description: 'Update the global CSS variables and implement the new glassmorphism UI components across the app.',
        status: 'done',
        priority: 'high',
        project: project1._id,
        assignee: user3._id,
        labels: ['design', 'css'],
        order: 0
      },
      {
        title: 'Implement Dark Mode',
        description: 'Ensure all components adapt correctly to the dark mode context.',
        status: 'in-review',
        priority: 'medium',
        project: project1._id,
        assignee: user3._id,
        labels: ['design', 'feature'],
        order: 0,
        comments: [
          { user: demoUser._id, text: 'Looks great! Just needs a few tweaks on the modal background.' }
        ]
      },
      {
        title: 'Kanban Drag-and-Drop',
        description: 'Integrate @hello-pangea/dnd for smooth column dragging.',
        status: 'in-progress',
        priority: 'urgent',
        project: project1._id,
        assignee: demoUser._id,
        labels: ['frontend', 'feature'],
        order: 0,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 2))
      },
      {
        title: 'Fix Authentication Bug',
        description: 'Users are getting logged out prematurely. Fix token expiration handling.',
        status: 'in-progress',
        priority: 'high',
        project: project1._id,
        assignee: user2._id,
        labels: ['bug', 'backend'],
        order: 1
      },
      {
        title: 'Setup MongoDB Atlas',
        description: 'Migrate local database to production cloud cluster.',
        status: 'todo',
        priority: 'medium',
        project: project1._id,
        assignee: user2._id,
        labels: ['devops'],
        order: 0
      },
      {
        title: 'Write User Documentation',
        description: 'Draft the initial README and user guides.',
        status: 'todo',
        priority: 'low',
        project: project1._id,
        assignee: demoUser._id,
        labels: ['docs'],
        order: 1
      }
    ];

    for (let taskData of tasksData) {
      await Task.create({ ...taskData, reporter: demoUser._id });
    }

    // Calculate project progress stats (Simulate the aggregation)
    const totalTasks = tasksData.length;
    const completedTasks = tasksData.filter(t => t.status === 'done').length;
    project1.totalTasks = totalTasks;
    project1.completedTasks = completedTasks;
    project1.completionPercentage = Math.round((completedTasks / totalTasks) * 100);
    await project1.save();

    console.log('✅ Created Tasks');

    // Create some activities
    await Activity.create([
      { project: project1._id, user: demoUser._id, action: 'project_created', details: 'created the project' },
      { project: project1._id, user: demoUser._id, action: 'member_added', details: 'added Sarah Chen to the project' },
      { project: project1._id, user: demoUser._id, action: 'member_added', details: 'added Marcus Johnson to the project' },
      { project: project1._id, user: user3._id, action: 'task_status_changed', details: 'moved "Design System Overhaul" to Done' },
      { project: project1._id, user: demoUser._id, action: 'comment_added', details: 'commented on "Implement Dark Mode"' }
    ]);

    console.log('📈 Created Activities');

    console.log('\n=======================================');
    console.log('🎉 SEEDING COMPLETE!');
    console.log('Demo Login Credentials:');
    console.log('Email: demo@nova.com');
    console.log('Password: demo123');
    console.log('=======================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
