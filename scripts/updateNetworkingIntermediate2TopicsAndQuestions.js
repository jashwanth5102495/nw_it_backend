require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = 'networking-intermediate-2';

// Flexible schema for direct updates
const assignmentSchema = new mongoose.Schema({ assignmentId: String }, { strict: false });
const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

// Topics 1–10 provided by user
const topics = [
  {
    topicId: 'stateful-vs-stateless',
    title: 'Stateful vs Stateless Firewalls in Linux',
    content: 'Firewalls in Linux can operate in stateful or stateless modes. A stateless firewall evaluates each packet independently, without considering previous packets. It only checks packet headers such as source IP, destination IP, port, and protocol. While simple and fast, stateless firewalls lack context and are less secure.\n\nStateful firewalls, on the other hand, track the state of network connections. They understand whether a packet is part of a new connection, an established one, or a related session. Linux firewalls like iptables and nftables use connection tracking to implement stateful filtering.\n\nStateful firewalls are essential for modern networks because they allow return traffic automatically while blocking unsolicited packets. This provides stronger security with fewer rules and reduces administrative complexity.'
  },
  {
    topicId: 'conntrack-internals',
    title: 'Connection Tracking (conntrack) Internals',
    content: 'Connection tracking, commonly known as conntrack, is a kernel feature that tracks the lifecycle of network connections. Each connection is stored in a table with information such as source/destination IPs, ports, protocol, and connection state.\n\nConntrack enables advanced firewall features such as stateful filtering, NAT, and connection-based logging. It classifies traffic into states like NEW, ESTABLISHED, RELATED, and INVALID.\n\nUnderstanding conntrack internals is critical for firewall optimization and troubleshooting. Large networks must manage conntrack table size carefully to avoid performance degradation or dropped connections.'
  },
  {
    topicId: 'dynamic-firewall-evaluation',
    title: 'Dynamic Firewall Rule Evaluation',
    content: 'Dynamic firewall rule evaluation allows Linux firewalls to change behavior based on traffic patterns instead of relying only on static rules. This means firewall decisions can adapt in real time based on connection rate, session history, or detected anomalies.\n\nDynamic rules improve security by responding to threats automatically. For example, repeated failed login attempts from an IP can trigger temporary blocking without administrator intervention.\n\nThis approach is particularly useful for protecting exposed services such as SSH, web servers, and APIs against automated attacks.'
  },
  {
    topicId: 'rule-ordering-optimization',
    title: 'Firewall Rule Ordering and Optimization',
    content: 'Firewall rules are evaluated sequentially from top to bottom. Rule ordering directly impacts both security effectiveness and performance. Poorly ordered rules can lead to unintended access or unnecessary CPU usage.\n\nOptimized firewall design places the most frequently matched rules at the top and drops unwanted traffic early. Grouping rules logically and avoiding redundancy improves maintainability and efficiency.\n\nRule optimization is essential in high-traffic environments where firewalls process thousands of packets per second.'
  },
  {
    topicId: 'rate-limiting-strategies',
    title: 'Rate Limiting Strategies in Firewalls',
    content: 'Rate limiting controls how many packets or connections are allowed within a specific time window. This technique protects systems from brute-force attacks, floods, and denial-of-service attempts.\n\nLinux firewalls can enforce rate limits based on IP address, protocol, or service. This ensures legitimate users are served while abusive traffic is restricted.\n\nRate limiting is a critical layer of defense in modern security architectures, especially for publicly accessible services.'
  },
  {
    topicId: 'temporary-ip-blocking',
    title: 'Temporary IP Blocking Mechanisms',
    content: 'Temporary IP blocking allows a firewall to block suspicious IPs for a limited time instead of permanently banning them. This approach balances security and usability.\n\nLinux firewalls can track repeated offenses and automatically apply temporary bans. Once the ban expires, the IP is allowed again without manual intervention.\n\nThis mechanism is effective against automated attacks while minimizing false positives that could block legitimate users.'
  },
  {
    topicId: 'time-based-rules',
    title: 'Time-Based Firewall Rules',
    content: 'Time-based firewall rules allow traffic to be permitted or denied based on specific time periods. This is useful for enforcing business-hour access policies or maintenance windows.\n\nFor example, administrative access may be allowed only during working hours, while external access is blocked overnight. Time-based rules enhance security by reducing the attack surface.\n\nThese rules are commonly used in enterprise environments to enforce compliance and operational policies.'
  },
  {
    topicId: 'geoip-filtering',
    title: 'Geo-IP Based Firewall Filtering',
    content: 'Geo-IP filtering blocks or allows traffic based on the geographic location of IP addresses. This helps reduce attack exposure by limiting access to regions where legitimate users are located.\n\nLinux firewalls can integrate IP-to-country databases to implement geo-based filtering. While not foolproof, this adds an additional security layer.\n\nGeo-IP filtering is often used for web applications, APIs, and enterprise gateways.'
  },
  {
    topicId: 'application-aware-firewalling',
    title: 'Application-Aware Firewalling',
    content: 'Application-aware firewalling goes beyond ports and protocols to understand application behavior. Instead of just allowing port 80, the firewall can distinguish between different types of traffic on the same port.\n\nThis improves security by preventing misuse of allowed ports and detecting abnormal application behavior. It is especially important in environments where multiple services share common ports.\n\nLinux firewalls can achieve application awareness through deep packet inspection and connection tracking.'
  },
  {
    topicId: 'firewall-performance-tuning',
    title: 'Firewall Rule Performance Tuning',
    content: 'Firewall performance tuning ensures that packet filtering does not become a bottleneck. Poorly designed rulesets can increase latency and CPU usage.\n\nPerformance tuning includes reducing rule count, optimizing rule order, using ipsets, and minimizing logging overhead. Monitoring tools help identify performance issues.\n\nWell-tuned firewalls maintain security while supporting high traffic volumes efficiently.'
  }
];

// Build 10 MCQs based on provided topics
const questions = [
  {
    questionId: 1,
    prompt: 'What is the key advantage of a stateful firewall over a stateless firewall?',
    options: [
      'It evaluates packets faster by ignoring connection context',
      'It tracks connection state and allows legitimate return traffic automatically',
      'It only checks source IP addresses for anomalies',
      'It requires fewer kernel features and less memory'
    ],
    correctAnswer: 1
  },
  {
    questionId: 2,
    prompt: 'Which conntrack state indicates traffic is part of an already verified flow?',
    options: [
      'NEW',
      'ESTABLISHED',
      'INVALID',
      'UNTRACKED'
    ],
    correctAnswer: 1
  },
  {
    questionId: 3,
    prompt: 'Which scenario best demonstrates dynamic firewall rule evaluation?',
    options: [
      'Hard-coding static ACCEPT rules for SSH',
      'Auto-blocking an IP after repeated failed logins within a time window',
      'Allowing all traffic from a specific subnet regardless of behavior',
      'Using only port-based filtering without monitoring'
    ],
    correctAnswer: 1
  },
  {
    questionId: 4,
    prompt: 'Why does rule ordering matter in Linux firewalls?',
    options: [
      'Rules are evaluated randomly, so order improves readability only',
      'Top-down evaluation means frequently matched rules should be placed early for efficiency',
      'Rules at the bottom are always executed last regardless of jumps',
      'Order does not affect performance or security'
    ],
    correctAnswer: 1
  },
  {
    questionId: 5,
    prompt: 'Rate limiting primarily helps defend against which type of activity?',
    options: [
      'Legitimate burst traffic from internal services',
      'Automated brute-force attempts and denial-of-service patterns',
      'Encrypted VPN tunnels',
      'Static routing inconsistencies'
    ],
    correctAnswer: 1
  },
  {
    questionId: 6,
    prompt: 'Temporary IP blocking is preferred over permanent bans because it:',
    options: [
      'Ensures attackers are blocked forever',
      'Balances security and usability by automatically expiring bans',
      'Requires manual review for every event',
      'Eliminates the need for conntrack'
    ],
    correctAnswer: 1
  },
  {
    questionId: 7,
    prompt: 'A common use case for time-based firewall rules is:',
    options: [
      'Blocking DNS globally',
      'Allowing administrative access only during business hours',
      'Disabling NAT on weekends',
      'Force-enabling IPv6 at night'
    ],
    correctAnswer: 1
  },
  {
    questionId: 8,
    prompt: 'What is a realistic expectation when using Geo-IP filtering?',
    options: [
      'It completely eliminates all malicious traffic',
      'It reduces exposure by limiting access to expected regions but is not foolproof',
      'It replaces the need for authentication and rate limiting',
      'It works only for internal subnets'
    ],
    correctAnswer: 1
  },
  {
    questionId: 9,
    prompt: 'Application-aware firewalling helps security by:',
    options: [
      'Blocking all traffic on shared ports',
      'Distinguishing traffic types on the same port via DPI or connection tracking',
      'Eliminating the need for TLS',
      'Only allowing UDP and blocking TCP'
    ],
    correctAnswer: 1
  },
  {
    questionId: 10,
    prompt: 'Which technique typically improves firewall performance in high-traffic environments?',
    options: [
      'Logging every packet at TRACE level',
      'Using ipsets and placing drop rules early to reduce evaluations',
      'Increasing rule count to cover every edge case',
      'Disabling conntrack entirely for all interfaces'
    ],
    correctAnswer: 1
  }
];

(async () => {
  try {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const assignment = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID });
    if (!assignment) {
      console.log('❌ Assignment not found:', ASSIGNMENT_ID);
      await mongoose.connection.close();
      process.exit(1);
    }

    const title = 'Dynamic Firewall and Security Rules';
    const description = 'Advanced firewall concepts including conntrack, rule ordering, dynamic evaluation, and performance tuning.';
    const questionsPayload = questions.map(q => ({
      questionId: q.questionId,
      prompt: q.prompt,
      options: q.options,
      correctAnswer: q.correctAnswer
    }));

    const res = await Assignment.updateOne(
      { assignmentId: ASSIGNMENT_ID },
      {
        $set: {
          title,
          description,
          topics,
          questions: questionsPayload,
          passingPercentage: 60
        }
      }
    );

    const updated = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    console.log(`✅ Updated ${ASSIGNMENT_ID}. Matched: ${res.matchedCount}, Modified: ${res.modifiedCount}, Topics: ${Array.isArray(updated?.topics) ? updated.topics.length : 0}, Questions: ${Array.isArray(updated?.questions) ? updated.questions.length : 0}, Passing %: ${updated?.passingPercentage}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('❌ Update failed:', e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();