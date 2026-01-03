/**
 * Update topics 12–15 on networking-beginner-2 with detailed explanations and commands.
 * Idempotent: replaces existing topic entries by topicId if present; appends missing ones.
 */
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jasnav_projects';
const DB_NAME = process.env.DB_NAME || 'jasnav_projects';
const COLLECTION = 'assignments';

const assignmentId = 'networking-beginner-2';
const newTitle = 'Assignment 2 : Advanced Networking Commands & Diagnostic Techniques';

const payloadById = new Map([
  [12, {
    topicId: 12,
    title: 'Using hping3 for Packet Crafting & Testing',
    content: 'hping3 is a highly flexible packet generation tool used for testing networks, firewalls, MTU settings, TCP behavior, and security policies. Unlike traditional tools (like ping) which only send ICMP packets, hping3 allows crafting custom TCP, UDP, or ICMP packets with user-defined headers, flags, ports, and payloads. Security professionals use hping3 to simulate SYN floods, test intrusion detection systems, analyze firewall rules, and map out open ports using packets that mimic real user traffic. Network engineers also use hping3 for troubleshooting issues such as path MTU discovery, checking packet fragmentation, verifying firewall rules, or testing how routers respond to specific TCP flags. Because it allows precise control over every packet field, hping3 is one of the most powerful tools for learning how packets move through a network.',
    examples: [
      'hping3 -S -p 80 192.168.1.1                 # SYN packet',
      'hping3 --udp -p 53 8.8.8.8                  # UDP test',
      'hping3 -1 192.168.1.1                       # ICMP mode',
      'hping3 -c 10000 --flood -S -p 80 10.0.0.1    # Stress test',
      'hping3 --scan 1-1000 192.168.1.1             # Port scan'
    ]
  }],
  [13, {
    topicId: 13,
    title: 'Traceroute & MTR for Path Analysis',
    content: 'Traceroute and MTR are essential tools for diagnosing routing issues and understanding the path packets take across networks. Traceroute works by gradually increasing TTL values, identifying each hop between you and a destination. This helps detect points of delay, misconfigured routers, or blocked paths. MTR (My Traceroute) enhances this by combining traceroute with continuous ping, offering a real-time view of packet loss and latency at every hop. This makes it ideal for ISP troubleshooting, cloud routing issues, and determining whether the problem lies in your network, your ISP, or the destination. These tools are extremely valuable for diagnosing slow websites, VPN disconnections, VoIP quality issues, or random packet loss problems. A skilled network admin can quickly identify bottlenecks or broken paths simply by reading traceroute output.',
    examples: [
      'traceroute google.com',
      'mtr google.com',
      'traceroute -I 8.8.8.8      # ICMP mode',
      'mtr -rw yahoo.com          # Report mode'
    ]
  }],
  [14, {
    topicId: 14,
    title: 'SystemD Network Services (systemd-networkd)',
    content: 'systemd-networkd is a lightweight, high-performance network management service used on servers, cloud environments, and embedded systems. Unlike NetworkManager, which is designed for desktops, systemd-networkd offers predictable, scriptable, and easily automated configurations. It supports static IPs, DHCP, VLANs, bridges, bonds, tunnels, routing rules, and DNS assignment. Cloud platforms like AWS, Azure, and Google Cloud rely heavily on systemd-networkd for configuring interfaces during instance boot. Administrators prefer systemd-networkd for its simplicity, performance, and minimal overhead. Configuration is done through .network, .netdev, and .link files, making it ideal for production-grade automation tools like Ansible, Puppet, and Terraform.',
    examples: [
      'Example config — /etc/systemd/network/20-wired.network\n[Match]\nName=eth0\n\n[Network]\nAddress=192.168.1.50/24\nGateway=192.168.1.1\nDNS=8.8.8.8',
      'systemctl restart systemd-networkd',
      'systemctl status systemd-networkd',
      'networkctl status',
      'networkctl list'
    ]
  }],
  [15, {
    topicId: 15,
    title: 'Host Isolation & Network Namespaces (ip netns)',
    content: 'Network namespaces allow you to create isolated networking environments within a single Linux machine. Each namespace has its own routing table, interfaces, firewall rules, ARP table, and even separate IP addresses. This is the foundation of container networking (Docker, Kubernetes, LXC), allowing multiple isolated networks to run on the same host. Network engineers use namespaces to test routing, NAT, VLANs, VPNs, firewall rules, or multi-network setups without needing multiple physical machines. Security analysts use namespaces to safely analyze malware behavior or inspect suspicious network packets. Namespaces enable building virtual labs, simulating complex network topologies, and testing firewall behavior—all without affecting the main host. They are one of the most powerful yet underused Linux networking features.',
    examples: [
      'ip netns add ns1',
      'ip netns add ns2',
      'ip netns exec ns1 ip addr',
      'ip netns exec ns1 ping 8.8.8.8',
      'ip netns exec ns2 ip link set lo up'
    ]
  }]
]);

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
    const idsToUpdate = new Set(payloadById.keys());

    // Replace topics 12–15 if present; otherwise append them at the end
    const replaced = existingTopics.map(t => {
      const id = t.topicId || t.id;
      if (idsToUpdate.has(id)) {
        return payloadById.get(id);
      }
      return t;
    });

    // Append any missing ones
    payloadById.forEach((payload, id) => {
      const has = replaced.some(t => (t.topicId || t.id) === id);
      if (!has) replaced.push(payload);
    });

    const update = {
      $set: {
        title: newTitle,
        topics: replaced,
        questions: [],
        passingPercentage: 0
      }
    };

    const res = await col.updateOne({ assignmentId }, update);
    console.log('[INFO] Matched:', res.matchedCount, 'Modified:', res.modifiedCount);

    const after = await col.findOne({ assignmentId });
    const count = Array.isArray(after.topics) ? after.topics.length : 0;
    console.log('[INFO] Updated title:', after.title);
    console.log('[INFO] Topics:', count);
    const ids = Array.isArray(after.topics) ? after.topics.map(t => t.topicId || t.id) : [];
    console.log('[INFO] Topic IDs present:', ids);
    console.log('[INFO] Total questions:', Array.isArray(after.questions) ? after.questions.length : 0);
    console.log('[INFO] Passing percentage:', after.passingPercentage ?? '(unset)');
  } catch (err) {
    console.error('[ERROR] Update failed:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();