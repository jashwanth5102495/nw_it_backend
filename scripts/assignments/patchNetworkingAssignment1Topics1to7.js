require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';

const assignmentSchema = new mongoose.Schema({
  assignmentId: String,
  title: String,
  description: String,
  topics: [
    { topicId: String, title: String, content: String }
  ],
}, { strict: false });

const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

// Exact content provided by user for topics 1–7
const topicContent = [
  {
    topicId: 'linux-interface-management',
    title: 'Linux Network Interface Management (ifconfig, ip commands)',
    content: `Explanation\n\nManaging network interfaces is one of the most fundamental tasks in Linux-based networking. Whether you’re configuring a server, troubleshooting network failure, or setting up routing, understanding how Linux handles network interfaces is essential. Linux used to rely heavily on ifconfig for interface management, but modern systems use the ip command suite, which is far more powerful and flexible. These commands allow you to configure IP addresses, enable or disable interfaces, verify connectivity, and manage routing. In real-world scenarios such as server deployment, firewall setup, or diagnosing connection loss, these commands become the first tools a network engineer uses.\n\nPractical Commands\n\nOld Method – ifconfig\n\nifconfig\nifconfig eth0 up\nifconfig eth0 down\nifconfig eth0 192.168.1.20 netmask 255.255.255.0\n\nModern Method – ip\n\nip addr\nip link set eth0 up\nip link set eth0 down\nip addr add 192.168.10.20/24 dev eth0\nip addr del 192.168.10.20/24 dev eth0\nip link show eth0`
  },
  {
    topicId: 'arp-and-arping',
    title: 'ARP & Using arp/arping Commands',
    content: `Explanation\n\nThe Address Resolution Protocol (ARP) plays a critical role in LAN communication by mapping IP addresses to MAC addresses. Whenever a device wants to send a packet to another device in the same network, it first checks its ARP cache to find the MAC address. ARP issues can cause devices to fail communication even if their IP configurations are correct. Tools like arp and arping allow administrators to inspect, modify, and verify ARP behavior. ARP-based troubleshooting is extremely useful when diagnosing gateway issues, detecting spoofing attacks, or confirming connectivity without relying on ICMP.\n\nPractical Commands\n\narp -a\narp -s 192.168.1.100 00:11:22:33:44:55\narping 192.168.1.1`
  },
  {
    topicId: 'dhcp-client-server-basics',
    title: 'DHCP Client & Server Basics in Linux',
    content: `Explanation\n\nDynamic Host Configuration Protocol (DHCP) is the service responsible for automatically assigning IP addresses and network settings to devices. Without DHCP, users would need to manually configure IP settings for every device, which is unrealistic in large networks. Linux devices can act as both DHCP clients and servers. When devices fail to obtain an IP, understanding how to release, renew, and inspect DHCP leases is essential. DHCP server setup allows administrators to manage IP ranges and automate large-scale network configuration.\n\nPractical Commands\n\nClient\n\ndhclient eth0\ndhclient -r eth0\n\nLease Location\n\n/var/lib/dhcp/dhclient.leases\n\nServer Example\n\nsubnet 192.168.1.0 netmask 255.255.255.0 {\n  range 192.168.1.50 192.168.1.150;\n  option routers 192.168.1.1;\n  option domain-name-servers 8.8.8.8;\n}`
  },
  {
    topicId: 'dns-lookups-tools',
    title: 'DNS Lookups Using dig, nslookup, host',
    content: `Explanation\n\nDNS is responsible for translating human-friendly domain names into IP addresses. When browsing the internet or connecting to servers, DNS resolution is the first step. If DNS breaks, users will feel like the internet is down even though connectivity exists. Linux provides several tools such as dig, nslookup, and host that let administrators perform detailed queries, troubleshoot DNS failures, and verify DNS configurations. These tools are commonly used for checking website issues, debugging email server DNS records, and validating domain configurations.\n\nPractical Commands\n\n dig google.com\n dig A google.com\n dig MX yahoo.com\n nslookup google.com\n host google.com\n dig -x 8.8.8.8`
  },
  {
    topicId: 'linux-routing-table',
    title: 'Linux Routing Table Management',
    content: `Explanation\n\nRouting determines how packets travel from one network to another. Linux can operate as a workstation or a router, and managing the routing table is essential in multi-interface setups, VPN environments, and server infrastructure. Understanding routes allows administrators to control traffic flow, fix unreachable network problems, and properly direct packets through gateways. By using ip route, you can add static routes, remove incorrect routes, or diagnose routing loops and misconfigurations.\n\nPractical Commands\n\n ip route\n ip route add default via 192.168.1.1\n ip route add 10.0.0.0/24 via 192.168.1.5\n ip route del 10.0.0.0/24`
  },
  {
    topicId: 'netstat-ss-monitoring',
    title: 'Network Monitoring Using netstat & ss',
    content: `Explanation\n\nMonitoring open ports and active connections is at the core of network security and performance analysis. Tools like netstat and ss allow you to view listening services, check which applications use specific ports, and identify suspicious connections. Modern Linux systems rely more on ss because it is faster and more accurate. These tools are essential for diagnosing server issues, verifying that services like Apache or MySQL are running, or ensuring that there are no unauthorized services running.\n\nPractical Commands\n\n netstat -tulpn\n ss -tulpn\n ss -ant\n ss -tulpn | grep 80`
  },
  {
    topicId: 'tcpdump-real-time',
    title: 'Real-Time Traffic Capturing Using tcpdump',
    content: `Explanation\n\n tcpdump is a powerful command-line packet sniffer used for deep network troubleshooting, security analysis, and real-time packet inspection. It provides raw visibility into network traffic, which makes it essential for diagnosing low-level issues, detecting attacks, or analyzing application behavior. Unlike Wireshark, tcpdump works directly from the terminal and is ideal for servers without a GUI. Administrators often capture traffic and export it as .pcap files for later analysis.\n\nPractical Commands\n\n tcpdump -i eth0\n tcpdump -i eth0 tcp\n tcpdump -i eth0 -w capture.pcap\n tcpdump host 192.168.1.10`
  },
];

async function run(){
  try{
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const assignmentId = 'networking-beginner-1';
    const doc = await Assignment.findOne({ assignmentId });
    if(!doc){
      throw new Error(`Assignment not found: ${assignmentId}`);
    }

    // Ensure topics array exists
    if(!Array.isArray(doc.topics)) doc.topics = [];

    // Replace first 7 topics with user-provided content, keep remaining topics as-is
    for(let i=0;i<topicContent.length;i++){
      doc.topics[i] = topicContent[i];
    }

    doc.updatedAt = new Date();
    await doc.save();

    const count = (doc.topics || []).length;
    console.log(`✅ Updated '${assignmentId}' topics 1–7. Total topics now: ${count}`);
    (doc.topics || []).forEach((t,i)=>{
      const len = (t.content||'').length; console.log(`  [${i+1}] ${t.title} | id=${t.topicId} | len=${len}`);
    });

    await mongoose.connection.close();
    console.log('✅ Done.');
    process.exit(0);
  }catch(err){
    console.error('❌ Error patching Assignment 1 topics:', err);
    try{ await mongoose.connection.close(); }catch{}
    process.exit(1);
  }
}

run();