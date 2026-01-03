require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';
const ASSIGNMENT_ID = 'networking-beginner-2';

const assignmentSchema = new mongoose.Schema({ assignmentId: String }, { strict: false });
const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

// Build study topics (initial 8 of 15)
const topics = [
  {
    topicId: 'network-interface-bonding',
    title: 'Network Interface Bonding (Link Aggregation)',
    content: 'Network bonding (also known as link aggregation) allows you to combine multiple physical network interfaces into a single logical interface to provide redundancy, load balancing, and increased bandwidth. This is commonly used in data centers, high-availability servers, firewalls, and switches. If one cable or NIC fails, the bonded interface continues working without interruption. Linux supports several bonding modes like round-robin, active-backup, XOR, LACP (IEEE 802.3ad), etc. Understanding bonding is crucial for providing fault-tolerant connectivity and high-performance throughput in enterprise networks.',
    examples: [
      'modprobe bonding',
      'ip link add bond0 type bond',
      'ip link set bond0 type bond mode 802.3ad',
      'ip link set eth0 master bond0',
      'ip link set eth1 master bond0',
      'ip addr add 192.168.1.50/24 dev bond0',
      'ip link set bond0 up'
    ]
  },
  {
    topicId: 'static-dynamic-routing',
    title: 'Static & Dynamic Host Routing with route and ip',
    content: 'Routing defines how packets move from one network to another. Linux can function as both a host and a router. When networks grow or become complex (multi-gateway, VPN, VLANs), administrators must control routing manually. Static routes are manually assigned, while dynamic routing uses protocols (OSPF, BGP, RIP) usually handled by daemons like FRR. Understanding how to add, delete, and verify routes is essential for fixing “destination unreachable” issues, VPN conflicts, and multi-WAN setups.',
    examples: [
      'route -n',
      'ip route',
      'ip route add 10.10.20.0/24 via 192.168.1.1',
      'ip route del 10.10.20.0/24'
    ]
  },
  {
    topicId: 'netplan-configuration',
    title: 'Netplan Configuration (Ubuntu Modern Network Manager)',
    content: 'Netplan is a YAML-based network configuration system used in modern Ubuntu Server versions. Instead of manually editing interfaces files, Netplan uses YAML syntax to manage IP addresses, DHCP, routes, VLANs, Wi-Fi, and bridges. It is connected to NetworkManager or systemd-networkd as backends. Netplan is essential for configuring cloud servers, virtual machines, and production servers where permanent network configuration is required.',
    examples: [
      'Example file: /etc/netplan/01-config.yaml',
      'network:\n  version: 2\n  ethernets:\n    eth0:\n      dhcp4: no\n      addresses: [192.168.1.20/24]\n      gateway4: 192.168.1.1\n      nameservers:\n        addresses: [8.8.8.8]',
      'netplan apply'
    ]
  },
  {
    topicId: 'wireless-network-tools',
    title: 'Wireless Network Tools (iw, iwconfig, nmcli)',
    content: 'Linux provides advanced utilities for managing Wi-Fi interfaces. Tools like iw and iwconfig allow you to view wireless parameters, signal strength, available access points, and configure wireless profiles. NetworkManager’s CLI nmcli provides a powerful interface to connect to Wi-Fi networks, manage profiles, and automate wireless connectivity. These tools are useful in wireless penetration testing, driver debugging, and wireless performance tuning.',
    examples: [
      'iw dev',
      'iwconfig',
      'iwlist wlan0 scan',
      'nmcli radio wifi on',
      'nmcli device wifi connect MyWiFi password 12345678'
    ]
  },
  {
    topicId: 'linux-bridge-creation',
    title: 'Linux Bridge Creation (Used in Virtualization & VLANs)',
    content: 'Linux bridges behave like virtual switches, allowing multiple interfaces (physical or virtual) to communicate. They are used heavily in virtualization (KVM, Docker), VLAN setups, and advanced routing environments. Bridges help isolate networks, give VMs network access, and simulate switch behavior. Mastering bridge management is crucial for cloud infrastructure, container networking, and virtual labs.',
    examples: [
      'ip link add name br0 type bridge',
      'ip link set br0 up',
      'ip link set eth0 master br0',
      'ip addr add 192.168.10.2/24 dev br0'
    ]
  },
  {
    topicId: 'traffic-shaping-tc',
    title: 'Traffic Shaping & Bandwidth Control Using tc',
    content: 'Traffic Control (tc) is a Linux tool used to manipulate network bandwidth, delay, packet loss, and queue disciplines. This is essential for simulating low-bandwidth environments, prioritizing VoIP, controlling downloads/uploads, and preventing network saturation. Administrators also use tc for DoS mitigation by limiting incoming connections or shaping heavy flows.',
    examples: [
      'tc qdisc add dev eth0 root tbf rate 5mbit burst 32kbit latency 400ms',
      'tc qdisc show dev eth0',
      'tc qdisc del dev eth0 root'
    ]
  },
  {
    topicId: 'reverse-ssh-tunnels',
    title: 'Reverse SSH Tunnels (Remote Access Behind NAT)',
    content: 'Reverse SSH tunneling allows you to access a device behind NAT or firewall without opening ports. This is extremely useful for remote support, IoT management, or accessing servers without public IPs. The device behind NAT initiates a connection to a public server and opens a reverse tunnel that allows access to its internal services.',
    examples: [
      'ssh -R 8080:localhost:22 user@public-server',
      'ssh -p 8080 localhost'
    ]
  },
  {
    topicId: 'ssh-port-forwarding',
    title: 'SSH Port Forwarding (Local & Remote Tunnels)',
    content: 'SSH tunneling encrypts traffic by forwarding ports securely over SSH connections. Local forwarding is used to access internal services from your machine, while remote forwarding gives others access to services on your system. It\'s widely used in penetration testing, DevOps, and secure database or web server access without exposing ports publicly.',
    examples: [
      'Local: ssh -L 8080:127.0.0.1:80 user@server',
      'Remote: ssh -R 9090:localhost:22 user@server'
    ]
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

    assignment.title = 'ASSIGNMENT 2 – Study Material (15 Practical Networking Topics)';
    assignment.description = 'Study material covering practical networking topics with explanations and commands.';
    assignment.topics = topics;
    assignment.questions = []; // study-only
    assignment.passingPercentage = 0; // no quiz

    await assignment.save();
    console.log(`✅ Updated study material for ${ASSIGNMENT_ID}. Topics: ${assignment.topics.length}, Questions: ${assignment.questions.length}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('❌ Update failed:', e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();