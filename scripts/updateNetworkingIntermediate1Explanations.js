require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';

// Flexible schema to allow explanation field on topics
const assignmentSchema = new mongoose.Schema({
  assignmentId: String,
  title: String,
  description: String,
  topics: [
    { topicId: String, title: String, content: String, explanation: String, examples: [String], syntax: String }
  ],
}, { strict: false });

const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

// Explanations provided by user (topics 1–15)
const explanations = {
  'ns-intro': `Linux Network Namespaces are a kernel feature that enables complete isolation of networking resources within a single Linux system. Each network namespace has its own network stack, including interfaces, IP addresses, routing tables, firewall rules, and ARP tables. This allows multiple isolated network environments to coexist on the same machine without interference.

Network namespaces are fundamental to container technologies such as Docker and Kubernetes, where each container operates in its own isolated network environment. They provide VM-like isolation without the overhead of running multiple kernels. Administrators can create namespaces to simulate enterprise networks, isolate services for security, or test routing and firewall configurations safely.

Because namespaces share the same kernel, communication between them must be explicitly configured using virtual interfaces or bridges. This design makes namespaces both powerful and secure when implemented correctly.`,

  'proc-vs-net': `Process isolation and network isolation serve different but complementary purposes in Linux systems. Process isolation ensures that one application cannot interfere with another’s memory, CPU, or file access, while network isolation ensures that applications cannot see or interfere with each other’s network traffic.

Network namespaces isolate only the networking components, not the process itself. A process may run in a different network namespace while still sharing the same filesystem or process namespace. This separation allows flexible isolation models where applications share system resources but remain completely separated at the network level.

Understanding the difference is critical for secure system design. Many security breaches occur when network isolation is assumed but not implemented correctly. Combining network namespaces with other namespace types provides strong isolation comparable to containers or lightweight virtualization.`,

  'veth-pairs': `A veth (virtual ethernet) pair is a pair of interconnected virtual network interfaces. Packets sent through one interface immediately appear on the other, making them ideal for connecting network namespaces.

veth pairs act as virtual cables and are commonly used to connect containers or namespaces to the host system or to virtual bridges. One end of the veth pair is placed in a namespace, while the other remains on the host or another namespace.

This mechanism allows traffic flow control, firewall enforcement, and routing between isolated environments. veth pairs are lightweight, fast, and essential for building advanced virtual network topologies.`,

  'lo-behavior': `Each network namespace has its own loopback interface (lo). Unlike physical interfaces, the loopback interface does not automatically come up when a namespace is created and must be enabled manually.

The loopback interface is critical for internal communication within a namespace. Many applications rely on localhost communication, and without enabling lo, these applications may fail unexpectedly.

Understanding loopback behavior is crucial when troubleshooting container or namespace networking issues. Proper initialization of the loopback interface ensures application stability and consistent network behavior.`,

  'ns-firewall': `Firewall rules in Linux are namespace-aware. Each network namespace maintains its own independent firewall configuration using iptables or nftables. Rules applied in one namespace do not affect traffic in another.

This enables granular security control where each isolated environment can have its own firewall policy. For example, a web application namespace may allow HTTP/HTTPS traffic, while another namespace running a database service blocks all external connections.

Namespace-based firewalling is particularly useful in multi-tenant systems, containerized environments, and security labs where different applications require different security policies.`,

  'ns-routing': `Routing tables are fully isolated within each network namespace. This means that default gateways, static routes, and policy routing rules can differ across namespaces.

This capability allows complex routing scenarios such as multiple gateways, traffic redirection, and isolated routing paths on a single host. Each namespace behaves like an independent router from a routing perspective.

Per-namespace routing is essential for VPN containers, lab simulations, and enterprise testing environments where routing behavior must be controlled precisely.`,

  'dns-inside-ns': `DNS resolution inside a network namespace can be configured independently from the host. Each namespace can use a different DNS server, search domain, or resolution strategy.

This is critical for containers or applications that require custom DNS resolution, such as service discovery, internal enterprise domains, or split-horizon DNS setups.

Improper DNS configuration inside namespaces is a common cause of connectivity issues. Understanding how DNS interacts with namespaces helps ensure reliable network communication.`,

  'app-isolation': `Network namespaces allow individual applications to run with their own isolated network environment without needing full containers or virtual machines.

This approach is useful for sandboxing applications, testing network behavior, or limiting network access for security reasons. Applications can be restricted to specific interfaces, IP addresses, or routes.

This lightweight isolation is ideal for security-sensitive applications, penetration testing labs, and controlled execution environments.`,

  'ns-communication-models': `By default, network namespaces cannot communicate with each other. Communication must be explicitly enabled using veth pairs, bridges, or routing configurations.

Different communication models include:

Direct namespace-to-namespace communication

Namespace-to-host communication

Namespace-to-bridge communication

Choosing the correct model depends on security requirements and network design. Proper configuration ensures controlled and predictable traffic flow.`,

  'ns-cleanup': `When namespaces are no longer needed, they must be properly deleted to free system resources. Orphaned namespaces can lead to unused interfaces, routing entries, and firewall rules.

Linux provides tools to list and remove namespaces safely. Resource management is especially important in automated systems where namespaces are frequently created and destroyed.

Good cleanup practices prevent memory leaks, configuration conflicts, and performance degradation.`,

  'ns-security-risks': `While namespaces provide isolation, misconfiguration can introduce security risks. Improper routing, exposed interfaces, or weak firewall rules can allow unauthorized access.

Namespaces should be combined with least-privilege principles, firewall enforcement, and monitoring. Administrators must understand how namespaces interact with the host and other namespaces.

Security audits and controlled access policies help mitigate namespace-related risks.`,

  'ns-performance': `Network namespaces introduce minimal overhead, but performance can be affected by excessive virtual interfaces, complex routing, or heavy firewall rules.

High-throughput environments must consider interface queue sizes, CPU affinity, and packet processing paths. Performance tuning ensures namespaces scale efficiently in enterprise environments.

Monitoring tools help identify bottlenecks and optimize configurations.`,

  'ns-network-labs': `Network namespaces are widely used to build realistic network labs on a single machine. Students and engineers can simulate routers, firewalls, clients, and servers without physical hardware.

This makes namespaces ideal for training, certification preparation, and experimentation. Labs can be recreated easily, shared, and automated.

Namespaces significantly reduce infrastructure costs while providing hands-on experience.`,

  'ns-troubleshooting': `Troubleshooting namespace networking requires understanding isolation boundaries. Common issues include missing routes, down interfaces, disabled loopback devices, and firewall blocks.

Tools like ip, ping, tcpdump, and ss can be executed inside namespaces to diagnose problems. Systematic troubleshooting ensures quick resolution of connectivity issues.

A structured approach prevents misdiagnosis and configuration errors.`,

  'ns-real-world': `In real-world environments, network namespaces are used in:

Container orchestration platforms

Cloud multi-tenant systems

Security testing environments

Enterprise application isolation

DevOps and CI/CD pipelines

Their flexibility and efficiency make them a core technology in modern Linux networking. Mastering namespaces is essential for advanced Linux administrators and network engineers.`
};

// Desired topic ordering and minimal summaries for new topics
const desiredTopics = [
  { topicId: 'ns-intro', title: 'Linux Network Namespaces', summary: 'Overview and isolation of network stacks per namespace.' },
  { topicId: 'proc-vs-net', title: 'Process Isolation vs Network Isolation', summary: 'Differences and complementary roles in Linux isolation.' },
  { topicId: 'veth-pairs', title: 'veth Pairs and Virtual Ethernet Devices', summary: 'Virtual interfaces connecting namespaces and bridges.' },
  { topicId: 'lo-behavior', title: 'Linux Loopback Behavior in Isolated Environments', summary: 'Loopback per namespace; enable and troubleshoot.' },
  { topicId: 'ns-firewall', title: 'Namespace-Based Firewalling', summary: 'Per-namespace iptables/nftables and granular policies.' },
  { topicId: 'ns-routing', title: 'Per-Namespace Routing Tables', summary: 'Independent routing tables, gateways, and policies.' },
  { topicId: 'dns-inside-ns', title: 'DNS Handling Inside Network Namespaces', summary: 'Per-namespace DNS config and common pitfalls.' },
  { topicId: 'app-isolation', title: 'Isolating Applications Using Network Namespaces', summary: 'Sandbox apps with isolated interfaces and routes.' },
  { topicId: 'ns-communication-models', title: 'Namespace Communication Models', summary: 'Direct, host, and bridge communication patterns.' },
  { topicId: 'ns-cleanup', title: 'Namespace Cleanup and Resource Management', summary: 'Safe deletion and avoiding orphaned resources.' },
  { topicId: 'ns-security-risks', title: 'Network Namespace Security Risks', summary: 'Misconfiguration risks and mitigation strategies.' },
  { topicId: 'ns-performance', title: 'Namespace Performance Considerations', summary: 'Tuning interfaces, queues, and packet paths.' },
  { topicId: 'ns-network-labs', title: 'Using Namespaces for Network Labs', summary: 'Lab simulation, training, and automation benefits.' },
  { topicId: 'ns-troubleshooting', title: 'Troubleshooting Namespace Connectivity', summary: 'Tools and a structured diagnostic approach.' },
  { topicId: 'ns-real-world', title: 'Real-World Use Cases of Namespaces', summary: 'Containers, cloud multi-tenancy, and CI/CD.' },
];

async function run() {
  try {
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const assignmentId = 'networking-intermediate-1';
    let doc = await Assignment.findOne({ assignmentId });
    if (!doc) throw new Error(`Assignment not found: ${assignmentId}`);

    const existing = Array.isArray(doc.topics) ? doc.topics : [];
    const byId = new Map();
    for (const t of existing) {
      if (t.topicId) byId.set(t.topicId, t);
    }

    const updatedTopics = [];
    for (const target of desiredTopics) {
      const prev = byId.get(target.topicId) || {};
      const contentSummary = prev.content || target.summary;
      updatedTopics.push({
        topicId: target.topicId,
        title: target.title,
        content: typeof contentSummary === 'string' ? contentSummary : String(contentSummary || ''),
        explanation: explanations[target.topicId] || prev.explanation || '',
        examples: prev.examples || [],
        syntax: prev.syntax || ''
      });
    }

    doc.topics = updatedTopics;
    doc.updatedAt = new Date();
    await doc.save();

    console.log(`✅ Updated explanations for topics 1–15 of '${assignmentId}'.`);
    updatedTopics.forEach((t, i) => {
      console.log(`  [${i + 1}] ${t.title} | explLen=${(t.explanation || '').length} | contentLen=${(t.content || '').length}`);
    });

    await mongoose.connection.close();
    console.log('✅ Done.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating explanations:', err);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
}

if (require.main === module) {
  run();
}