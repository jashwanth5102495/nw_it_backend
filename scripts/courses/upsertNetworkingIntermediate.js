require('dotenv').config({path:"../../.env"});
const mongoose = require('mongoose');
const Course = require('../../models/Course');

async function upsertNetworkingIntermediate() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
    console.log(`Connecting to ${mongoURI}`);
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    const courseDoc = {
      courseId: 'NETWORKING-INTERMEDIATE', 
      title: 'Networking - Intermediate',
      category: 'DevOps', // adhere to backend enum
      level: 'Intermediate',
      description: 'Master advanced networking skills using Linux-based tools, server configuration, routing, switching, monitoring, and real-world network automation workflows.',
      price: 2200,
      duration: '10 weeks',
      modules: [
        {
          title: 'Linux Networking Fundamentals (Advanced)',
          duration: '2 weeks',
          topics: [
            'Linux network configuration (ifconfig, ip, nmcli)',
            'Understanding network interfaces, links, routes',
            'Static & dynamic routing in Linux',
            'Host files, resolv.conf, DNS configuration',
            'Socket programming basics (theory)',
            'SSH, SCP, and secure remote access',
            'Network namespaces & virtual interfaces'
          ]
        },
        {
          title: 'Advanced Network Scanning & Analysis Tools',
          duration: '2 weeks',
          topics: [
            'Deep-dive into Nmap scripting engine (NSE)',
            'Masscan for high-speed scanning',
            'Netcat (nc) for port listening & banner grabbing',
            'tcpdump advanced packet capture',
            'ss & netstat for connection tracking',
            'Scanning services, OS fingerprinting, version detection',
            'Real-world enumeration workflows'
          ]
        },
        {
          title: 'Linux-Based Firewall & Security Devices',
          duration: '2 weeks',
          topics: [
            'iptables deep configuration',
            'NAT, DNAT, SNAT, MASQUERADE rules',
            'firewalld zones, policies, and rich rules',
            'ufw for simplified firewall management',
            'Intro to pfSense (overview)',
            'Configuring port forwarding, blocking, filtering',
            'Linux as a router + firewall combo'
          ]
        },
        {
          title: 'VPNs, Tunneling & Secure Communications',
          duration: '1.5 weeks',
          topics: [
            'OpenVPN setup (server + client)',
            'WireGuard VPN configuration',
            'SSH tunneling & port forwarding',
            'SOCKS proxy with SSH',
            'GRE tunnels',
            'IPsec fundamentals',
            'Secure remote access for enterprise networks'
          ]
        },
        {
          title: 'Network Monitoring, Logging & Performance Tools',
          duration: '1.5 weeks',
          topics: [
            'SNMP setup on Linux',
            'Nagios monitoring',
            'Zabbix installation & alerts',
            'Syslog management & rotation',
            'iftop, htop, bmon, nload for bandwidth monitoring',
            'MTR & traceroute advanced usage',
            'Network baseline creation and anomaly detection'
          ]
        },
        {
          title: 'Routing, Switching & VLANs in Linux',
          duration: '1 week',
          topics: [
            'Linux as a router',
            'Routing tables & policy-based routing',
            'VLAN creation with vconfig / ip link',
            'Bonding & link aggregation (LACP)',
            'Bridging interfaces',
            'DHCP server setup (dnsmasq / isc-dhcp)',
            'Mini enterprise network creation in Linux'
          ]
        }
      ],
      prerequisites: ['Networking basics or equivalent'],
      learningOutcomes: [
        'Configure routing, VLANs, and Linux-based networking',
        'Set up VPNs (OpenVPN/WireGuard) and secure communications',
        'Build and manage firewalls (iptables/ufw, firewalld)',
        'Monitor and troubleshoot networks'
      ],
      instructor: {
        name: 'Nina Patel',
        bio: 'Senior Network Specialist.',
        experience: '9+ years'
      },
      isActive: true
    };

    const updated = await Course.findOneAndUpdate(
      { courseId: courseDoc.courseId },
      { $set: courseDoc },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`✅ Upserted course: ${updated.courseId} → ${updated.title}`);
    console.log(`Category: ${updated.category}, Level: ${updated.level}, Price: ${updated.price}`);
  } catch (err) {
    console.error('❌ Error upserting course:', err);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

if (require.main === module) {
  upsertNetworkingIntermediate();
}
