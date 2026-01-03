require('dotenv').config();
const mongoose = require('mongoose');
const Assignment = require('../../models/Assignment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jasnav_projects';
const ASSIGNMENT_ID = 'networking-intermediate-4';

const NEW_TITLE = 'Assignment 4: Enterprise Routing & Segmentation';
const NEW_DESCRIPTION = 'Enterprise routing and segmentation on Linux: IP forwarding, static/dynamic routing, policy-based routing, multiple routing tables, route metrics, VLANs, inter-VLAN routing, security segmentation, routing-firewall interaction, source-based routing, gateway redundancy, and failover.';

const topics = [
  {
    topicId: 'enterprise-routing-fundamentals',
    title: 'Enterprise Routing Fundamentals',
    content: 'Enterprise routing focuses on moving packets across large, segmented environments with multiple subnets, departments, and security zones. Linux commonly acts as routers, firewalls, and gateways due to its flexibility and performance. Good enterprise routing emphasizes scalability, redundancy, policy control, and security; poor designs cause bottlenecks, risks, and downtime.'
  },
  {
    topicId: 'linux-kernel-ip-forwarding',
    title: 'Linux Kernel IP Forwarding',
    content: 'IP forwarding allows a Linux host to route packets between interfaces. By default, Linux is an end host; enabling IP forwarding changes kernel behavior to forward packets. IP forwarding underpins NAT, VPN gateways, and firewall routers, and must be controlled with firewall rules to prevent exposing internal networks.'
  },
  {
    topicId: 'static-routing-linux',
    title: 'Static Routing in Linux',
    content: 'Static routing defines fixed paths for specific networks that change only when modified by administrators. Static routes are predictable, secure, and resource-efficient, fitting for small segments or backbone routes that rarely change. They do not adapt to failures and are often combined with redundancy or dynamic routing in larger environments.'
  },
  {
    topicId: 'dynamic-routing-concepts',
    title: 'Dynamic Routing Concepts',
    content: 'Dynamic routing learns and updates routes automatically based on network conditions. In enterprise environments, dynamic routing improves resilience by recalculating paths when links fail. Linux supports dynamic routing via routing daemons; understanding how updates propagate and converge is critical for stability.'
  },
  {
    topicId: 'policy-based-routing',
    title: 'Policy-Based Routing (PBR)',
    content: 'Policy-Based Routing chooses routes using rules beyond destination, such as source IP, interface, or packet marks. PBR is widely used for traffic segmentation, multi-ISP designs, and security enforcement. Linux implements PBR with multiple routing tables and rule priorities for granular traffic control.'
  },
  {
    topicId: 'multiple-routing-tables',
    title: 'Multiple Routing Tables in Linux',
    content: 'Linux supports multiple routing tables concurrently. Each table can hold different routes, and rules decide which table applies per packet. This enables complex flows like separating management traffic from user traffic and is essential for advanced routing architectures and multi-tenant networks.'
  },
  {
    topicId: 'route-metrics-priorities',
    title: 'Route Metrics and Priorities',
    content: 'Route metrics determine preference when multiple routes exist to the same destination. Lower metric values have higher priority. Proper metric configuration ensures predictable routing; incorrect metrics can send traffic on inefficient or insecure paths in enterprise networks.'
  },
  {
    topicId: 'vlan-based-segmentation',
    title: 'VLAN-Based Network Segmentation',
    content: 'VLANs provide logical segmentation over shared physical links. Enterprises use VLANs to separate departments, apps, and security zones while lowering hardware costs. Linux supports VLAN tagging, allowing it to function as a VLAN-aware router or firewall.'
  },
  {
    topicId: 'inter-vlan-routing',
    title: 'Inter-VLAN Routing',
    content: 'Inter-VLAN routing enables communication between VLANs while maintaining logical separation. Linux can route between VLANs using sub-interfaces or bridges with routing rules, centralizing security enforcement and traffic inspection across VLANs.'
  },
  {
    topicId: 'network-segmentation-security',
    title: 'Network Segmentation for Security',
    content: 'Segmentation limits the spread of attacks by isolating systems and services. Enterprises segment by trust level (user, server, management). Linux firewalls and routing policies enforce segmentation boundaries and minimize lateral movement.'
  },
  {
    topicId: 'routing-firewall-interaction',
    title: 'Routing and Firewall Interaction',
    content: 'Routing decides where packets go; firewalls decide whether they are allowed. On enterprise Linux systems, routing and firewall configurations must align to avoid drops or gaps. Understanding packet flow order (routing, NAT, filtering) is essential for effective troubleshooting.'
  },
  {
    topicId: 'source-based-routing',
    title: 'Source-Based Routing',
    content: 'Source-based routing directs traffic using the source address instead of destination. Useful in multi-homed enterprises where departments use different ISPs. Linux provides fine-grained source routing via policy routing rules tied to specific tables.'
  },
  {
    topicId: 'default-gateway-redundancy',
    title: 'Default Gateway Redundancy',
    content: 'Redundant default gateways remove single points of failure. Linux supports redundancy with route metrics, VRRP, or dynamic routing. Redundant gateways maintain continuous external access during failures and maintenance.'
  },
  {
    topicId: 'route-failover-recovery',
    title: 'Route Failover and Recovery',
    content: 'Route failover automatically redirects traffic when a route becomes unavailable; recovery restores preferred paths when connectivity returns. Effective failover minimizes downtime and stabilizes performance across enterprise networks.'
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