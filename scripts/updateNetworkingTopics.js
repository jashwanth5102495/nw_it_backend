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

const topicsByAssignment = {
  'networking-beginner-1': [
    { topicId: 'linux-ifconfig', title: 'Legacy ifconfig', content: 'View and configure interfaces using ifconfig; loopback, eth0, flags, and basic up/down.' },
    { topicId: 'linux-ip-addr', title: 'ip addr & ip link', content: 'Modern iproute2 commands to inspect links, addresses, and interface states.' },
    { topicId: 'linux-ip-route', title: 'ip route & gateways', content: 'Default gateway, static routes, route metrics; verifying connectivity with ping.' },
    { topicId: 'linux-nmcli', title: 'nmcli basics', content: 'NetworkManager CLI to enable/disable devices, set IPv4/IPv6, DNS and connections.' },
    { topicId: 'linux-dns', title: 'resolv.conf & DNS', content: 'Configure name servers, search domains; test resolution with nslookup/dig.' },
    { topicId: 'linux-hosts-hostnamectl', title: 'hosts file & hostnamectl', content: 'Local name resolution in /etc/hosts; set system hostname and pretty-hostname.' },
    { topicId: 'linux-systemd-networkd', title: 'systemd-networkd overview', content: 'Basic units (.network/.netdev), device matching, static addressing, and service control.' },
    { topicId: 'linux-netplan', title: 'Netplan (Ubuntu)', content: 'YAML config for network; renderer selection (NetworkManager/systemd-networkd) and apply.' },
    { topicId: 'linux-interfaces-debian', title: '/etc/network/interfaces (Debian)', content: 'Legacy Debian networking; auto, iface, static vs dhcp; ifup/ifdown usage.' },
    { topicId: 'linux-dhcp-client', title: 'DHCP client tools', content: 'dhclient and systemd-networkd DHCP; renew, release, and lease inspection.' },
    { topicId: 'linux-static-ip', title: 'Static IP setup', content: 'Assign static IPv4/IPv6, gateway, DNS; persistent config across reboots.' },
    { topicId: 'linux-ipv6', title: 'IPv6 addressing & routes', content: 'Prefix, SLAAC/DHCPv6, link‑local, default route; testing connectivity.' },
    { topicId: 'linux-link-settings', title: 'MTU, speed, duplex', content: 'Check and change link params with ethtool and ip; impact on performance.' },
    { topicId: 'linux-bond-bridge', title: 'Bonding & bridges', content: 'Create bond0 and br0; modes (802.3ad), STP, and common use cases.' },
    { topicId: 'linux-troubleshooting', title: 'Troubleshooting toolkit', content: 'ping, traceroute/mtr, ss/netstat, dig/nslookup; logs and common failure patterns.' },
  ],
  'networking-beginner-2': [
    { topicId: 'pt-install', title: 'Installing Packet Tracer', content: 'Download, install, and license setup; supported platforms and versions.' },
    { topicId: 'pt-workspace', title: 'Workspace & Tools Overview', content: 'Main UI, device list, connections, simulation tab; saving and projects.' },
    { topicId: 'pt-add-devices', title: 'Adding Devices & Links', content: 'Routers, switches, PCs; cabling (copper, fiber), and interface selection.' },
    { topicId: 'pt-ip-config', title: 'Interface IP Configuration', content: 'Assign IPv4/IPv6 addresses and gateways on end hosts and network devices.' },
    { topicId: 'pt-switch-basics', title: 'Basic Switch Config', content: 'VLAN creation, access ports, trunks, native VLAN; verification commands.' },
    { topicId: 'pt-router-basics', title: 'Router Basic Setup', content: 'Hostname, passwords, interface enablement; saving config and show commands.' },
    { topicId: 'pt-static-routing', title: 'Static Routing', content: 'Configure static routes and default route; test reachability across networks.' },
    { topicId: 'pt-rip', title: 'RIP Configuration', content: 'Enable RIP v2, advertise networks, verify with show ip route.' },
    { topicId: 'pt-ospf', title: 'OSPF Single Area', content: 'Router IDs, networks, area 0; neighbor adjacency and route learning.' },
    { topicId: 'pt-dhcp', title: 'DHCP Server Setup', content: 'Pools, exclusions, default gateway, DNS; client leases and verification.' },
    { topicId: 'pt-dns', title: 'DNS Server Setup', content: 'A/AAAA, CNAME, PTR records; name resolution for LAN hosts.' },
    { topicId: 'pt-nat', title: 'NAT Overload (PAT)', content: 'Inside/outside interfaces, pools vs overload; test translations.' },
    { topicId: 'pt-acl', title: 'ACLs: Standard & Extended', content: 'Permit/deny rules; placement best practices; verification with show access-lists.' },
    { topicId: 'pt-wireless', title: 'Wireless in PT', content: 'Add APs, SSIDs, security settings; connect clients and test.' },
    { topicId: 'pt-simulation', title: 'Traffic Simulation & Analysis', content: 'Use simulation mode to trace packets, inspect protocols, and timing.' },
  ],
  'networking-beginner-3': [
    { topicId: 'icmp-basics', title: 'ICMP Basics', content: 'Echo request/reply, unreachable, time exceeded; role in diagnostics.' },
    { topicId: 'ping-usage', title: 'ping Usage & Options', content: 'Count, interval, size, flood, timeout; interpreting results and loss.' },
    { topicId: 'traceroute-mechanics', title: 'traceroute Mechanics', content: 'TTL increments, ICMP/UDP; path discovery and hop behavior.' },
    { topicId: 'traceroute-options', title: 'Traceroute Options', content: 'Protocol selection, Paris Traceroute, MPLS labels; common flags.' },
    { topicId: 'netstat-ss', title: 'netstat/ss Overview', content: 'Sockets, states, listeners; listing ports and connections.' },
    { topicId: 'conn-states', title: 'Connection States', content: 'LISTEN, ESTABLISHED, TIME_WAIT; implications for troubleshooting.' },
    { topicId: 'routes-netstat', title: 'Routing Tables', content: 'View kernel routing tables via netstat -r or ip route.' },
    { topicId: 'iface-stats', title: 'Interface Statistics', content: 'Packets, errors, drops; ip -s link and /proc counters.' },
    { topicId: 'icmp-firewall', title: 'Firewall Effects on ICMP', content: 'Rules impacting echo requests; rate limiting and filtering.' },
    { topicId: 'ttl-path', title: 'TTL & Path Changes', content: 'Detect asymmetric routes and hops changing over time.' },
    { topicId: 'latency-loss', title: 'Latency & Loss Analysis', content: 'Jitter, RTT, buffering; reading patterns and causes.' },
    { topicId: 'troubleshoot-flow', title: 'Troubleshooting Connectivity', content: 'Structured approach: DNS, gateway, routes, firewall, services.' },
    { topicId: 'windows-tools', title: 'Windows Equivalents', content: 'PowerShell Test-Connection, tracert, Get-NetTCPConnection.' },
    { topicId: 'mtr-tool', title: 'mtr: Continuous Trace', content: 'Combines ping+traceroute; interpreting columns and trends.' },
    { topicId: 'logging-monitor', title: 'Logging & Monitoring', content: 'Logs, sysstat, telemetry; persistent measurement strategies.' },
  ],
  'networking-beginner-4': [
    { topicId: 'nmap-intro', title: 'Intro to Nmap', content: 'Purpose and capabilities; ethical use and consent.' },
    { topicId: 'nmap-scan-types', title: 'Scan Types', content: 'SYN, TCP connect, UDP, ACK; when to use each.' },
    { topicId: 'nmap-host-discovery', title: 'Host Discovery', content: 'Ping sweeps, ARP, list scan; discovering live hosts.' },
    { topicId: 'nmap-port-states', title: 'Port States', content: 'open, closed, filtered, unfiltered; meanings and causes.' },
    { topicId: 'nmap-version', title: 'Service/Version Detection', content: 'Fingerprints with -sV; banners and accuracy considerations.' },
    { topicId: 'nmap-os', title: 'OS Detection', content: 'Enable -O; requirements, accuracy, and limitations.' },
    { topicId: 'nmap-timing', title: 'Timing & Performance', content: 'Timing templates -T0..-T5; tradeoffs and safe settings.' },
    { topicId: 'nmap-output', title: 'Output Formats', content: 'Normal (-oN), XML (-oX), grepable (-oG), JSON via tools.' },
    { topicId: 'nmap-nse', title: 'NSE Scripts Basics', content: 'Script categories; discovery, vuln, auth; running with --script.' },
    { topicId: 'nmap-safety', title: 'Safe Scanning Practices', content: 'Rate limiting, scope, off-hours, approvals; legal boundaries.' },
    { topicId: 'nmap-evasion', title: 'Firewall/IDS Evasion', content: 'Decoys, fragmentation, source ports; limits and risks.' },
    { topicId: 'nmap-ipv6', title: 'IPv6 Scanning', content: 'Feasibility, addressing scope, and practical tips.' },
    { topicId: 'nmap-top-ports', title: 'Top Ports vs Full Scans', content: 'Default top 1000 ports; when to expand to full ranges.' },
    { topicId: 'nmap-priv', title: 'Privileged vs Unprivileged', content: 'Differences in scan types and performance on Unix/Windows.' },
    { topicId: 'nmap-results', title: 'Interpreting Results', content: 'Prioritize findings, false positives, and actionable reporting.' },
  ],
  'networking-beginner-5': [
    { topicId: 'dns-basics', title: 'DNS Basics & Records', content: 'Hierarchy, zones; A/AAAA, CNAME, NS, SOA essentials.' },
    { topicId: 'dns-ptr', title: 'PTR & Reverse DNS', content: 'In-addr.arpa/ip6.arpa; mapping IP to name and uses.' },
    { topicId: 'dns-resolvers', title: 'Resolvers & Recursion', content: 'Stub vs recursive resolvers; forwarders and upstreams.' },
    { topicId: 'dns-cache', title: 'Caching & TTL', content: 'Cache behavior, TTL strategies, negative caching.' },
    { topicId: 'dns-split', title: 'Split-Horizon DNS', content: 'Internal vs external views; typical enterprise setup.' },
    { topicId: 'dhcp-basics', title: 'DHCP Basics & DORA', content: 'Discover, Offer, Request, Acknowledge; lease lifecycle.' },
    { topicId: 'dhcp-options', title: 'DHCP Options', content: 'Routers, DNS, domain, NTP; custom options and vendor classes.' },
    { topicId: 'dhcp-reservations', title: 'Static Reservations', content: 'MAC-based reservations and common use cases.' },
    { topicId: 'dhcpv6', title: 'DHCPv6 Overview', content: 'IA_NA/IA_PD, RA, SLAAC; dual‑stack considerations.' },
    { topicId: 'dnsmasq', title: 'dnsmasq Configuration', content: 'Lightweight DNS/DHCP; basic setup and verification.' },
    { topicId: 'windows-dns-dhcp', title: 'Windows DNS/DHCP', content: 'Roles, scopes, records; management and troubleshooting.' },
    { topicId: 'dns-tools', title: 'Troubleshooting Tools', content: 'nslookup, dig, host; capture queries and validate responses.' },
    { topicId: 'dynamic-dns', title: 'Dynamic DNS', content: 'DDNS updates; integration with DHCP and security notes.' },
    { topicId: 'dns-security', title: 'Security Considerations', content: 'DNSSEC basics, cache poisoning, spoofing protections.' },
    { topicId: 'dns-dhcp-labs', title: 'Hands‑on Labs', content: 'Small lab scenarios to practice DNS/DHCP configuration.' },
  ],
  'networking-beginner-6': [
    { topicId: 'ws-install', title: 'Install & Capture Setup', content: 'Choose interfaces, permissions; capture start/stop and files.' },
    { topicId: 'ws-capture-filters', title: 'Capture Filters', content: 'BPF syntax to limit capture; examples for common protocols.' },
    { topicId: 'ws-display-filters', title: 'Display Filters', content: 'Filter views like http, dns, tcp.port==80; combining expressions.' },
    { topicId: 'ws-proto-hierarchy', title: 'Protocol Hierarchies', content: 'Breakdown by protocol; find heavy talkers and anomalies.' },
    { topicId: 'ws-follow-stream', title: 'Follow TCP Streams', content: 'Reconstruct flows, inspect payloads; troubleshooting application issues.' },
    { topicId: 'ws-http', title: 'HTTP/HTTPS Analysis', content: 'Requests, responses, status codes; TLS handshake overview.' },
    { topicId: 'ws-dns', title: 'DNS Analysis', content: 'Queries, responses, caching behavior; failures and retries.' },
    { topicId: 'ws-dhcp', title: 'DHCP Traffic', content: 'DORA sequence visibility; lease issues and options.' },
    { topicId: 'ws-icmp', title: 'ICMP & Connectivity', content: 'Echo, unreachable, time exceeded; path and firewall issues.' },
    { topicId: 'ws-tls', title: 'TLS Handshake Basics', content: 'ClientHello, ServerHello, key exchange; cipher suites and versions.' },
    { topicId: 'ws-performance', title: 'Performance Metrics', content: 'RTT, retransmissions, window sizes; throughput and bottlenecks.' },
    { topicId: 'ws-export', title: 'Export & Sharing', content: 'Save/merge pcaps, anonymize sensitive data, export flows.' },
    { topicId: 'ws-color-profiles', title: 'Colorization & Profiles', content: 'Create profiles, coloring rules; faster analysis workflows.' },
    { topicId: 'ws-privacy-ethics', title: 'Privacy & Ethics', content: 'Capture scope, consent, PII; safe handling and policies.' },
    { topicId: 'ws-case-studies', title: 'Common Case Studies', content: 'Typical incidents: slow HTTP, DNS failures, DHCP conflicts.' },
  ],
};

async function upsertTopics(assignmentId, topics){
  const result = await Assignment.findOneAndUpdate(
    { assignmentId },
    { $set: { topics, updatedAt: new Date() } },
    { upsert: true, new: true }
  );
  const count = (result.topics || []).length;
  console.log(`✅ Upserted '${assignmentId}' — topics=${count}`);
  (result.topics || []).forEach((t, i) => {
    const len = (t.content || '').length; console.log(`  [${i+1}] ${t.title} | id=${t.topicId} | len=${len}`);
  });
}

async function run(){
  try{
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    for(const [assignmentId, topics] of Object.entries(topicsByAssignment)){
      await upsertTopics(assignmentId, topics);
    }
    await mongoose.connection.close();
    console.log('✅ Done updating networking topics.');
    process.exit(0);
  }catch(err){
    console.error('❌ Error updating networking topics:', err);
    try{ await mongoose.connection.close(); }catch{}
    process.exit(1);
  }
}

run();