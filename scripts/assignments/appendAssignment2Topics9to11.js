/**
 * Append topics 9–11 to networking-beginner-2 (idempotent) without touching topic 12.
 */
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jasnav_projects';
const DB_NAME = process.env.DB_NAME || 'jasnav_projects';
const COLLECTION = 'assignments';

const assignmentId = 'networking-beginner-2';
const newTitle = 'Assignment 2 : Advanced Networking Commands & Diagnostic Techniques';

const topics9to11 = [
  {
    topicId: 'tcp-connection-states',
    title: 'TCP Connection States (SYN, ESTABLISHED, TIME_WAIT)',
    content: 'TCP operates as a stateful protocol, meaning every connection passes through a series of well-defined states from start to finish. Understanding these states is critical for diagnosing performance issues, detecting attacks, and managing server load.\n\nSYN_SENT occurs when a client initiates a TCP handshake by sending a SYN packet. If you see many SYN_SENT entries, it may indicate network latency, dropped packets, or the remote server being down.\n\nSYN_RECV means the server received the SYN and is waiting for the client’s ACK. Large numbers of SYN_RECV connections often indicate a SYN flood attack, a form of DoS.\n\nESTABLISHED is the stable state where two hosts can exchange data. Monitoring the number of ESTABLISHED sessions helps determine server workload and user activity.\n\nTIME_WAIT appears after a connection is closed. The system keeps this state for a short period to ensure late packets don’t interfere with future sessions. Excessive TIME_WAIT entries can slow servers and prevent new ephemeral ports from opening.\n\nCLOSE_WAIT usually indicates the remote host has closed the connection but the local application hasn\'t responded properly—often due to bugs or misconfigurations.\n\nUnderstanding these states allows network administrators to quickly determine whether slow networks, misbehaving applications, overloaded servers, or malicious scans are the root cause of issues.',
    examples: [
      'ss -ant',
      'ss -ant | grep SYN',
      'ss -ant | grep ESTAB',
      'ss -ant | grep TIME_WAIT',
      'ss -ant | grep CLOSE_WAIT'
    ]
  },
  {
    topicId: 'iptables-advanced',
    title: 'IPTables – Advanced Packet Filtering',
    content: 'IPTables is the core firewall framework used in Linux systems for packet filtering, NAT, port forwarding, and connection tracking. Even though UFW and FirewallD are popular, they run on top of IPTables, making it essential for advanced system administrators. IPTables evaluates packets using tables like filter, nat, and mangle, with chains such as INPUT, FORWARD, and OUTPUT. Administrators use IPTables to block unwanted traffic, whitelist specific IPs, protect SSH, perform port redirection, mitigate attacks like SYN floods, and create complex firewall policies for production networks. Because IPTables interacts directly with the Linux kernel\'s netfilter framework, it offers unmatched control and granularity, allowing precise rule definition based on protocol, ports, source/destination IP, and packet state. While powerful, improper IPTables configuration can lock you out of the server, disrupt services, or unintentionally block legitimate traffic.',
    examples: [
      'iptables -L -n',
      'iptables -A INPUT -p tcp --dport 22 -j ACCEPT',
      'iptables -A INPUT -j DROP',
      'iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to 192.168.1.50',
      'iptables -t nat -A POSTROUTING -j MASQUERADE',
      'iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT'
    ]
  },
  {
    topicId: 'log-analysis-network-events',
    title: 'Log Analysis for Network Events (grep, tail, journalctl)',
    content: 'Network troubleshooting depends heavily on logs. Linux logs contain critical information about DHCP failures, firewall drops, routing issues, SSH login attempts, and kernel-level network events. Tools like journalctl provide historical and live logs from systemd-managed services. tail -f helps monitor logs in real-time for issues such as repeated connection attempts or sudden service failures. Using grep, engineers filter through massive log files to isolate patterns like "denied", "timeout", or "dhcp". Log analysis is crucial during incident response, where administrators must determine whether issues originate from network misconfigurations, malicious attacks, or hardware faults. A skilled engineer can quickly identify attacks from logs—like repeated failed SSH attempts, port scans, malformed packets, or ARP spoofing attempts. Log mastery is a foundational skill in real-world network security and server management.',
    examples: [
      'journalctl -u NetworkManager',
      'journalctl -u sshd',
      'grep -i "dhcp" /var/log/syslog',
      'grep -i "denied" /var/log/kern.log',
      'tail -f /var/log/auth.log',
      'tail -f /var/log/syslog'
    ]
  }
];

async function main() {
  const client = new MongoClient(MONGODB_URI, { ignoreUndefined: true });
  try {
    console.log('[INFO] Connecting to MongoDB:', MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const col = db.collection(COLLECTION);

    const doc = await col.findOne({ assignmentId });
    if (!doc) {
      console.error('[ERROR] Assignment not found:', assignmentId);
      process.exit(1);
    }

    const existingTopics = Array.isArray(doc.topics) ? doc.topics : [];
    const existingIds = new Set(existingTopics.map(t => t.topicId || t.id));

    const toAdd = topics9to11.filter(t => !existingIds.has(t.topicId));
    const updated = existingTopics.concat(toAdd);

    const update = {
      $set: {
        title: newTitle,
        topics: updated,
        questions: [],
        passingPercentage: 0
      }
    };

    const res = await col.updateOne({ assignmentId }, update);
    console.log('[INFO] Matched:', res.matchedCount, 'Modified:', res.modifiedCount);

    const after = await col.findOne({ assignmentId });
    console.log('[INFO] Topics:', Array.isArray(after.topics) ? after.topics.length : 0);
    console.log('[INFO] Topic IDs present:', Array.isArray(after.topics) ? after.topics.map(t => t.topicId || t.id) : []);
  } catch (err) {
    console.error('[ERROR] Append failed:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();