// Fictional demo data. No real participants, hosts or venues.

export const FIELDS = ['Design', 'Software', 'Data', 'Product', 'Marketing', 'Research'];
export const STAGES = ['Studying', 'Looking for work', 'Working', 'Switching careers', 'Hiring'];
export const INTERESTS = ['AI tools', 'UX', 'Startups', 'Portfolio', 'Interviews', 'Data viz', 'Career change', 'Mentoring', 'Side projects', 'Networking'];
export const AVATAR_CHOICES = ['female_1_0', 'female_2_1', 'female_3_2', 'female_4_0', 'male_0_1', 'male_1_2', 'male_2_0', 'male_4_1'];
export const AVATAR_COLORS = ['#D7FF3A', '#7CE0C3', '#8FB8FF', '#FF9E7A', '#E7A6FF', '#FFD166'];

export const PEOPLE = {
  marcus: { id: 'marcus', photo: 'people/marcus.jpg', name: 'Marcus Rivera', short: 'Marcus', field: 'Data', headline: 'Teacher → data analyst', interests: ['Career change', 'Data viz', 'Interviews'], fact: 'Has taught 900 Year 9s to love graphs.', avatar: 'male_2_1', color: '#8FB8FF', responds: 'yes' },
  david: { id: 'david', photo: 'people/david.jpg', name: 'David Park', short: 'David', field: 'Product', headline: 'Senior PM · mentors on weekends', interests: ['Mentoring', 'Startups', 'AI tools'], fact: 'Shipped a product used on the International Space Station.', avatar: 'male_1_0', color: '#FFD166', responds: 'yes' },
  priya: { id: 'priya', photo: 'people/priya.jpg', name: 'Priya Nair', short: 'Priya', field: 'Software', headline: 'ML engineer', interests: ['AI tools', 'Side projects', 'Portfolio'], fact: 'Builds robot plant waterers.', avatar: 'female_3_1', color: '#7CE0C3', responds: 'later' },
  sofia: { id: 'sofia', photo: 'people/sofia.jpg', name: 'Sofia Rossi', short: 'Sofia', field: 'Research', headline: 'UX researcher', interests: ['UX', 'Interviews', 'Mentoring'], fact: 'Interviewed 300 people about their fridges.', avatar: 'female_1_2', color: '#E7A6FF', responds: 'yes' },
  leo: { id: 'leo', photo: 'people/leo.jpg', name: 'Leo Tan', short: 'Leo', field: 'Design', headline: 'Interaction design student', interests: ['UX', 'Portfolio', 'Side projects'], fact: 'Draws every train he catches.', avatar: 'male_4_0', color: '#FF9E7A', responds: 'yes' },
  ahmed: { id: 'ahmed', photo: 'people/ahmed.jpg', name: 'Ahmed Khan', short: 'Ahmed', field: 'Software', headline: 'Engineering manager · hiring grads', interests: ['Interviews', 'Startups', 'Networking'], fact: 'Runs a 5am harbour swim club.', avatar: 'male_3_2', color: '#7CE0C3', responds: 'yes' },
  hannah: { id: 'hannah', photo: 'people/hannah.jpg', name: 'Hannah Wright', short: 'Hannah', field: 'Marketing', headline: 'Growth marketer · ex-agency', interests: ['AI tools', 'Networking', 'Career change'], fact: 'Once ran a campaign for a cat café chain.', avatar: 'female_4_1', color: '#FF9E7A', responds: 'yes' },
  maya: { id: 'maya', photo: 'people/maya.jpg', name: 'Maya Chen', short: 'Maya', field: 'Product', headline: 'Community host · Harbour Builders', interests: ['Startups', 'AI tools', 'Networking'], fact: 'Has hosted 48 build nights.', avatar: 'female_2_0', color: '#D7FF3A', responds: 'yes' }
};

export const EVENTS = [
  {
    id: 'coffee-meetup', mode: 'offline', title: 'Junior Designers Coffee Meetup', circle: 'UTS Design Crowd',
    date: 'Fri 18 Sep', time: '11:30 – 13:30', when: 'Now', venue: 'Single O, Surry Hills', distance: '1.2 km',
    cost: 'Free', capacity: 25, going: 18, approval: false, badges: true, host: 'sofia', cover: ['#7CE0C3', '#123A30'],
    audience: 'Junior and student designers meeting over coffee. Bring one question about your first design job.',
    agenda: [['11:30', 'Arrive & collect Tappy devices'], ['11:45', 'Intro round'], ['12:15', 'Coffee & tap to talk'], ['13:15', 'Wrap up & Tappy return']],
    attendees: ['leo', 'sofia', 'hannah', 'marcus', 'priya'], tags: ['UX', 'Portfolio', 'Networking']
  },
  {
    id: 'build-night', img: 'covers/build-night.jpg', mode: 'offline', title: 'Build Night: AI Agents in Practice', circle: 'Harbour Builders',
    date: 'Sat 19 Sep', time: '17:30 – 20:30', when: 'This Saturday', venue: 'Harbour Commons, Surry Hills', distance: '2.1 km',
    cost: 'Free', capacity: 60, going: 47, approval: true, badges: true, host: 'maya', cover: ['#D7FF3A', '#1E3A2F'],
    audience: 'Builders, designers and career changers curious about AI agents. No experience needed.',
    agenda: [['17:30', 'Check-in & collect Tappy devices'], ['18:00', 'Lightning talks · 3 × 7 min'], ['18:30', 'Build & chat — open floor'], ['20:15', 'Demos & Tappy return']],
    attendees: ['marcus', 'david', 'priya', 'sofia', 'ahmed', 'hannah', 'leo'], tags: ['AI tools', 'Startups']
  },
  {
    id: 'switch-ux', img: 'covers/switch-ux.jpg', mode: 'online', title: 'Career Switch Stories: Into UX', circle: 'Switchers Circle',
    date: 'Wed 23 Sep', time: '18:00 – 19:15 AEST', when: 'Next Wednesday', platform: 'Zoom (link in app)',
    cost: 'Free', capacity: 200, going: 132, approval: false, badges: false, host: 'sofia', cover: ['#E7A6FF', '#2A1838'],
    audience: 'Anyone moving into UX from another field. Cameras optional.',
    agenda: [['18:00', 'Three switch stories'], ['18:35', 'Wave & 5-min chats'], ['18:55', 'Open Q&A']],
    attendees: ['marcus', 'david', 'hannah', 'ahmed'], tags: ['UX', 'Career change'], recording: true
  },
  {
    id: 'crit-circle', img: 'covers/crit-circle.jpg', mode: 'offline', title: 'Portfolio Crit Circle', circle: 'UTS Design Crowd',
    date: 'Thu 24 Sep', time: '18:00 – 20:00', when: 'Next Thursday', venue: 'UTS Building 2, Ultimo', distance: '0.4 km',
    cost: 'Free', capacity: 30, going: 30, approval: false, waitlist: true, waitPos: 3, badges: true, host: 'leo', cover: ['#FF9E7A', '#3A1E14'],
    audience: 'Students and juniors who want honest feedback on one portfolio piece.',
    agenda: [['18:00', 'Check-in'], ['18:15', 'Crit rounds'], ['19:40', 'Wrap up']],
    attendees: ['sofia', 'priya', 'marcus'], tags: ['Portfolio', 'UX']
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

// A past event the demo account attended, so the After view has content from the start.
EVENTS.push({
  id: 'portfolio-night', img: 'covers/portfolio-night.jpg', past: true, mode: 'offline', title: 'Portfolio Night: Career Swap', circle: 'UTS Design Crowd',
  date: 'Sat 13 Sep', time: '18:30 – 20:30', when: 'Last Saturday', venue: 'Local Design Studio, Newtown', distance: '3.2 km',
  cost: 'Free', capacity: 30, going: 24, approval: false, badges: true, host: 'sofia', cover: ['#7CE0C3', '#123A30'],
  audience: 'A relaxed evening to trade portfolio feedback across disciplines. Bring one piece you’re stuck on.',
  agenda: [['18:30', 'Check-in & Tappy pick-up'], ['19:00', 'Swap rounds'], ['20:15', 'Tappy return']],
  attendees: ['leo', 'marcus', 'sofia', 'hannah', 'david', 'priya'], tags: ['Portfolio', 'UX']
});

// More past events so the Past row on Home scrolls sideways.
EVENTS.push({
  id: 'ux-breakfast', img: 'covers/ux-breakfast.jpg', past: true, mode: 'offline', title: 'UX Breakfast Club', circle: 'UTS Design Crowd',
  date: 'Wed 10 Sep', time: '08:00 – 09:30', when: 'Last week', venue: 'Paramount Coffee, Surry Hills', distance: '1.5 km',
  cost: 'Free', capacity: 20, going: 16, approval: false, badges: true, host: 'leo', cover: ['#FFD166', '#3A2E10'],
  audience: 'Early-bird designers swapping one UX win and one struggle over breakfast.',
  agenda: [['08:00', 'Coffee & intros'], ['08:30', 'Win / struggle round'], ['09:15', 'Wrap up']],
  attendees: ['leo', 'sofia', 'hannah'], tags: ['UX', 'Networking']
}, {
  id: 'ai-tools-jam', img: 'covers/ai-tools-jam.jpg', past: true, mode: 'online', title: 'AI Tools Jam for Designers', circle: 'Harbour Builders',
  date: 'Thu 4 Sep', time: '18:00 – 19:00 AEST', when: '2 weeks ago', platform: 'Zoom (link in app)',
  cost: 'Free', capacity: 150, going: 96, approval: false, badges: false, host: 'maya', cover: ['#E7A6FF', '#2A1838'],
  audience: 'Show-and-tell of AI tools in real design workflows.',
  agenda: [['18:00', 'Demos'], ['18:40', 'Q&A']], attendees: ['maya', 'priya', 'david'], tags: ['AI tools', 'UX']
}, {
  id: 'grad-panel', img: 'covers/grad-panel.jpg', past: true, mode: 'offline', title: 'Grad Hiring Panel', circle: 'Sydney Tech',
  date: 'Tue 26 Aug', time: '18:00 – 20:00', when: '3 weeks ago', venue: 'UTS Building 11, Ultimo', distance: '0.5 km',
  cost: 'Free', capacity: 80, going: 72, approval: false, badges: true, host: 'ahmed', cover: ['#8FB8FF', '#14223A'],
  audience: 'Hiring managers explain what they look for in grad applications.',
  agenda: [['18:00', 'Panel'], ['19:00', 'Mingle']], attendees: ['ahmed', 'david', 'marcus'], tags: ['Interviews', 'Networking']
});

// Extra upcoming events nobody has registered for yet, so Picks for you shows fresh events.
EVENTS.push({
  id: 'women-product', img: 'covers/women-product.jpg', mode: 'offline', title: 'Women in Product Brunch', circle: 'Product People',
  date: 'Sun 4 Oct', time: '10:30 – 12:30', when: 'In 2 weeks', venue: 'The Cutaway, Barangaroo', distance: '3.4 km',
  cost: '$20', capacity: 40, going: 31, approval: true, badges: true, host: 'hannah', cover: ['#F6C9B0', '#2E3B2C'],
  audience: 'Women and allies in product sharing roadmaps, career moves and brunch.',
  agenda: [['10:30', 'Brunch & intros'], ['11:15', 'Roadmap swap'], ['12:15', 'Wrap up']],
  attendees: ['hannah', 'maya', 'priya'], tags: ['Startups', 'Networking']
}, {
  id: 'cv-teardown', img: 'covers/cv-teardown.jpg', mode: 'online', title: 'Live CV Teardown', circle: 'Switchers Circle',
  date: 'Wed 7 Oct', time: '19:00 – 20:00 AEST', when: 'In 3 weeks', platform: 'Zoom (link in app)',
  cost: 'Free', capacity: 250, going: 164, approval: false, badges: false, host: 'david', cover: ['#B6FF3B', '#0B0B0B'],
  audience: 'Volunteer CVs reviewed live by hiring managers. Learn what gets shortlisted.',
  agenda: [['19:00', 'Teardowns'], ['19:40', 'Q&A']], attendees: ['david', 'ahmed', 'marcus'], tags: ['Interviews', 'Career change']
});

/* Tappy profile (Week 9 revision): one core profile reused for every event,
   plus a few questions the host sets per event. Personality/MBTI is optional and never shown on the device. */
export const BUDDY = {
  career: ['Design', 'Engineering', 'Product', 'Marketing', 'Student', 'Other'],
  level: ['Beginner', 'Intermediate', 'Experienced'],
  looking: ['Mentor', 'Collaborator', 'New job', 'Just meeting people'],
  vibe: ['Small groups, deep conversations', 'Room-wide, high energy mingling'],
  hobbies: ['Music', 'Hiking', 'Reading', 'Gaming', 'Travel', 'Cooking', 'Art', 'Movies', 'Sports', 'Photography'],
  mbti: ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP']
};
export const EVENT_Q = {
  hoping: ['Portfolio feedback', 'Career advice', 'Meeting other juniors', 'Job leads', 'Just chatting'],
  open: ['Yes, all in', 'A little', 'Just here to chat'],
  skill: ['New to it', 'Some experience', 'Advanced']
};
export const DEFAULT_AUTO_REPLY = 'Great meeting you today — let’s keep in touch 👋';
// Career-focused icebreakers shown on both devices after a link. Picked fresh each time, not from personality answers.
export const ICEBREAKERS = [
  'What’s one thing you’d tell your first-year self about this career?',
  'What’s one skill you’re trying to build this year?',
  'What’s the best piece of feedback you’ve ever had on your work?',
  'What did you almost do instead of this career?',
  'What’s a small win from your last month?'
];
// What each person's auto-reply says when they accept a connection request.
export const AUTO_REPLY = {
  marcus: 'Loved swapping career-change stories — let’s grab a coffee sometime',
  david: 'Great meeting you! Happy to look at your portfolio flow',
  priya: 'Nice to meet you — send me that side project link!',
  sofia: 'So good chatting! Bring a case study to crit circle',
  leo: 'Hey! Keep me posted on your internship applications',
  hannah: 'Great meeting you today, let’s keep in touch',
  ahmed: 'Good chat — ping me when grad applications open',
  maya: 'Thanks for coming! See you at the next one'
};
// Shared after the event (Event Circle memories). Open for 7 days, then archived.
export const MEMORY_SEED = {
  'portfolio-night': [
    { by: 'sofia', text: 'Loved the portfolio review roundtable — such useful feedback!', day: 1, seed: 3 },
    { by: 'leo', text: 'Made a genuine connection over career-change stories and design sketches.', day: 1, seed: 5 },
    { by: 'marcus', text: 'Notes from the swap round: lead with the problem, not the tool.', day: 2, seed: 1 }
  ]
};
export const EVENT_CHAT_SEED = {
  'portfolio-night': [['sofia', 'Anyone have the slides from the roundtable?'], ['leo', 'Uploading them to the circle tonight!']]
};

// Demo social graph for the logged-in account: mutual follows = Connections.
export const SEED_GRAPH = { following: ['priya', 'sofia', 'leo', 'hannah', 'maya'], followers: ['priya', 'sofia', 'leo', 'hannah', 'maya', 'marcus', 'ahmed'] };
export const FOLLOWS_BACK = ['david']; // people who follow back a few seconds after you follow them (demo)

// Public = anyone on JobBuddy. Circle = members of that event circle only (private).
export const SEED_POSTS = [
  { id: 'p1', author: 'david', circle: 'Harbour Builders', aud: 'circle', type: 'Offer help', text: 'Happy to do 20-min PM mock interviews for anyone who came to last week’s build night. Reply here and I’ll share slots.', helpful: 14, comments: 6, ago: '2h' },
  { id: 'p2', author: 'marcus', circle: 'Switchers Circle', aud: 'public', type: 'Takeaway', text: 'Biggest lesson from switching: my teaching portfolio WAS a data portfolio. Reframed 3 lesson plans as dashboards and got two callbacks.', helpful: 31, comments: 12, ago: '5h' },
  { id: 'p3', author: 'priya', circle: 'Harbour Builders', aud: 'circle', type: 'Resource', text: 'The agent-eval checklist from my talk is pinned in the circle. Built for people who have never shipped an agent.', helpful: 22, comments: 4, ago: '1d' },
  { id: 'p4', author: 'sofia', circle: 'UTS Design Crowd', aud: 'public', type: 'Question', text: 'Juniors: what would make a portfolio crit feel less scary? Designing Thursday’s format now.', helpful: 6, comments: 18, ago: '1d' },
  { id: 'p5', author: 'hannah', circle: 'Sydney Tech', aud: 'public', type: 'Going together', text: 'Going to the Sydney Tech Mixer alone on Friday — anyone want to walk in together? I’ll be at the door at 6.', helpful: 3, comments: 9, ago: '3h' },
  { id: 'p6', author: 'ahmed', circle: 'Sydney Tech', aud: 'public', type: 'Referral', text: 'My team is hiring 2 grad engineers (Feb start). Happy to refer people I’ve actually talked to — say hi at the mixer first.', helpful: 41, comments: 23, ago: '6h' },
  { id: 'p7', author: 'leo', circle: 'UTS Design Crowd', aud: 'circle', type: 'Win', text: 'Got my first design internship!! The crit circle feedback on my case study is literally what the interviewer asked about. Thank you all 🙏', helpful: 27, comments: 15, ago: '8h' },
  { id: 'p8', author: 'maya', circle: 'Harbour Builders', aud: 'circle', type: 'Question', text: 'Next build night theme vote: (a) voice agents (b) agents for spreadsheets (c) evals deep-dive. Reply with a letter.', helpful: 9, comments: 31, ago: '2d' }
];

export const SEED_COMMENTS = {
  p5: [['sofia', 'I’ll be there around 6:15, count me in!'], ['leo', 'Same, first time at this one.']],
  p4: [['leo', 'Knowing the format in advance. Surprise questions are the scary part.'], ['priya', 'Pair juniors with one “friendly” reviewer.']],
  p2: [['hannah', 'Saving this. Doing the same with agency case studies.']]
};

// Growth system — generic, not rank-metal names.
export const POINT_RULES = [
  ['Publish a post', 10], ['Share an event takeaway', 15], ['Comment on a post', 3], ['Your post is marked helpful', 5],
  ['Someone comments on your post', 2], ['Check in at an event', 20], ['Make a new connection', 5]
];
export const LEVELS = [
  [0, 'Newcomer'], [100, 'Explorer'], [300, 'Contributor'], [700, 'Connector'], [1500, 'Mentor'], [3000, 'Community Leader']
];
export const LEVEL_PERKS = [
  'Register for events, post and comment',
  'Your posts appear in “Picked for you” feeds',
  'Contributor tag on your profile and posts',
  'Start a “Going together” group for any event',
  'Offer mock interviews and earn points for each',
  'Co-host events with organisers'
];
export const RULE_ICONS = ['✍️', '📝', '💬', '✨', '📨', '📍', '🤝'];
export const REDEEM = [
  { id: 'cv', title: 'Extra AI CV review', desc: 'One more AI review after your free ones', cost: 30 },
  { id: 'mock', title: 'Extra mock interview', desc: 'Book a practitioner beyond your free session', cost: 80 },
  { id: 'spot', title: 'Priority spot', desc: 'Skip the waitlist at one approval-only event', cost: 150 }
];
export const PRACTITIONERS = [
  { id: 'david', role: 'Product manager interviews', slots: ['Tue 18:30', 'Thu 12:00', 'Sat 10:00'] },
  { id: 'ahmed', role: 'Graduate engineering interviews', slots: ['Wed 19:00', 'Fri 08:00'] },
  { id: 'sofia', role: 'UX research & design interviews', slots: ['Mon 17:30', 'Thu 18:00'] }
];
export const POST_TYPES = ['Question', 'Takeaway', 'Resource', 'Offer help', 'Referral', 'Going together', 'Win'];

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
