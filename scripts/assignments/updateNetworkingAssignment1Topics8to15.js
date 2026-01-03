// Updates topics 8–15 for assignment 'networking-beginner-1' with new titles,
// explanations, and practical commands, replacing previous placeholder topics.
// Usage (PowerShell):
//   $env:MONGODB_URI="mongodb://localhost:27017/jasnav_projects"; node scripts/updateNetworkingAssignment1Topics8to15.js

const { MongoClient } = require('mongodb');

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nw_it';
  const dbName = uri.split('/').pop().split('?')[0];
  const client = new MongoClient(uri, { ignoreUndefined: true });

  const updates = [
    {
      title: 'WireGuard / OpenVPN Basic Configuration',
      explanation:
        'VPN technologies like WireGuard and OpenVPN provide secure, encrypted tunnels that allow remote users or branch offices to connect safely. WireGuard is modern, lightweight, and extremely fast compared to older VPN protocols. Setting up VPNs is essential for secure administration, remote work, and cross-network communication. Linux provides full tools for managing these VPNs, generating keys, configuring interfaces, and establishing encrypted tunnels.',
      content:
        'Practical Commands\n\nWireGuard\n\nwg genkey | tee privatekey | wg pubkey > publickey\n\nwg0.conf\n\n[Interface]\n\nAddress = 10.0.0.2/24\n\nPrivateKey = <private-key>\n\n[Peer]\n\nPublicKey = <server-public-key>\n\nEndpoint = vpn.yoursite.com:51820\n\nAllowedIPs = 0.0.0.0/0\n\nwg-quick up wg0\n\nOpenVPN\n\nopenvpn --config client.ovpn'
    },
    {
      title: 'Nmap NSE (Nmap Scripting Engine)',
      explanation:
        'The Nmap Scripting Engine (NSE) adds powerful automation and vulnerability scanning capabilities to Nmap. It allows Nmap to check for weaknesses, misconfigurations, malware traces, authentication problems, and service details. NSE scripts cover everything from brute-force modules to malware detection and OS enumeration. Professionals rely heavily on NSE for penetration testing, real-time scanning, and automated discovery of vulnerabilities in networks.',
      content:
        'Practical Commands\n\n nmap --script=vuln 192.168.1.10\n\n nmap --script=auth 192.168.1.10\n\n nmap --script=smb-os-discovery 192.168.1.10'
    },
    {
      title: 'FirewallD & UFW Command-Line Management',
      explanation:
        'Firewalls form the first line of defense in network security. On Linux, FirewallD and UFW provide simple yet powerful interfaces for controlling access to ports and services. With these tools, administrators can block malicious traffic, allow essential services, and implement security policies. Configuring firewall rules is a must-know skill for securing servers, preventing intrusions, and controlling network flow.',
      content:
        'Practical Commands\n\nFirewallD\n\n systemctl status firewalld\n\n firewall-cmd --add-port=80/tcp --permanent\n\n firewall-cmd --reload\n\nUFW\n\n ufw enable\n\n ufw allow 22\n\n ufw deny 80'
    },
    {
      title: 'Linux Logs for Network Events (syslog, journalctl)',
      explanation:
        'Logs are critical for troubleshooting network errors, identifying failures, and detecting attacks. Linux stores almost every system and network event in log files, making it possible to trace DHCP failures, firewall blocks, and suspicious activities. Understanding how to read logs using journalctl and syslog is essential for system administrators, especially in production environments.',
      content:
        'Practical Commands\n\n journalctl\n\n journalctl -u NetworkManager\n\n cat /var/log/syslog'
    },
    {
      title: 'Packet Types in Wireshark (ICMP, DHCP, DNS, ARP, TLS)',
      explanation:
        'Understanding packet types is essential for effective packet analysis and troubleshooting. Wireshark breaks down packets so you can see exactly how devices behave on the network. From simple pings (ICMP) to complex encrypted TLS traffic, each protocol provides hints about network performance, errors, or attacks. Mastering packet interpretation helps identify latency issues, DNS failures, ARP spoofing, and malicious patterns.',
      content:
        'Common Packet Types\n\n ICMP\n\n DHCP\n\n DNS\n\n ARP\n\n TCP/UDP\n\n TLS'
    },
    {
      title: 'VLAN Creation & Management in Linux',
      explanation:
        'VLANs allow you to logically segment a physical network into isolated environments. This improves security, reduces broadcast traffic, and organizes enterprise networks. Linux fully supports VLAN tagging using the ip command suite. Network engineers rely on VLANs to separate departments, secure servers, and manage traffic efficiently.',
      content:
        'Practical Commands\n\n ip link add link eth0 name eth0.10 type vlan id 10\n\n ip addr add 192.168.10.2/24 dev eth0.10\n\n ip link set eth0.10 up'
    },
    {
      title: 'SSH Hardening & Remote Access Security',
      explanation:
        'SSH is the standard method for remotely accessing Linux servers, which makes it a popular target for attackers. Hardening SSH ensures attackers cannot brute-force or exploit weak configurations. Techniques such as disabling password authentication, using SSH keys, and restricting users significantly enhance server security. Every production server must follow SSH hardening guidelines.',
      content:
        'Practical Commands\n\n PasswordAuthentication no\n\n AllowUsers jashwanth\n\n ssh-keygen\n\n ssh-copy-id user@server'
    },
    {
      title: 'Network Performance Tools (iperf3)',
      explanation:
        'Network performance testing is essential when diagnosing speed problems, validating WAN links, or verifying server throughput. iperf3 is a powerful tool for testing bandwidth, latency, jitter, and upload/download speeds between two devices. It is widely used in data centers, enterprise networks, and troubleshooting slow connections.',
      content:
        'Practical Commands\n\n iperf3 -s\n\n iperf3 -c 192.168.1.10\n\n iperf3 -c IP -d\n\n iperf3 -c IP -u'
    }
  ];

  try {
    await client.connect();
    const db = client.db(dbName);
    const assignments = db.collection('assignments');

    const assignmentId = 'networking-beginner-1';
    const assignment = await assignments.findOne({ assignmentId });
    if (!assignment) {
      throw new Error(`Assignment not found: ${assignmentId}`);
    }

    const topics = assignment.topics || [];
    if (topics.length < 15) {
      throw new Error(`Unexpected topics length (${topics.length}); expected at least 15.`);
    }

    // Replace by index: topics 8–15 are indices 7..14
    const updatedTopics = topics.map((t, idx) => {
      if (idx >= 7 && idx <= 14) {
        const u = updates[idx - 7];
        return {
          ...t,
          title: u.title,
          content: u.content,
          explanation: u.explanation,
        };
      }
      return t;
    });

    const result = await assignments.updateOne(
      { _id: assignment._id },
      { $set: { topics: updatedTopics } }
    );

    console.log(`Updated topics 8–15 for ${assignmentId}. Matched=${result.matchedCount} Modified=${result.modifiedCount}`);
    updatedTopics.slice(7, 15).forEach((t, i) => {
      const n = i + 8;
      console.log(
        `Topic ${n}: title='${t.title}', explanationLength=${(t.explanation||'').length}, contentLength=${(t.content||'').length}`
      );
    });
  } catch (err) {
    console.error('Error updating topics:', err.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

run();