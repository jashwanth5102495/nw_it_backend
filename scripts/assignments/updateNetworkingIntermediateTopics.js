require('dotenv').config({ path: "../../.env" });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jasnav_projects';

const assignmentSchema = new mongoose.Schema({
  assignmentId: String,
  title: String,
  description: String,
  topics: [
    { topicId: String, title: String, content: String, explanation: String, examples: [String], syntax: String }
  ],
}, { strict: false });

const Assignment = mongoose.model('Assignment', assignmentSchema, 'assignments');

const assignmentMetadata = {
  'networking-intermediate-1': {
    courseId: 'networking-intermediate',
    title: 'Assignment 1: Advanced Linux Network Isolation',
    description: 'Hands-on with Linux network namespaces, veth pairs, isolation patterns, and per-namespace configuration.',
    passingPercentage: 60
  },
  'networking-intermediate-2': {
    courseId: 'networking-intermediate',
    title: 'Assignment 2: Dynamic Firewall and Security Rules',
    description: 'Advanced firewall concepts including conntrack, rule ordering, dynamic evaluation, and performance tuning.',
    passingPercentage: 60
  },
  'networking-intermediate-3': {
    courseId: 'networking-intermediate',
    title: 'Assignment 3: High Availability Networking',
    description: 'Design HA networking with redundancy, bonding, LACP, bridges, VRRP, and rapid failover.',
    passingPercentage: 60
  },
  'networking-intermediate-4': {
    courseId: 'networking-intermediate',
    title: 'Assignment 4: Enterprise Routing & Segmentation',
    description: 'Enterprise routing and segmentation on Linux: IP forwarding, static/dynamic routing, policy-based routing, VLANs, and inter-VLAN routing.',
    passingPercentage: 60
  },
  'networking-intermediate-5': {
    courseId: 'networking-intermediate',
    title: 'Assignment 5: Secure Network Tunnels and VPNs',
    description: 'Secure tunneling fundamentals; VPN concepts; site-to-site and remote access architectures; OpenVPN, WireGuard, SSH tunneling, GRE, and IPsec.',
    passingPercentage: 60
  },
  'networking-intermediate-6': {
    courseId: 'networking-intermediate',
    title: 'Assignment 6: Monitoring, Logging, and Performance Tools',
    description: 'Enterprise-grade network monitoring with SNMP, Nagios, Zabbix, syslog, alerting, and performance analysis.',
    passingPercentage: 60
  }
};

const topicsByAssignment = {
  'networking-intermediate-1': [
    { topicId: 'ns-intro', title: 'Linux Network Namespaces', content: 'Linux Network Namespaces are a kernel feature that enables complete isolation of networking resources within a single Linux system. Each network namespace has its own network stack, including interfaces, IP addresses, routing tables, firewall rules, and ARP tables. This allows multiple isolated network environments to coexist on the same machine without interference.\n\nNetwork namespaces are fundamental to container technologies such as Docker and Kubernetes, where each container operates in its own isolated network environment. They provide VM-like isolation without the overhead of running multiple kernels.' },
    { topicId: 'proc-vs-net', title: 'Process Isolation vs Network Isolation', content: 'Process isolation and network isolation serve different but complementary purposes in Linux systems. Process isolation ensures that one application cannot interfere with another\'s memory, CPU, or file access, while network isolation ensures that applications cannot see or interfere with each other\'s network traffic.\n\nNetwork namespaces isolate only the networking components, not the process itself. A process may run in a different network namespace while still sharing the same filesystem or process namespace.' },
    { topicId: 'veth-pairs', title: 'veth Pairs and Virtual Ethernet Devices', content: 'A veth (virtual ethernet) pair is a pair of interconnected virtual network interfaces. Packets sent through one interface immediately appear on the other, making them ideal for connecting network namespaces.\n\nveth pairs act as virtual cables and are commonly used to connect containers or namespaces to the host system or to virtual bridges. One end of the veth pair is placed in a namespace, while the other remains on the host or another namespace.' },
    { topicId: 'lo-behavior', title: 'Linux Loopback Behavior in Isolated Environments', content: 'Each network namespace has its own loopback interface (lo). Unlike physical interfaces, the loopback interface does not automatically come up when a namespace is created and must be enabled manually.\n\nThe loopback interface is critical for internal communication within a namespace. Many applications rely on localhost communication, and without enabling lo, these applications may fail unexpectedly.' },
    { topicId: 'ns-firewall', title: 'Namespace-Based Firewalling', content: 'Firewall rules in Linux are namespace-aware. Each network namespace maintains its own independent firewall configuration using iptables or nftables. Rules applied in one namespace do not affect traffic in another.\n\nThis enables granular security control where each isolated environment can have its own firewall policy.' },
    { topicId: 'ns-routing', title: 'Per-Namespace Routing Tables', content: 'Routing tables are fully isolated within each network namespace. This means that default gateways, static routes, and policy routing rules can differ across namespaces.\n\nThis capability allows complex routing scenarios such as multiple gateways, traffic redirection, and isolated routing paths on a single host.' },
    { topicId: 'dns-inside-ns', title: 'DNS Handling Inside Network Namespaces', content: 'DNS resolution inside a network namespace can be configured independently from the host. Each namespace can use a different DNS server, search domain, or resolution strategy.\n\nThis is critical for containers or applications that require custom DNS resolution, such as service discovery, internal enterprise domains, or split-horizon DNS setups.' },
    { topicId: 'app-isolation', title: 'Isolating Applications Using Network Namespaces', content: 'Network namespaces allow individual applications to run with their own isolated network environment without needing full containers or virtual machines.\n\nThis approach is useful for sandboxing applications, testing network behavior, or limiting network access for security reasons.' },
    { topicId: 'ns-communication-models', title: 'Namespace Communication Models', content: 'By default, network namespaces cannot communicate with each other. Communication must be explicitly enabled using veth pairs, bridges, or routing configurations.\n\nDifferent communication models include: Direct namespace-to-namespace, Namespace-to-host, and Namespace-to-bridge communication.' },
    { topicId: 'ns-cleanup', title: 'Namespace Cleanup and Resource Management', content: 'When namespaces are no longer needed, they must be properly deleted to free system resources. Orphaned namespaces can lead to unused interfaces, routing entries, and firewall rules.\n\nLinux provides tools to list and remove namespaces safely. Resource management is especially important in automated systems.' },
    { topicId: 'ns-security-risks', title: 'Network Namespace Security Risks', content: 'While namespaces provide isolation, misconfiguration can introduce security risks. Improper routing, exposed interfaces, or weak firewall rules can allow unauthorized access.\n\nNamespaces should be combined with least-privilege principles, firewall enforcement, and monitoring.' },
    { topicId: 'ns-performance', title: 'Namespace Performance Considerations', content: 'Network namespaces introduce minimal overhead, but performance can be affected by excessive virtual interfaces, complex routing, or heavy firewall rules.\n\nHigh-throughput environments must consider interface queue sizes, CPU affinity, and packet processing paths.' },
    { topicId: 'ns-network-labs', title: 'Using Namespaces for Network Labs', content: 'Network namespaces are widely used to build realistic network labs on a single machine. Students and engineers can simulate routers, firewalls, clients, and servers without physical hardware.\n\nThis makes namespaces ideal for training, certification preparation, and experimentation.' },
    { topicId: 'ns-troubleshooting', title: 'Troubleshooting Namespace Connectivity', content: 'Troubleshooting namespace networking requires understanding isolation boundaries. Common issues include missing routes, down interfaces, disabled loopback devices, and firewall blocks.\n\nTools like ip, ping, tcpdump, and ss can be executed inside namespaces to diagnose problems.' },
    { topicId: 'ns-real-world', title: 'Real-World Use Cases of Namespaces', content: 'In real-world environments, network namespaces are used in container orchestration platforms, cloud multi-tenant systems, security testing environments, enterprise application isolation, and DevOps/CI/CD pipelines.\n\nTheir flexibility and efficiency make them a core technology in modern Linux networking.' },
  ],

  'networking-intermediate-2': [
    { topicId: 'stateful-vs-stateless', title: 'Stateful vs Stateless Firewalls in Linux', content: 'Firewalls in Linux can operate in stateful or stateless modes. A stateless firewall evaluates each packet independently, without considering previous packets. It only checks packet headers such as source IP, destination IP, port, and protocol. While simple and fast, stateless firewalls lack context and are less secure.\n\nStateful firewalls, on the other hand, track the state of network connections. They understand whether a packet is part of a new connection, an established one, or a related session. Linux firewalls like iptables and nftables use connection tracking to implement stateful filtering.' },
    { topicId: 'conntrack-internals', title: 'Connection Tracking (conntrack) Internals', content: 'Connection tracking, commonly known as conntrack, is a kernel feature that tracks the lifecycle of network connections. Each connection is stored in a table with information such as source/destination IPs, ports, protocol, and connection state.\n\nConntrack enables advanced firewall features such as stateful filtering, NAT, and connection-based logging. It classifies traffic into states like NEW, ESTABLISHED, RELATED, and INVALID.' },
    { topicId: 'dynamic-firewall-evaluation', title: 'Dynamic Firewall Rule Evaluation', content: 'Dynamic firewall rule evaluation allows Linux firewalls to change behavior based on traffic patterns instead of relying only on static rules. This means firewall decisions can adapt in real time based on connection rate, session history, or detected anomalies.\n\nDynamic rules improve security by responding to threats automatically. For example, repeated failed login attempts from an IP can trigger temporary blocking without administrator intervention.' },
    { topicId: 'rule-ordering-optimization', title: 'Firewall Rule Ordering and Optimization', content: 'Firewall rules are evaluated sequentially from top to bottom. Rule ordering directly impacts both security effectiveness and performance. Poorly ordered rules can lead to unintended access or unnecessary CPU usage.\n\nOptimized firewall design places the most frequently matched rules at the top and drops unwanted traffic early.' },
    { topicId: 'rate-limiting-strategies', title: 'Rate Limiting Strategies in Firewalls', content: 'Rate limiting controls how many packets or connections are allowed within a specific time window. This technique protects systems from brute-force attacks, floods, and denial-of-service attempts.\n\nLinux firewalls can enforce rate limits based on IP address, protocol, or service.' },
    { topicId: 'temporary-ip-blocking', title: 'Temporary IP Blocking Mechanisms', content: 'Temporary IP blocking allows a firewall to block suspicious IPs for a limited time instead of permanently banning them. This approach balances security and usability.\n\nLinux firewalls can track repeated offenses and automatically apply temporary bans.' },
    { topicId: 'time-based-rules', title: 'Time-Based Firewall Rules', content: 'Time-based firewall rules allow traffic to be permitted or denied based on specific time periods. This is useful for enforcing business-hour access policies or maintenance windows.\n\nFor example, administrative access may be allowed only during working hours, while external access is blocked overnight.' },
    { topicId: 'geoip-filtering', title: 'Geo-IP Based Firewall Filtering', content: 'Geo-IP filtering blocks or allows traffic based on the geographic location of IP addresses. This helps reduce attack exposure by limiting access to regions where legitimate users are located.\n\nLinux firewalls can integrate IP-to-country databases to implement geo-based filtering.' },
    { topicId: 'application-aware-firewalling', title: 'Application-Aware Firewalling', content: 'Application-aware firewalling goes beyond ports and protocols to understand application behavior. Instead of just allowing port 80, the firewall can distinguish between different types of traffic on the same port.\n\nThis improves security by preventing misuse of allowed ports and detecting abnormal application behavior.' },
    { topicId: 'firewall-performance-tuning', title: 'Firewall Rule Performance Tuning', content: 'Firewall performance tuning ensures that packet filtering does not become a bottleneck. Poorly designed rulesets can increase latency and CPU usage.\n\nPerformance tuning includes reducing rule count, optimizing rule order, using ipsets, and minimizing logging overhead.' },
    { topicId: 'firewall-logging', title: 'Firewall Logging and SIEM Integration', content: 'Firewall logging records traffic decisions for analysis and compliance. Logs help detect anomalies, troubleshoot connectivity, and provide audit trails.\n\nIntegration with SIEM systems enables centralized analysis and automated alerting.' },
    { topicId: 'firewall-zones', title: 'Firewall Zones and Trust Levels', content: 'Firewall zones group interfaces by trust level. Traffic between zones can be controlled with different policies.\n\nThis approach simplifies management in complex networks with multiple security requirements.' },
    { topicId: 'ipset-usage', title: 'Using ipset for Efficient Matching', content: 'ipset allows grouping IP addresses, networks, or ports into sets that can be referenced in firewall rules. This significantly improves performance when dealing with large lists.\n\nipset is essential for blocklists, allowlists, and dynamic rule updates.' },
    { topicId: 'nftables-advantages', title: 'nftables vs iptables', content: 'nftables is the modern replacement for iptables in Linux. It offers a unified syntax, better performance, and improved rule management.\n\nUnderstanding nftables is essential for managing firewalls on current Linux distributions.' },
    { topicId: 'firewall-troubleshooting', title: 'Firewall Troubleshooting Techniques', content: 'Troubleshooting firewalls requires understanding rule evaluation order, connection states, and logging. Common issues include blocked legitimate traffic and unintended access.\n\nSystematic debugging with packet traces and rule analysis ensures quick resolution.' },
  ],

  'networking-intermediate-3': [
    { topicId: 'ha-fundamentals', title: 'High Availability (HA) Networking Fundamentals', content: 'High Availability networking is a design approach focused on minimizing downtime and service disruption by eliminating single points of failure. In Linux environments, HA networking ensures that even if a network interface, switch, router, or server fails, traffic continues to flow without manual intervention.\n\nHA networking relies on redundancy, monitoring, automatic failover, and fast recovery.' },
    { topicId: 'redundancy-vs-fault-tolerance', title: 'Redundancy vs Fault Tolerance in Networks', content: 'Redundancy and fault tolerance are related but not identical concepts. Redundancy means having backup components, such as multiple NICs or switches. Fault tolerance means the system continues operating correctly even when a failure occurs.\n\nA redundant network without proper failover logic may still experience downtime if traffic is not automatically redirected.' },
    { topicId: 'linux-nic-bonding-overview', title: 'Linux NIC Bonding Overview', content: 'NIC bonding allows multiple network interfaces to be combined into a single logical interface. This provides link redundancy, load balancing, or both, depending on the bonding mode used.\n\nFrom the operating system\'s perspective, the bonded interface appears as one device, simplifying configuration for applications and services.' },
    { topicId: 'active-backup-bonding', title: 'Active-Backup Bonding Mode', content: 'Active-backup is the most commonly used bonding mode for high availability. In this mode, only one interface actively carries traffic, while the others remain on standby.\n\nIf the active interface fails, one of the backup interfaces automatically takes over, typically within milliseconds.' },
    { topicId: 'load-balancing-bonding-modes', title: 'Load Balancing Bonding Modes', content: 'Load balancing bonding modes distribute network traffic across multiple interfaces to improve throughput and reduce congestion. Examples include round-robin and XOR modes.\n\nThese modes not only provide redundancy but also maximize bandwidth utilization.' },
    { topicId: 'lacp-8023ad', title: 'LACP (802.3ad) Link Aggregation', content: 'LACP is an IEEE standard that allows dynamic negotiation between Linux systems and network switches to form link aggregation groups.\n\nIn Linux, LACP provides both redundancy and load balancing while ensuring that only properly configured links are used.' },
    { topicId: 'link-monitoring-failure-detection', title: 'Link Monitoring and Failure Detection', content: 'Effective HA networking depends on accurate detection of failures. Linux bonding supports multiple link monitoring mechanisms such as MII monitoring and ARP monitoring.\n\nMII monitoring checks the physical link status, while ARP monitoring verifies end-to-end connectivity by sending ARP requests.' },
    { topicId: 'linux-bridge-ha', title: 'Linux Bridge and High Availability', content: 'Linux bridges connect multiple network interfaces at Layer 2, allowing traffic to pass between them as if they were part of the same switch.\n\nIn HA setups, bridges are often combined with bonding to provide redundant uplinks for virtual machines and containers.' },
    { topicId: 'stp-linux-bridges', title: 'Spanning Tree Protocol (STP) in Linux Bridges', content: 'STP prevents network loops by dynamically disabling redundant paths. While loops can increase availability, they can also cause broadcast storms if unmanaged.\n\nLinux bridges support STP to ensure safe redundancy.' },
    { topicId: 'vrrp-keepalived', title: 'VRRP and Keepalived', content: 'VRRP (Virtual Router Redundancy Protocol) provides automatic failover for default gateways. Keepalived is the most common VRRP implementation for Linux.\n\nVRRP ensures that clients always reach an available gateway without manual reconfiguration.' },
    { topicId: 'multi-path-routing', title: 'Multi-Path Routing', content: 'Multi-path routing distributes traffic across multiple routes to the same destination. This improves bandwidth utilization and provides redundancy.\n\nLinux supports ECMP (Equal-Cost Multi-Path) routing for load distribution.' },
    { topicId: 'failover-testing', title: 'Testing HA and Failover', content: 'Testing HA configurations is critical to ensure they work as expected during real failures. Simulate failures by disabling interfaces, unplugging cables, or stopping services.\n\nDocument expected behavior and validate recovery times.' },
    { topicId: 'ha-monitoring', title: 'Monitoring HA Systems', content: 'Continuous monitoring ensures HA components are healthy and ready for failover. Monitor link status, bonding state, VRRP status, and failover events.\n\nAlerting on degraded states allows proactive remediation before failures impact users.' },
    { topicId: 'ha-design-patterns', title: 'HA Network Design Patterns', content: 'Common HA patterns include dual-homed servers, redundant switches, stacked switches, and geographic redundancy.\n\nChoosing the right pattern depends on budget, performance requirements, and acceptable downtime.' },
    { topicId: 'ha-troubleshooting', title: 'Troubleshooting HA Networks', content: 'HA troubleshooting requires understanding failover logic, timing, and dependencies. Common issues include split-brain scenarios, slow failover, and misconfigured priorities.\n\nSystematic testing and logging help identify root causes.' },
  ],

  'networking-intermediate-4': [
    { topicId: 'enterprise-routing-fundamentals', title: 'Enterprise Routing Fundamentals', content: 'Enterprise routing focuses on moving packets across large, segmented environments with multiple subnets, departments, and security zones. Linux commonly acts as routers, firewalls, and gateways due to its flexibility and performance. Good enterprise routing emphasizes scalability, redundancy, policy control, and security.' },
    { topicId: 'linux-kernel-ip-forwarding', title: 'Linux Kernel IP Forwarding', content: 'IP forwarding allows a Linux host to route packets between interfaces. By default, Linux is an end host; enabling IP forwarding changes kernel behavior to forward packets. IP forwarding underpins NAT, VPN gateways, and firewall routers.' },
    { topicId: 'static-routing-linux', title: 'Static Routing in Linux', content: 'Static routing defines fixed paths for specific networks that change only when modified by administrators. Static routes are predictable, secure, and resource-efficient, fitting for small segments or backbone routes that rarely change.' },
    { topicId: 'dynamic-routing-concepts', title: 'Dynamic Routing Concepts', content: 'Dynamic routing learns and updates routes automatically based on network conditions. In enterprise environments, dynamic routing improves resilience by recalculating paths when links fail. Linux supports dynamic routing via routing daemons.' },
    { topicId: 'policy-based-routing', title: 'Policy-Based Routing (PBR)', content: 'Policy-Based Routing chooses routes using rules beyond destination, such as source IP, interface, or packet marks. PBR is widely used for traffic segmentation, multi-ISP designs, and security enforcement.' },
    { topicId: 'multiple-routing-tables', title: 'Multiple Routing Tables in Linux', content: 'Linux supports multiple routing tables concurrently. Each table can hold different routes, and rules decide which table applies per packet. This enables complex flows like separating management traffic from user traffic.' },
    { topicId: 'route-metrics-priorities', title: 'Route Metrics and Priorities', content: 'Route metrics determine preference when multiple routes exist to the same destination. Lower metric values have higher priority. Proper metric configuration ensures predictable routing.' },
    { topicId: 'vlan-based-segmentation', title: 'VLAN-Based Network Segmentation', content: 'VLANs provide logical segmentation over shared physical links. Enterprises use VLANs to separate departments, apps, and security zones while lowering hardware costs. Linux supports VLAN tagging.' },
    { topicId: 'inter-vlan-routing', title: 'Inter-VLAN Routing', content: 'Inter-VLAN routing enables communication between VLANs while maintaining logical separation. Linux can route between VLANs using sub-interfaces or bridges with routing rules.' },
    { topicId: 'network-segmentation-security', title: 'Network Segmentation for Security', content: 'Segmentation limits the spread of attacks by isolating systems and services. Enterprises segment by trust level (user, server, management). Linux firewalls and routing policies enforce segmentation boundaries.' },
    { topicId: 'routing-firewall-interaction', title: 'Routing and Firewall Interaction', content: 'Routing decides where packets go; firewalls decide whether they are allowed. On enterprise Linux systems, routing and firewall configurations must align to avoid drops or gaps.' },
    { topicId: 'source-based-routing', title: 'Source-Based Routing', content: 'Source-based routing directs traffic using the source address instead of destination. Useful in multi-homed enterprises where departments use different ISPs.' },
    { topicId: 'default-gateway-redundancy', title: 'Default Gateway Redundancy', content: 'Redundant default gateways remove single points of failure. Linux supports redundancy with route metrics, VRRP, or dynamic routing.' },
    { topicId: 'route-failover-recovery', title: 'Route Failover and Recovery', content: 'Route failover automatically redirects traffic when a route becomes unavailable; recovery restores preferred paths when connectivity returns.' },
    { topicId: 'routing-troubleshooting', title: 'Routing Troubleshooting', content: 'Routing troubleshooting involves verifying routes, checking forwarding status, analyzing packet paths, and reviewing firewall interactions. Tools like ip route, traceroute, and tcpdump help diagnose issues.' },
  ],

  'networking-intermediate-5': [
    { topicId: 'secure-tunneling-fundamentals', title: 'Secure Tunneling Fundamentals', content: 'Secure tunneling is a technique that encapsulates network traffic inside another protocol to protect it from interception, tampering, and unauthorized access. In enterprise environments, tunneling ensures confidentiality and integrity when data travels over untrusted networks.\n\nTunnels work by wrapping original packets inside encrypted packets, hiding internal network details.' },
    { topicId: 'vpn-concepts', title: 'Virtual Private Network (VPN) Concepts', content: 'A VPN creates a secure, encrypted connection between remote systems or networks. From the user\'s perspective, it feels like being directly connected to a private internal network.\n\nVPNs are essential for remote employees, branch offices, and cloud integration.' },
    { topicId: 'site-to-site-vpn-architecture', title: 'Site-to-Site VPN Architecture', content: 'Site-to-site VPNs connect entire networks securely over the internet. They are commonly used to link branch offices to headquarters.\n\nTraffic between sites is encrypted automatically without user interaction.' },
    { topicId: 'remote-access-vpn-architecture', title: 'Remote Access VPN Architecture', content: 'Remote access VPNs allow individual users to securely connect to an enterprise network from any location.\n\nAuthentication, encryption, and access control ensure that only authorized users gain access.' },
    { topicId: 'openvpn-architecture-security-model', title: 'OpenVPN Architecture and Security Model', content: 'OpenVPN is a widely used VPN solution that operates in user space and uses SSL/TLS for encryption.\n\nIt supports flexible authentication methods, including certificates, usernames, and multi-factor authentication.' },
    { topicId: 'wireguard-vpn-design-principles', title: 'WireGuard VPN Design Principles', content: 'WireGuard is a modern VPN protocol designed for simplicity, speed, and strong cryptography.\n\nUnlike traditional VPNs, WireGuard has a small codebase, reducing attack surface and simplifying audits.' },
    { topicId: 'openvpn-vs-wireguard', title: 'Comparison of OpenVPN and WireGuard', content: 'OpenVPN and WireGuard serve similar purposes but differ significantly in design.\n\nOpenVPN offers extensive flexibility and compatibility, while WireGuard prioritizes performance and simplicity.' },
    { topicId: 'vpn-encryption-authentication', title: 'Encryption and Authentication in VPNs', content: 'Encryption protects data confidentiality, while authentication verifies the identity of connecting parties.\n\nVPNs rely on cryptographic algorithms to secure traffic and prevent unauthorized access.' },
    { topicId: 'key-exchange-handshake-mechanisms', title: 'Key Exchange and Handshake Mechanisms', content: 'Key exchange establishes shared secrets used for encryption.\n\nSecure handshakes ensure that encryption keys are negotiated safely, even over untrusted networks.' },
    { topicId: 'ssh-tunneling-fundamentals', title: 'SSH Tunneling Fundamentals', content: 'SSH tunneling creates encrypted tunnels using the SSH protocol.\n\nIt is commonly used for quick, temporary secure connections and port forwarding.' },
    { topicId: 'ssh-port-forwarding-local-remote-dynamic', title: 'Local, Remote, and Dynamic Port Forwarding', content: 'SSH supports different types of port forwarding for flexible traffic redirection.\n\nLocal forwarding sends traffic from the local machine to a remote destination. Remote forwarding exposes local services to remote systems. Dynamic forwarding creates a SOCKS proxy.' },
    { topicId: 'socks-proxy-with-ssh', title: 'SOCKS Proxy with SSH', content: 'A SOCKS proxy allows applications to route traffic through an SSH tunnel.\n\nThis provides encryption without modifying application configurations.' },
    { topicId: 'gre-tunnels-and-use-cases', title: 'GRE Tunnels and Use Cases', content: 'GRE (Generic Routing Encapsulation) tunnels encapsulate packets without encryption.\n\nThey are often combined with IPsec to add security. GRE is useful for carrying non-IP traffic and routing protocols.' },
    { topicId: 'ipsec-tunnel-modes', title: 'IPsec Tunnel Modes', content: 'IPsec provides strong encryption at the network layer.\n\nIt supports transport mode and tunnel mode, each serving different use cases. IPsec is widely used in enterprise VPNs.' },
    { topicId: 'vpn-troubleshooting', title: 'VPN Troubleshooting', content: 'VPN troubleshooting involves checking authentication, encryption negotiation, routing, and firewall rules.\n\nCommon issues include certificate errors, MTU problems, and blocked ports.' },
  ],

  'networking-intermediate-6': [
    { topicId: 'network-monitoring-fundamentals', title: 'Network Monitoring Fundamentals', content: 'Network monitoring is the continuous observation of network performance, availability, and reliability. In enterprise environments, monitoring ensures that services remain operational and performance issues are detected before users are impacted.\n\nLinux-based monitoring tools collect metrics such as bandwidth usage, latency, packet loss, and device availability.' },
    { topicId: 'active-vs-passive-monitoring', title: 'Active vs Passive Monitoring', content: 'Active monitoring involves sending test traffic (such as pings or probes) to measure network health. Passive monitoring observes existing traffic without generating additional packets.\n\nActive monitoring is useful for availability checks, while passive monitoring provides insight into real user behavior.' },
    { topicId: 'snmp-architecture-and-operation', title: 'SNMP Architecture and Operation', content: 'SNMP (Simple Network Management Protocol) is a widely used protocol for monitoring network devices.\n\nIt works using managers, agents, and Management Information Bases (MIBs). Linux systems can act as both SNMP managers and agents.' },
    { topicId: 'snmp-security-considerations', title: 'SNMP Security Considerations', content: 'Early SNMP versions lacked encryption and strong authentication. Modern deployments use SNMPv3, which provides authentication, integrity, and encryption.\n\nSecuring SNMP is critical in enterprises to prevent unauthorized access and information leakage.' },
    { topicId: 'centralized-monitoring-systems', title: 'Centralized Monitoring Systems', content: 'Centralized monitoring systems collect data from multiple devices into a single dashboard.\n\nThis approach simplifies management, troubleshooting, and reporting.' },
    { topicId: 'nagios-monitoring-architecture', title: 'Nagios Monitoring Architecture', content: 'Nagios is a powerful open-source monitoring system used to monitor hosts, services, and network devices.\n\nIt uses plugins to perform checks and triggers alerts when thresholds are exceeded.' },
    { topicId: 'zabbix-monitoring-and-alerting', title: 'Zabbix Monitoring and Alerting', content: 'Zabbix provides integrated monitoring, visualization, and alerting in a single platform.\n\nUnlike plugin-based tools, Zabbix uses agents and templates for automated monitoring.' },
    { topicId: 'alerting-strategies-and-escalation-policies', title: 'Alerting Strategies and Escalation Policies', content: 'Alerting ensures administrators are notified when issues occur.\n\nEffective alerting avoids false positives and alert fatigue. Escalation policies ensure unresolved issues are automatically forwarded to higher-level teams.' },
    { topicId: 'syslog-architecture', title: 'Syslog Architecture', content: 'Syslog is the standard logging protocol used by Linux and network devices.\n\nIt collects logs related to system events, security incidents, and application activity.' },
    { topicId: 'log-rotation-and-retention-policies', title: 'Log Rotation and Retention Policies', content: 'Logs grow rapidly in enterprise environments. Log rotation prevents disk space exhaustion by archiving and deleting old logs.\n\nRetention policies define how long logs are stored for compliance and forensic analysis.' },
    { topicId: 'bandwidth-monitoring-fundamentals', title: 'Bandwidth Monitoring Fundamentals', content: 'Bandwidth monitoring tracks how much data is transmitted and received on network interfaces.\n\nUnderstanding bandwidth usage helps detect congestion, abuse, and capacity planning needs.' },
    { topicId: 'real-time-network-monitoring-tools', title: 'Real-Time Network Monitoring Tools', content: 'Tools like iftop, nload, and bmon provide live views of network traffic.\n\nThese tools help administrators identify top talkers, abnormal traffic patterns, and performance issues in real time.' },
    { topicId: 'system-performance-monitoring', title: 'System Performance Monitoring', content: 'Network performance is closely tied to system resources like CPU, memory, and disk I/O.\n\nLinux tools such as htop and vmstat help correlate network issues with system performance problems.' },
    { topicId: 'network-baseline-creation', title: 'Network Baseline Creation', content: 'A network baseline defines what "normal" performance looks like.\n\nBaselines are used to detect anomalies and deviations that may indicate failures or attacks.' },
    { topicId: 'anomaly-detection-and-troubleshooting', title: 'Anomaly Detection and Troubleshooting', content: 'Anomaly detection identifies unusual patterns in network behavior.\n\nEarly detection allows faster response to security incidents and performance degradation.' },
  ],
};

async function upsertTopics(assignmentId, topics) {
  const metadata = assignmentMetadata[assignmentId] || {};
  const result = await Assignment.findOneAndUpdate(
    { assignmentId },
    { 
      $set: { 
        topics, 
        courseId: metadata.courseId || 'networking-intermediate',
        title: metadata.title || assignmentId,
        description: metadata.description || '',
        passingPercentage: metadata.passingPercentage || 60,
        updatedAt: new Date() 
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    },
    { upsert: true, new: true }
  );
  const count = (result.topics || []).length;
  console.log(`✅ Upserted '${assignmentId}' — topics=${count}, title="${result.title}"`);
  (result.topics || []).forEach((t, i) => {
    const len = (t.content || '').length;
    console.log(`  [${i + 1}] ${t.title} | id=${t.topicId} | len=${len}`);
  });
}

async function run() {
  try {
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    
    for (const [assignmentId, topics] of Object.entries(topicsByAssignment)) {
      await upsertTopics(assignmentId, topics);
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Done updating all networking intermediate topics.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating networking intermediate topics:', err);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
}

run();
