import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanager';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Lazy import models after connection
  const { User } = await import('../models/User');
  const { Project, Task, Activity } = await import('../models');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
    Activity.deleteMany({}),
  ]);
  console.log('🗑  Cleared existing data');

  // ─── Users ────────────────────────────────────────────────
  const admin = await User.create({
    name: 'Alex Morgan',
    email: 'admin@taskmanager.dev',
    password: 'Admin@123',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  });

  const alice = await User.create({
    name: 'Alice Chen',
    email: 'alice@taskmanager.dev',
    password: 'Member@123',
    role: 'member',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
  });

  const bob = await User.create({
    name: 'Bob Johnson',
    email: 'bob@taskmanager.dev',
    password: 'Member@123',
    role: 'member',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
  });

  const carol = await User.create({
    name: 'Carol Williams',
    email: 'carol@taskmanager.dev',
    password: 'Member@123',
    role: 'member',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
  });

  console.log('👤 Created 4 users');

  // ─── Projects ─────────────────────────────────────────────
  const project1 = await Project.create({
    title: 'TaskManager Platform v2.0',
    description: 'Major redesign and feature expansion of the TaskManager platform.',
    status: 'active',
    owner: admin._id,
    members: [admin._id, alice._id, bob._id, carol._id],
  });

  const project2 = await Project.create({
    title: 'Mobile App Launch',
    description: 'iOS and Android native applications for TaskManager.',
    status: 'active',
    owner: alice._id,
    members: [alice._id, bob._id, admin._id],
  });

  const project3 = await Project.create({
    title: 'Marketing Website',
    description: 'Redesigned marketing site with new branding.',
    status: 'completed',
    owner: admin._id,
    members: [admin._id, carol._id],
  });

  console.log('📁 Created 3 projects');

  // ─── Tasks ────────────────────────────────────────────────
  const tasks = [
    // Project 1 tasks
    { title: 'Design new dashboard layout', status: 'completed', priority: 'high', project: project1._id, assignedTo: alice._id, createdBy: admin._id, dueDate: new Date('2024-12-01'), tags: ['design', 'ui'] },
    { title: 'Implement authentication system', status: 'completed', priority: 'urgent', project: project1._id, assignedTo: bob._id, createdBy: admin._id, tags: ['backend', 'security'] },
    { title: 'Build project management APIs', status: 'in_progress', priority: 'high', project: project1._id, assignedTo: bob._id, createdBy: admin._id, dueDate: new Date('2024-12-20'), tags: ['backend', 'api'] },
    { title: 'Create kanban board component', status: 'in_progress', priority: 'high', project: project1._id, assignedTo: alice._id, createdBy: admin._id, dueDate: new Date('2024-12-25'), tags: ['frontend', 'react'] },
    { title: 'Write API documentation', status: 'todo', priority: 'medium', project: project1._id, assignedTo: carol._id, createdBy: admin._id, dueDate: new Date('2025-01-10'), tags: ['docs'] },
    { title: 'Set up CI/CD pipeline', status: 'review', priority: 'high', project: project1._id, assignedTo: admin._id, createdBy: admin._id, dueDate: new Date('2024-12-18'), tags: ['devops'] },
    { title: 'Performance optimization audit', status: 'todo', priority: 'medium', project: project1._id, assignedTo: bob._id, createdBy: admin._id, dueDate: new Date('2025-01-15'), tags: ['performance'] },
    { title: 'Implement dark mode support', status: 'todo', priority: 'low', project: project1._id, assignedTo: alice._id, createdBy: admin._id, tags: ['frontend', 'ui'] },

    // Project 2 tasks
    { title: 'React Native project setup', status: 'completed', priority: 'urgent', project: project2._id, assignedTo: bob._id, createdBy: alice._id, tags: ['mobile', 'setup'] },
    { title: 'Design mobile UI mockups', status: 'completed', priority: 'high', project: project2._id, assignedTo: alice._id, createdBy: alice._id, tags: ['design', 'mobile'] },
    { title: 'Implement push notifications', status: 'in_progress', priority: 'high', project: project2._id, assignedTo: bob._id, createdBy: alice._id, dueDate: new Date('2024-12-30'), tags: ['mobile', 'notifications'] },
    { title: 'App Store submission prep', status: 'todo', priority: 'urgent', project: project2._id, assignedTo: alice._id, createdBy: alice._id, dueDate: new Date('2025-01-20'), tags: ['mobile', 'deployment'] },

    // Project 3 tasks
    { title: 'Homepage redesign', status: 'completed', priority: 'high', project: project3._id, assignedTo: carol._id, createdBy: admin._id, tags: ['design', 'marketing'] },
    { title: 'SEO optimization', status: 'completed', priority: 'medium', project: project3._id, assignedTo: carol._id, createdBy: admin._id, tags: ['seo', 'marketing'] },
    { title: 'Analytics integration', status: 'completed', priority: 'low', project: project3._id, assignedTo: admin._id, createdBy: admin._id, tags: ['analytics'] },
  ];

  await Task.insertMany(tasks);
  console.log(`✅ Created ${tasks.length} tasks`);

  // ─── Activities ───────────────────────────────────────────
  const activities = [
    { type: 'project_created', user: admin._id, project: project1._id, message: 'Created project "TaskManager Platform v2.0"' },
    { type: 'project_created', user: alice._id, project: project2._id, message: 'Created project "Mobile App Launch"' },
    { type: 'task_completed', user: alice._id, project: project1._id, message: 'Completed task "Design new dashboard layout"' },
    { type: 'task_assigned', user: admin._id, project: project1._id, message: 'Assigned "Build project management APIs" to Bob Johnson' },
    { type: 'member_added', user: admin._id, project: project1._id, message: 'Added Carol Williams to project' },
    { type: 'task_created', user: admin._id, project: project1._id, message: 'Created task "Performance optimization audit"' },
  ];

  await Activity.insertMany(activities);
  console.log('📋 Created activity logs');

  console.log('\n🎉 Seed complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Demo Credentials:');
  console.log('  Admin   → admin@taskmanager.dev / Admin@123');
  console.log('  Member  → alice@taskmanager.dev / Member@123');
  console.log('  Member  → bob@taskmanager.dev   / Member@123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});