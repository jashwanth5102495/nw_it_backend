require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';

const assignmentSchema = new mongoose.Schema({
  assignmentId: String,
  title: String,
  description: String,
  topics: [
    { topicId: String, title: String, content: String, explanation: String, examples: [String], syntax: String }
  ],
  passingPercentage: Number,
}, { strict: false });

const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

const ASSIGNMENT_ID = 'networking-beginner-3';
const NEW_TITLE = '🎯 Assignment 3: Advanced Network Security & Monitoring Essentials';
const NEW_DESCRIPTION = 'Hands-on essentials for SSH hardening, Fail2ban, syslog collection, NTP sync, packet capture, and system resource monitoring. Study-only topics — learn, practice, and prepare for real-world network security operations.';

const topics = [
  {
    topicId: 'ssh-hardening',
    title: 'Understanding SSH Hardening Techniques',
    explanation:
      'SSH is one of the most important remote access protocols used in servers. Hardening SSH ensures that attackers cannot brute-force credentials or exploit weak authentication methods. Common hardening techniques include disabling password login, enabling key-based authentication, restricting SSH access to specific IP ranges, and changing the default port. These techniques significantly reduce bot attacks and unauthorized access attempts.\n\nAnother important part of SSH hardening is protecting against MITM attacks, log analysis for suspicious SSH attempts, enabling fail2ban, and configuring SSH banners for legal warnings. Disabling unused authentication protocols and forcing strong algorithms also strengthens the system security. SSH hardening is essential for securing cloud servers, corporate systems, and production environments.',
    examples: [
      'sudo nano /etc/ssh/sshd_config',
      'PermitRootLogin no',
      'PasswordAuthentication no',
      'sudo systemctl restart ssh',
      'sudo ufw allow from 192.168.1.0/24 to any port 22'
    ]
  },
  {
    topicId: 'fail2ban-basics',
    title: 'Using Fail2ban to Block Brute Force Attacks',
    explanation:
      'Fail2ban is a security tool that monitors log files and automatically bans IP addresses that show malicious activity such as failed SSH login attempts or excessive HTTP requests. It works by reading system logs and detecting patterns like repeated failures, then dynamically adding firewall rules to block attackers temporarily or permanently.\n\nFail2ban greatly reduces brute-force attempts on services like SSH, FTP, Apache, and Nginx. It is highly customizable—admins can define jail configurations, ban times, regex patterns, and email alerts. This makes it a powerful defensive tool for Linux servers and a vital part of system hardening strategies.',
    examples: [
      'sudo apt install fail2ban',
      'sudo systemctl enable --now fail2ban',
      'sudo fail2ban-client status sshd',
      'sudo fail2ban-client set sshd banip 192.168.1.50'
    ]
  },
  {
    topicId: 'syslog-server',
    title: 'Setting Up a Syslog Server for Network Event Collection',
    explanation:
      'A Syslog server is used to collect logs from routers, switches, firewalls, Linux servers, and applications. Centralized logging is crucial in corporate networks because it allows administrators to monitor all devices from a single location. Syslog also helps streamline troubleshooting and makes auditing much easier.\n\nSyslog servers are also important for compliance, intrusion detection, and log retention policies. Security teams analyze logs to detect anomalies, failed logins, configuration changes, and other events. Tools like rsyslog and syslog-ng allow powerful filtering, forwarding, and log-based alerts.',
    examples: [
      'sudo apt install rsyslog',
      'sudo nano /etc/rsyslog.conf',
      'module(load="imudp")',
      'input(type="imudp" port="514")',
      'sudo systemctl restart rsyslog'
    ]
  },
  {
    topicId: 'ntp-config',
    title: 'Network Time Protocol (NTP) Configuration for Synchronization',
    explanation:
      'NTP ensures all network devices share the same time. This is important because logs, authentication, encryption, and certificates all rely on accurate timestamps. Without proper synchronization, systems may reject authentication requests, generate out-of-order logs, or experience SSL issues.\n\nServers typically sync with public NTP sources such as time.google.com or pool.ntp.org. Internal networks often use a local NTP server for consistent timing across routers, switches, firewalls, and Linux hosts. Maintaining correct time improves reliability, reduces errors, and helps during forensic analysis.',
    examples: [
      'sudo apt install chrony',
      'sudo nano /etc/chrony/chrony.conf',
      'server time.google.com iburst',
      'sudo systemctl restart chrony',
      'chronyc tracking'
    ]
  },
  {
    topicId: 'tcpdump-capture',
    title: 'Using tcpdump for Live Packet Capture',
    explanation:
      'tcpdump is a command-line tool used for real-time packet capturing and low-level network analysis. It allows engineers to capture packets directly from the network interface and inspect headers, protocols, ports, and payloads. tcpdump is commonly used during troubleshooting and initial incident response.\n\nWith tcpdump, administrators can filter traffic by protocol, IP, port, or interface. It is lightweight, fast, and ideal for terminal-based packet debugging. Captured packets can also be exported to a pcap file and analyzed later in Wireshark for deeper inspection.',
    examples: [
      'sudo tcpdump -i eth0',
      'sudo tcpdump -i eth0 port 80',
      'sudo tcpdump -w capture.pcap',
      'sudo tcpdump -nn -vv -i eth0 host 8.8.8.8'
    ]
  },
  {
    topicId: 'system-monitoring',
    title: 'System Resource Monitoring with top & htop',
    explanation:
      'top and htop are resource monitoring tools that display CPU usage, RAM consumption, process activity, load averages, and system uptime. They help identify resource overload, misbehaving apps, or runaway processes that can degrade network performance.\n\nhtop provides a more interactive interface with color-coded metrics, tree views, and shortcut commands. Network engineers use these tools to diagnose bottlenecks affecting network services like DNS, DHCP, Apache, or SSH. Monitoring is a key part of maintaining stable network operations.',
    examples: [
      'top',
      'htop',
      'ps aux --sort=-%cpu',
      'ps aux --sort=-%mem'
    ]
  }
];

async function run(){
  try{
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const update = {
      title: NEW_TITLE,
      description: NEW_DESCRIPTION,
      topics,
      updatedAt: new Date(),
    };

    const result = await Assignment.findOneAndUpdate(
      { assignmentId: ASSIGNMENT_ID },
      { $set: update },
      { upsert: true, new: true }
    );

    console.log(`✅ Updated '${ASSIGNMENT_ID}'`);
    console.log(`  Title: ${result.title}`);
    console.log(`  Topics: ${result.topics?.length || 0}`);
    (result.topics || []).forEach((t, i) => {
      console.log(`    [${i+1}] ${t.title} | id=${t.topicId} | cmds=${(t.examples||[]).length}`);
    });

    await mongoose.connection.close();
    console.log('✅ Done.');
    process.exit(0);
  }catch(err){
    console.error('❌ Error updating assignment 3:', err?.message || err);
    try{ await mongoose.connection.close(); }catch{}
    process.exit(1);
  }
}

run();