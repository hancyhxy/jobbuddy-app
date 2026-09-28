// Fictional demo data. No real participants, hosts or venues.

export const FIELDS = ['Design', 'Software', 'Data', 'Product', 'Marketing', 'Research'];
export const STAGES = ['Studying', 'Looking for work', 'Working', 'Switching careers', 'Hiring'];
export const INTERESTS = ['AI tools', 'UX', 'Startups', 'Portfolio', 'Interviews', 'Data viz', 'Career change', 'Mentoring', 'Side projects', 'Networking'];
export const AVATAR_CHOICES = ['female_1_0', 'female_2_1', 'female_3_2', 'female_4_0', 'male_0_1', 'male_1_2', 'male_2_0', 'male_4_1'];
export const AVATAR_COLORS = ['#D7FF3A', '#7CE0C3', '#8FB8FF', '#FF9E7A', '#E7A6FF', '#FFD166'];

export const PEOPLE = {
  marcus: { id: 'marcus', name: 'Marcus Rivera', short: 'Marcus', field: 'Data', headline: 'Teacher → data analyst', interests: ['Career change', 'Data viz', 'Interviews'], fact: 'Has taught 900 Year 9s to love graphs.', avatar: 'male_2_1', color: '#8FB8FF', responds: 'yes' },
  david: { id: 'david', name: 'David Park', short: 'David', field: 'Product', headline: 'Senior PM · mentors on weekends', interests: ['Mentoring', 'Startups', 'AI tools'], fact: 'Shipped a product used on the International Space Station.', avatar: 'male_1_0', color: '#FFD166', responds: 'yes' },
  priya: { id: 'priya', name: 'Priya Nair', short: 'Priya', field: 'Software', headline: 'ML engineer', interests: ['AI tools', 'Side projects', 'Portfolio'], fact: 'Builds robot plant waterers.', avatar: 'female_3_1', color: '#7CE0C3', responds: 'later' },
  sofia: { id: 'sofia', name: 'Sofia Rossi', short: 'Sofia', field: 'Research', headline: 'UX researcher', interests: ['UX', 'Interviews', 'Mentoring'], fact: 'Interviewed 300 people about their fridges.', avatar: 'female_1_2', color: '#E7A6FF', responds: 'yes' },
  leo: { id: 'leo', name: 'Leo Tan', short: 'Leo', field: 'Design', headline: 'Interaction design student', interests: ['UX', 'Portfolio', 'Side projects'], fact: 'Draws every train he catches.', avatar: 'male_4_0', color: '#FF9E7A', responds: 'yes' },
  ahmed: { id: 'ahmed', name: 'Ahmed Khan', short: 'Ahmed', field: 'Software', headline: 'Engineering manager · hiring grads', interests: ['Interviews', 'Startups', 'Networking'], fact: 'Runs a 5am harbour swim club.', avatar: 'male_3_2', color: '#7CE0C3', responds: 'yes' },
  maya: { id: 'maya', name: 'Maya Chen', short: 'Maya', field: 'Product', headline: 'Community host · Harbour Builders', interests: ['Startups', 'AI tools', 'Networking'], fact: 'Has hosted 48 build nights.', avatar: 'female_2_0', color: '#D7FF3A', responds: 'yes' }
};

export const EVENTS = [
  {
    id: 'build-night', img: 'covers/build-night.jpg', mode: 'offline', title: 'Build Night: AI Agents in Practice', circle: 'Harbour Builders',
    date: 'Sat 19 Sep', time: '17:30 – 20:30', when: 'This Saturday', venue: 'Harbour Commons, Surry Hills', distance: '2.1 km',
    cost: 'Free', capacity: 60, going: 47, approval: true, badges: true, host: 'maya', cover: ['#D7FF3A', '#1E3A2F'],
    audience: 'Builders, designers and career changers curious about AI agents. No experience needed.',
    agenda: [['17:30', 'Check-in & collect badges'], ['18:00', 'Lightning talks · 3 × 7 min'], ['18:30', 'Build & chat — open floor'], ['20:15', 'Demos & badge return']],
    attendees: ['marcus', 'david', 'priya', 'sofia', 'ahmed'], tags: ['AI tools', 'Startups']
  },
  {
    id: 'switch-ux', img: 'covers/switch-ux.jpg', mode: 'online', title: 'Career Switch Stories: Into UX', circle: 'Switchers Circle',
    date: 'Wed 23 Sep', time: '18:00 – 19:15 AEST', when: 'Next Wednesday', platform: 'Zoom (link in app)',
    cost: 'Free', capacity: 200, going: 132, approval: false, badges: false, host: 'sofia', cover: ['#E7A6FF', '#2A1838'],
    audience: 'Anyone moving into UX from another field. Cameras optional.',
    agenda: [['18:00', 'Three switch stories'], ['18:35', 'Wave & 5-min chats'], ['18:55', 'Open Q&A']],
    attendees: ['marcus', 'leo', 'david', 'sofia'], tags: ['UX', 'Career change'], recording: true
  },
  {
    id: 'crit-circle', img: 'covers/crit-circle.jpg', mode: 'offline', title: 'Portfolio Crit Circle', circle: 'UTS Design Crowd',
    date: 'Thu 24 Sep', time: '18:00 – 20:00', when: 'Next Thursday', venue: 'UTS Building 2, Ultimo', distance: '0.4 km',
    cost: 'Free', capacity: 30, going: 22, approval: false, badges: true, host: 'leo', cover: ['#FF9E7A', '#3A1E14'],
    audience: 'Students and juniors who want honest feedback on one portfolio piece.',
    agenda: [['18:00', 'Check-in'], ['18:15', 'Crit rounds'], ['19:40', 'Wrap up']],
    attendees: ['leo', 'sofia', 'priya'], tags: ['Portfolio', 'UX']
  },
  {
    id: 'data-ama', img: 'covers/data-ama.jpg', mode: 'online', title: 'Data Careers AMA', circle: 'Data Folks',
    date: 'Tue 29 Sep', time: '12:30 – 13:15 AEST', when: 'In 2 weeks', platform: 'Zoom (link in app)',
    cost: 'Free', capacity: 300, going: 88, approval: false, badges: false, host: 'marcus', cover: ['#8FB8FF', '#14223A'],
    audience: 'Grads and switchers asking what data jobs are really like.',
    agenda: [['12:30', 'Panel'], ['12:55', 'Questions']], attendees: ['marcus', 'priya'], tags: ['Data viz', 'Interviews']
  },
  {
    id: 'mixer', img: 'covers/mixer.jpg', mode: 'offline', title: 'Sydney Tech Mixer', circle: 'Sydney Tech',
    date: 'Fri 2 Oct', time: '18:00 – 21:00', when: 'In 2 weeks', venue: 'The Rocks, Sydney', distance: '4.8 km',
    cost: '$15', capacity: 120, going: 95, approval: false, badges: true, host: 'ahmed', cover: ['#FFD166', '#3A2E10'],
    audience: 'Meet engineers, designers and hiring managers.',
    agenda: [['18:00', 'Doors'], ['19:00', 'Hiring lightning round']], attendees: ['ahmed', 'david'], tags: ['Networking', 'Interviews']
  }
];

export const SEED_POSTS = [
  { id: 'p1', author: 'david', circle: 'Harbour Builders', type: 'Offer help', text: 'Happy to do 20-min PM mock interviews for anyone who came to last week’s build night. Reply here and I’ll share slots.', stars: 14, ago: '2h' },
  { id: 'p2', author: 'marcus', circle: 'Switchers Circle', type: 'Takeaway', text: 'Biggest lesson from switching: my teaching portfolio WAS a data portfolio. Reframed 3 lesson plans as dashboards and got two callbacks.', stars: 31, ago: '5h' },
  { id: 'p3', author: 'priya', circle: 'Harbour Builders', type: 'Resource', text: 'The agent-eval checklist from my talk is now public. Built for people who have never shipped an agent.', stars: 22, ago: '1d' },
  { id: 'p4', author: 'sofia', circle: 'UTS Design Crowd', type: 'Question', text: 'Juniors: what would make a portfolio crit feel less scary? Designing Thursday’s format now.', stars: 6, ago: '1d' }
];

export const PROMPTS = {
  shared: (tag) => [
    `You both picked “${tag}”. What’s one thing about it you changed your mind on this year?`,
    `You both picked “${tag}”. What got you into it?`
  ],
  offer: [
    'One of you is further along. What do you wish you knew a year ago?',
    'What’s the smallest thing someone could do to help you this month?'
  ]
};
