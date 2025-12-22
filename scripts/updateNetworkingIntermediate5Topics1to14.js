require('dotenv').config();
const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jasnav_projects';
const ASSIGNMENT_ID = 'networking-intermediate-5';

const NEW_TITLE = 'Assignment 5: Secure Network Tunnels and VPNs';
const NEW_DESCRIPTION = 'Secure tunneling fundamentals; VPN concepts; site-to-site and remote access architectures; OpenVPN and WireGuard models; encryption, authentication, and key exchange; SSH tunneling with local/remote/dynamic forwarding and SOCKS proxy; GRE tunnels; IPsec transport and tunnel modes.';

const topics = [
  {
    topicId: 'secure-tunneling-fundamentals',
    title: 'Secure Tunneling Fundamentals',
    content: 'Secure tunneling is a technique that encapsulates network traffic inside another protocol to protect it from interception, tampering, and unauthorized access. In enterprise environments, tunneling ensures confidentiality and integrity when data travels over untrusted networks such as the public internet.\n\nTunnels work by wrapping original packets inside encrypted packets, hiding internal network details. Linux supports multiple tunneling mechanisms, making it a popular choice for VPN gateways, site-to-site connectivity, and secure remote access.\n\nUnderstanding tunneling fundamentals is critical before deploying advanced VPN technologies.'
  },
  {
    topicId: 'vpn-concepts',
    title: 'Virtual Private Network (VPN) Concepts',
    content: 'A VPN creates a secure, encrypted connection between remote systems or networks. From the user’s perspective, it feels like being directly connected to a private internal network.\n\nVPNs are essential for remote employees, branch offices, and cloud integration. Linux supports various VPN technologies, each designed for different use cases, performance needs, and security requirements.\n\nChoosing the correct VPN type depends on factors such as scalability, encryption strength, and ease of management.'
  },
  {
    topicId: 'site-to-site-vpn-architecture',
    title: 'Site-to-Site VPN Architecture',
    content: 'Site-to-site VPNs connect entire networks securely over the internet. They are commonly used to link branch offices to headquarters.\n\nTraffic between sites is encrypted automatically without user interaction. Linux systems often act as VPN gateways, encrypting and decrypting traffic at the network edge.\n\nThis architecture reduces the need for leased lines while maintaining enterprise-grade security.'
  },
  {
    topicId: 'remote-access-vpn-architecture',
    title: 'Remote Access VPN Architecture',
    content: 'Remote access VPNs allow individual users to securely connect to an enterprise network from any location.\n\nAuthentication, encryption, and access control ensure that only authorized users gain access. Linux VPN servers can integrate with enterprise identity systems.\n\nRemote access VPNs became critical with the rise of remote work and cloud-based infrastructures.'
  },
  {
    topicId: 'openvpn-architecture-security-model',
    title: 'OpenVPN Architecture and Security Model',
    content: 'OpenVPN is a widely used VPN solution that operates in user space and uses SSL/TLS for encryption.\n\nIt supports flexible authentication methods, including certificates, usernames, and multi-factor authentication. OpenVPN can operate over UDP or TCP, making it adaptable to restrictive networks.\n\nLinux systems are commonly used to host OpenVPN servers due to stability and performance.'
  },
  {
    topicId: 'wireguard-vpn-design-principles',
    title: 'WireGuard VPN Design Principles',
    content: 'WireGuard is a modern VPN protocol designed for simplicity, speed, and strong cryptography.\n\nUnlike traditional VPNs, WireGuard has a small codebase, reducing attack surface and simplifying audits. It uses state-of-the-art cryptographic algorithms.\n\nWireGuard is ideal for high-performance environments and cloud-native deployments.'
  },
  {
    topicId: 'openvpn-vs-wireguard',
    title: 'Comparison of OpenVPN and WireGuard',
    content: 'OpenVPN and WireGuard serve similar purposes but differ significantly in design.\n\nOpenVPN offers extensive flexibility and compatibility, while WireGuard prioritizes performance and simplicity.\n\nUnderstanding these differences helps administrators choose the right VPN solution for their environment.'
  },
  {
    topicId: 'vpn-encryption-authentication',
    title: 'Encryption and Authentication in VPNs',
    content: 'Encryption protects data confidentiality, while authentication verifies the identity of connecting parties.\n\nVPNs rely on cryptographic algorithms to secure traffic and prevent unauthorized access. Linux supports robust cryptographic frameworks.\n\nCorrect encryption and authentication choices are essential for enterprise security compliance.'
  },
  {
    topicId: 'key-exchange-handshake-mechanisms',
    title: 'Key Exchange and Handshake Mechanisms',
    content: 'Key exchange establishes shared secrets used for encryption.\n\nSecure handshakes ensure that encryption keys are negotiated safely, even over untrusted networks.\n\nLinux VPN implementations rely on proven cryptographic protocols to prevent man-in-the-middle attacks.'
  },
  {
    topicId: 'ssh-tunneling-fundamentals',
    title: 'SSH Tunneling Fundamentals',
    content: 'SSH tunneling creates encrypted tunnels using the SSH protocol.\n\nIt is commonly used for quick, temporary secure connections and port forwarding. SSH tunnels are easy to set up and widely supported.\n\nWhile not a full VPN replacement, SSH tunneling is valuable for secure access to specific services.'
  },
  {
    topicId: 'ssh-port-forwarding-local-remote-dynamic',
    title: 'Local, Remote, and Dynamic Port Forwarding',
    content: 'SSH supports different types of port forwarding for flexible traffic redirection.\n\nLocal forwarding sends traffic from the local machine to a remote destination. Remote forwarding exposes local services to remote systems.\n\nDynamic forwarding creates a SOCKS proxy for flexible browsing and application access.'
  },
  {
    topicId: 'socks-proxy-with-ssh',
    title: 'SOCKS Proxy with SSH',
    content: 'A SOCKS proxy allows applications to route traffic through an SSH tunnel.\n\nThis provides encryption without modifying application configurations. Linux users often use SOCKS proxies for secure browsing.\n\nSOCKS proxies are lightweight and useful for selective tunneling.'
  },
  {
    topicId: 'gre-tunnels-and-use-cases',
    title: 'GRE Tunnels and Use Cases',
    content: 'GRE (Generic Routing Encapsulation) tunnels encapsulate packets without encryption.\n\nThey are often combined with IPsec to add security. GRE is useful for carrying non-IP traffic and routing protocols.\n\nLinux supports GRE for complex routing and tunneling scenarios.'
  },
  {
    topicId: 'ipsec-tunnel-modes',
    title: 'IPsec Tunnel Modes',
    content: 'IPsec provides strong encryption at the network layer.\n\nIt supports transport mode and tunnel mode, each serving different use cases. IPsec is widely used in enterprise VPNs.\n\nLinux offers powerful IPsec implementations for secure site-to-site connectivity.'
  }
];

(async () => {
  try {
    console.log('Connecting to', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    const before = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    if (!before) {
      console.error('❌ Assignment not found:', ASSIGNMENT_ID);
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log('Before:', {
      title: before.title,
      topics: Array.isArray(before.topics) ? before.topics.length : 0,
      description: before.description
    });

    const res = await Assignment.updateOne(
      { assignmentId: ASSIGNMENT_ID },
      { $set: { title: NEW_TITLE, description: NEW_DESCRIPTION, topics, updatedAt: new Date() } }
    );

    console.log('Update result:', { matched: res.matchedCount, modified: res.modifiedCount });

    const after = await Assignment.findOne({ assignmentId: ASSIGNMENT_ID }).lean();
    console.log('After:', {
      title: after.title,
      topics: Array.isArray(after.topics) ? after.topics.length : 0,
      firstTopic: after.topics?.[0]?.title,
      description: after.description
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('❌ Update failed:', e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();