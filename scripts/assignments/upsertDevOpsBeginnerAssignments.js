require('dotenv').config({path: "../../.env"});
const mongoose = require('mongoose');
const Assignment = require('../../models/Assignment');
const assignmentsData = [
  {
    assignmentId: 'devops-beginner-1',
    courseId: 'devops-beginner',
    title: 'Assignment 1: Foundations Beyond DevOps Basics',
    description: 'Concept strengthening & industry awareness',
    topics: [
      {
        topicId: 'evolution-of-it-operations',
        title: '1. Evolution of IT Operations Before DevOps',
        content: 'Before DevOps, IT operations and development worked in separate silos. Developers focused only on writing code, while operations teams handled deployment, servers, and maintenance. This separation caused delays, misunderstandings, and blame games when things went wrong.\n\nTraditional IT followed rigid processes where software releases happened only a few times a year. Any small change required heavy approvals, manual testing, and long deployment windows. As businesses started demanding faster updates and continuous innovation, these old models failed to keep up.\n\nDevOps emerged as a response to this problem, aiming to unify development and operations into a single collaborative workflow.'
      },
      {
        topicId: 'why-traditional-models-failed',
        title: '2. Why Traditional Deployment Models Failed',
        content: 'Traditional deployment models relied heavily on manual processes, fixed schedules, and human intervention. These models worked when software changes were rare, but failed badly in modern environments where updates are frequent.\n\nKey reasons for failure:\n\nLong release cycles\n\nHigh risk during deployment\n\nManual configuration errors\n\nNo fast rollback mechanisms\n\nIn today’s digital economy, slow deployments mean lost users, lost revenue, and poor customer experience. DevOps replaces these models with automation, continuous delivery, and faster feedback.'
      },
      {
        topicId: 'devops-vs-agile-vs-waterfall',
        title: '3. DevOps vs Agile vs Waterfall',
        content: 'Waterfall follows a linear approach: plan → build → test → deploy. Once a stage is completed, going back is difficult. This works poorly when requirements change.\n\nAgile improves this by introducing iterations and faster feedback, but it mainly focuses on development practices.\n\nDevOps goes one step further by extending Agile principles into operations and deployment, ensuring that code moves smoothly from development to production. In short:\n\nWaterfall = rigid\n\nAgile = fast development\n\nDevOps = fast delivery + stability'
      },
      {
        topicId: 'role-of-automation',
        title: '4. Role of Automation in Modern IT',
        content: 'Automation is the backbone of DevOps. It removes repetitive manual tasks and ensures consistency across environments.\n\nAutomation helps in:\n\nBuilding applications\n\nTesting code\n\nDeploying software\n\nProvisioning infrastructure\n\nMonitoring systems\n\nWithout automation, DevOps is impossible. Automation reduces human error, speeds up delivery, and allows teams to focus on solving real problems instead of repeating routine tasks.'
      },
      {
        topicId: 'devops-metrics',
        title: '5. Understanding DevOps Metrics (High-Level)',
        content: 'DevOps metrics help measure how well a DevOps process is working. These metrics focus on speed, quality, and reliability rather than just output.\n\nCommon metric concepts include:\n\nDeployment frequency\n\nLead time for changes\n\nChange failure rate\n\nMean time to recovery (MTTR)\n\nThese metrics help teams identify bottlenecks and continuously improve their workflows.'
      },
      {
        topicId: 'feedback-loops',
        title: '6. Importance of Feedback Loops',
        content: 'A feedback loop is a system where results are continuously monitored and used to improve future actions. In DevOps, feedback loops ensure that problems are detected early.\n\nExamples:\n\nMonitoring alerts after deployment\n\nUser feedback on new features\n\nBuild failures in CI pipelines\n\nFast feedback allows teams to fix issues quickly, reducing downtime and improving software quality.'
      },
      {
        topicId: 'devops-culture',
        title: '7. DevOps Culture & Team Collaboration',
        content: 'DevOps is not just tools—it is a culture. It promotes collaboration, shared responsibility, and transparency between teams.\n\nKey cultural principles:\n\nNo blame culture\n\nShared ownership\n\nContinuous learning\n\nOpen communication\n\nA strong DevOps culture reduces conflicts and improves overall productivity.'
      },
      {
        topicId: 'devops-engineer-responsibilities',
        title: '8. Responsibilities of a DevOps Engineer',
        content: 'A DevOps engineer acts as a bridge between development and operations. Their responsibility is to ensure smooth, automated, and reliable delivery of software.\n\nTypical responsibilities include:\n\nAutomating builds and deployments\n\nManaging infrastructure\n\nMonitoring system health\n\nImproving deployment speed\n\nEnsuring reliability and scalability\n\nDevOps engineers focus on systems thinking, not just tools.'
      },
      {
        topicId: 'startups-vs-enterprises',
        title: '9. DevOps in Startups vs Enterprises',
        content: 'In startups, DevOps teams are small and fast-moving. One engineer may handle multiple responsibilities. Speed is prioritized over formal processes.\n\nIn enterprises, DevOps involves:\n\nStrict security rules\n\nCompliance requirements\n\nMultiple approval layers\n\nLarge-scale infrastructure\n\nUnderstanding this difference helps engineers adapt to different work environments.'
      },
      {
        topicId: 'devops-misconceptions',
        title: '10. Common DevOps Misconceptions',
        content: 'Some common myths include:\n\nDevOps is a tool\n\nDevOps replaces developers or admins\n\nDevOps is only CI/CD\n\nIn reality, DevOps is a mindset combined with practices and tools. Tools support DevOps, but culture enables it.'
      },
      {
        topicId: 'tool-vs-process',
        title: '11. Tool vs Process in DevOps',
        content: 'Tools help automate tasks, but process defines how work flows. Using the best tools without proper processes leads to chaos.\n\nGood DevOps always starts with:\n\nClear workflows\n\nDefined responsibilities\n\nStandard practices\n\nTools are selected after processes are defined, not before.'
      },
      {
        topicId: 'maturity-models',
        title: '12. DevOps Maturity Models',
        content: 'DevOps maturity models describe how advanced an organization is in its DevOps journey.\n\nTypical stages:\n\nInitial (manual, slow)\n\nManaged (some automation)\n\nDefined (CI/CD in place)\n\nOptimized (fully automated, data-driven)\n\nMaturity models help organizations plan improvements realistically.'
      },
      {
        topicId: 'anti-patterns',
        title: '13. DevOps Anti-Patterns',
        content: 'Anti-patterns are bad practices that harm DevOps implementation.\n\nExamples:\n\nManual deployments in CI/CD pipelines\n\nSiloed teams with DevOps tools\n\nNo monitoring after deployment\n\nAutomation without testing\n\nAvoiding these mistakes is as important as learning best practices.'
      },
      {
        topicId: 'communication-challenges',
        title: '14. Communication Challenges in DevOps Teams',
        content: 'Poor communication leads to:\n\nFailed deployments\n\nMisaligned goals\n\nDelayed incident response\n\nDevOps teams rely on clear documentation, shared dashboards, and regular discussions to stay aligned and respond quickly to issues.'
      },
      {
        topicId: 'devops-success-stories',
        title: '15. DevOps Success Stories (Conceptual)',
        content: 'Successful DevOps adoption leads to:\n\nFaster deployments\n\nHigher system reliability\n\nBetter customer satisfaction\n\nReduced operational costs\n\nCompanies that adopt DevOps correctly gain a competitive advantage by delivering value faster and more reliably.'
      }
    ],
    passingPercentage: 70,
    totalQuestions: 10,
    questions: [
      {
        questionId: 1,
        question: 'What was the main problem with IT operations before DevOps?',
        options: [
          'Lack of programming languages',
          'Separation between development and operations teams',
          'Too much automation',
          'Use of cloud computing'
        ],
        correctAnswer: 1
      },
      {
        questionId: 2,
        question: 'Why did traditional deployment models fail in modern software development?',
        options: [
          'They used containers',
          'They focused too much on testing',
          'They relied heavily on manual processes and slow releases',
          'They used Agile methods'
        ],
        correctAnswer: 2
      },
      {
        questionId: 3,
        question: 'Which methodology focuses only on development practices and not operations?',
        options: [
          'DevOps',
          'Waterfall',
          'Agile',
          'CI/CD'
        ],
        correctAnswer: 2
      },
      {
        questionId: 4,
        question: 'What is the primary role of automation in DevOps?',
        options: [
          'Replace developers',
          'Eliminate testing',
          'Reduce manual work and human errors',
          'Increase system complexity'
        ],
        correctAnswer: 2
      },
      {
        questionId: 5,
        question: 'Which of the following is a DevOps performance metric?',
        options: [
          'Number of developers',
          'Deployment frequency',
          'Lines of code',
          'Application size'
        ],
        correctAnswer: 1
      },
      {
        questionId: 6,
        question: 'Why are feedback loops important in DevOps?',
        options: [
          'To delay deployments',
          'To increase manual testing',
          'To detect and fix issues quickly',
          'To avoid monitoring'
        ],
        correctAnswer: 2
      },
      {
        questionId: 7,
        question: 'Which statement best describes DevOps culture?',
        options: [
          'Strict hierarchy and approvals',
          'No communication between teams',
          'Shared responsibility and collaboration',
          'Only automation tools'
        ],
        correctAnswer: 2
      },
      {
        questionId: 8,
        question: 'What is a common misconception about DevOps?',
        options: [
          'DevOps improves collaboration',
          'DevOps is only a tool or software',
          'DevOps supports automation',
          'DevOps reduces deployment risk'
        ],
        correctAnswer: 1
      },
      {
        questionId: 9,
        question: 'In DevOps, which should come first: tools or process?',
        options: [
          'Tools',
          'Process',
          'Both are same',
          'Neither is important'
        ],
        correctAnswer: 1
      },
      {
        questionId: 10,
        question: 'What is the main goal of DevOps maturity models?',
        options: [
          'To rank developers',
          'To replace Agile',
          'To measure and improve DevOps adoption',
          'To remove monitoring'
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    assignmentId: 'devops-beginner-2',
    courseId: 'devops-beginner',
    title: 'Assignment 2: Software Development Lifecycle & Release Strategies',
    description: 'How software moves from idea to production',
    topics: [
      {
        topicId: 'sdlc-stages',
        title: '1. Stages of Software Development Lifecycle (SDLC)',
        content: 'The Software Development Lifecycle (SDLC) defines the complete journey of software from idea to retirement. It provides a structured way to plan, develop, test, deploy, and maintain applications.\n\nTypical SDLC stages include:\n\nRequirement analysis\n\nDesign\n\nDevelopment\n\nTesting\n\nDeployment\n\nMaintenance\n\nIn DevOps-driven environments, these stages still exist, but they are continuous and overlapping, not strictly linear. Understanding SDLC helps DevOps engineers know where automation, CI/CD, and monitoring fit in the overall process.'
      },
      {
        topicId: 'requirement-gathering',
        title: '2. Requirement Gathering in DevOps Teams',
        content: 'Requirement gathering is the process of understanding what needs to be built and why. In DevOps, requirements are not fixed once; they evolve continuously.\n\nDevOps teams gather requirements through:\n\nProduct owners\n\nStakeholder discussions\n\nUser feedback\n\nBusiness goals\n\nClear requirements reduce rework, failed deployments, and misunderstandings between teams. DevOps engineers must understand requirements to build correct pipelines, environments, and deployment strategies.'
      },
      {
        topicId: 'continuous-planning',
        title: '3. Continuous Planning Concepts',
        content: 'Continuous planning replaces traditional long-term planning. Instead of planning everything upfront, DevOps teams plan frequently and incrementally.\n\nKey ideas:\n\nSmaller goals\n\nFaster feedback\n\nRegular reprioritization\n\nContinuous planning ensures DevOps pipelines adapt quickly to changing business needs without disrupting stability.'
      },
      {
        topicId: 'release-management-basics',
        title: '4. Release Management Basics',
        content: 'Release management controls how and when software changes are delivered to users. It ensures releases are stable, predictable, and traceable.\n\nRelease management includes:\n\nVersioning\n\nScheduling releases\n\nCoordinating teams\n\nRollback planning\n\nIn DevOps, release management is automated but still carefully controlled to avoid production failures.'
      },
      {
        topicId: 'versioning-strategies',
        title: '5. Versioning Strategies (Semantic Versioning)',
        content: 'Versioning helps identify changes in software. Semantic Versioning (SemVer) follows the format:\n\nMAJOR.MINOR.PATCH\n\nMAJOR → Breaking changes\n\nMINOR → New features\n\nPATCH → Bug fixes\n\nThis strategy helps DevOps teams automate deployments and rollbacks safely based on version changes.'
      },
      {
        topicId: 'feature-flags',
        title: '6. Feature Flags & Toggles',
        content: 'Feature flags allow teams to enable or disable features without redeploying code.\n\nBenefits:\n\nSafer releases\n\nGradual feature rollout\n\nEasy rollback\n\nFeature flags are powerful tools in DevOps pipelines, allowing experimentation while maintaining stability.'
      },
      {
        topicId: 'rolling-vs-blue-green',
        title: '7. Rolling vs Blue-Green Deployments',
        content: 'Rolling deployment updates servers gradually, reducing downtime but mixing old and new versions.\n\nBlue-Green deployment maintains two environments:\n\nBlue (current production)\n\nGreen (new version)\n\nTraffic switches instantly once testing is successful. DevOps engineers choose deployment strategies based on risk, cost, and application type.'
      },
      {
        topicId: 'canary-releases',
        title: '8. Canary Releases (Conceptual)',
        content: 'Canary releases deploy changes to a small subset of users first. If everything works, the release is expanded to all users.\n\nAdvantages:\n\nEarly issue detection\n\nReduced impact of failures\n\nReal-world testing\n\nCanary releases require monitoring and automation, making them an advanced yet valuable DevOps strategy.'
      },
      {
        topicId: 'hotfix-vs-regular',
        title: '9. Hotfix vs Regular Release',
        content: 'A hotfix is an urgent fix for critical issues in production. It bypasses normal release schedules.\n\nA regular release follows standard planning, testing, and approvals.\n\nDevOps teams must balance speed and safety, ensuring hotfixes don’t introduce new problems.'
      },
      {
        topicId: 'release-approval-workflows',
        title: '10. Release Approval Workflows',
        content: 'Approval workflows ensure that changes meet quality, security, and compliance standards before deployment.\n\nIn DevOps:\n\nApprovals are automated where possible\n\nManual approvals are used for high-risk environments\n\nThis ensures accountability without slowing down delivery.'
      },
      {
        topicId: 'pre-production-environments',
        title: '11. Pre-Production Environments Explained',
        content: 'Pre-production environments replicate production as closely as possible. They are used for:\n\nFinal testing\n\nPerformance checks\n\nSecurity validation\n\nDevOps engineers maintain consistency between environments to avoid deployment surprises.'
      },
      {
        topicId: 'deployment-frequency-metrics',
        title: '12. Deployment Frequency Metrics',
        content: 'Deployment frequency measures how often software is released. High-performing DevOps teams deploy more frequently with lower risk.\n\nFrequent deployments indicate:\n\nStrong automation\n\nReliable testing\n\nMature DevOps practices\n\nThis metric reflects organizational DevOps maturity.'
      },
      {
        topicId: 'rollback-strategies',
        title: '13. Rollback Strategies',
        content: 'Rollback strategies allow systems to revert to a previous stable version if deployment fails.\n\nCommon rollback methods:\n\nVersion rollback\n\nTraffic switch (Blue-Green)\n\nFeature flag disable\n\nEvery DevOps pipeline must include a rollback plan to reduce downtime and risk.'
      },
      {
        topicId: 'change-management',
        title: '14. Change Management in DevOps',
        content: 'Change management controls how changes are introduced while minimizing risk.\n\nModern DevOps change management focuses on:\n\nAutomation\n\nTraceability\n\nSmall incremental changes\n\nThis approach ensures compliance without slowing innovation.'
      },
      {
        topicId: 'release-failure-analysis',
        title: '15. Release Failure Analysis',
        content: 'Release failure analysis examines why a deployment failed and how to prevent recurrence.\n\nIt includes:\n\nRoot cause analysis\n\nProcess improvements\n\nAutomation enhancements\n\nLearning from failures is a core DevOps principle and drives continuous improvement.'
      }
    ],
    passingPercentage: 70,
    totalQuestions: 10,
    questions: [
      {
        questionId: 1,
        question: 'What is the primary purpose of the Software Development Lifecycle (SDLC)?',
        options: [
          'To replace DevOps',
          'To define a structured approach for software development',
          'To automate deployments',
          'To remove testing'
        ],
        correctAnswer: 1
      },
      {
        questionId: 2,
        question: 'How does SDLC differ in DevOps-driven environments?',
        options: [
          'SDLC stages are removed',
          'SDLC becomes slower',
          'SDLC stages are continuous and overlapping',
          'SDLC is only for developers'
        ],
        correctAnswer: 2
      },
      {
        questionId: 3,
        question: 'Why is requirement gathering important in DevOps teams?',
        options: [
          'To delay development',
          'To reduce collaboration',
          'To ensure pipelines and deployments align with business needs',
          'To avoid automation'
        ],
        correctAnswer: 2
      },
      {
        questionId: 4,
        question: 'What is continuous planning in DevOps?',
        options: [
          'Planning only once at the start',
          'Frequent and incremental planning',
          'Planning only after deployment',
          'No planning at all'
        ],
        correctAnswer: 1
      },
      {
        questionId: 5,
        question: 'What is the main goal of release management?',
        options: [
          'Increase code size',
          'Control and coordinate software releases',
          'Remove testing',
          'Stop deployments'
        ],
        correctAnswer: 1
      },
      {
        questionId: 6,
        question: 'What does semantic versioning follow?',
        options: [
          'DATE.BUILD.REVISION',
          'VERSION.RELEASE.PATCH',
          'MAJOR.MINOR.PATCH',
          'BUILD.MINOR.MAJOR'
        ],
        correctAnswer: 2
      },
      {
        questionId: 7,
        question: 'What is the key benefit of feature flags?',
        options: [
          'Increase server cost',
          'Deploy code without testing',
          'Enable or disable features without redeployment',
          'Replace CI/CD'
        ],
        correctAnswer: 2
      },
      {
        questionId: 8,
        question: 'Which deployment strategy uses two identical environments and switches traffic?',
        options: [
          'Rolling deployment',
          'Canary release',
          'Blue-Green deployment',
          'Manual deployment'
        ],
        correctAnswer: 2
      },
      {
        questionId: 9,
        question: 'What is a hotfix?',
        options: [
          'A planned monthly release',
          'An urgent fix for critical production issues',
          'A rollback strategy',
          'A test deployment'
        ],
        correctAnswer: 1
      },
      {
        questionId: 10,
        question: 'Why are rollback strategies important in DevOps?',
        options: [
          'To slow down releases',
          'To avoid automation',
          'To recover quickly from failed deployments',
          'To prevent versioning'
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    assignmentId: 'devops-beginner-3',
    courseId: 'devops-beginner',
    title: 'Assignment 3: Networking & System Fundamentals for DevOps',
    description: 'What DevOps engineers must understand about systems',
    topics: [
      {
        topicId: 'networking-basics',
        title: '1. Basics of Computer Networking',
        content: 'Computer networking is the foundation of how systems communicate with each other. In DevOps, every application you deploy relies on networking to function correctly—whether it’s users accessing a website or services talking to databases.\n\nNetworking allows:\n\nData transfer between systems\n\nCommunication between applications\n\nAccess to services over the internet or private networks\n\nA DevOps engineer must understand networking basics to troubleshoot connectivity issues, deployment failures, and performance problems.'
      },
      {
        topicId: 'ip-subnetting',
        title: '2. IP Addressing & Subnetting (Conceptual)',
        content: 'An IP address is a unique identifier assigned to each device in a network. It allows systems to locate and communicate with each other.\n\nSubnetting divides a large network into smaller networks (subnets). This helps:\n\nImprove security\n\nReduce network congestion\n\nOrganize infrastructure logically\n\nWhile beginners may not calculate subnets, understanding why subnetting exists is essential for cloud and DevOps work.'
      },
      {
        topicId: 'tcp-vs-udp',
        title: '3. TCP vs UDP',
        content: 'TCP (Transmission Control Protocol) and UDP (User Datagram Protocol) are communication protocols.\n\nTCP is reliable, ensures data delivery, and maintains order.\n\nUDP is faster but does not guarantee delivery.\n\nDevOps engineers must know which protocol applications use to understand performance and reliability trade-offs.'
      },
      {
        topicId: 'dns-role',
        title: '4. DNS & Its Role in Applications',
        content: 'DNS (Domain Name System) translates human-readable domain names into IP addresses.\n\nWithout DNS:\n\nUsers would need to remember IP addresses\n\nApplications would fail to locate services\n\nIn DevOps, DNS issues are a common cause of downtime. Understanding DNS helps diagnose connectivity and deployment problems.'
      },
      {
        topicId: 'http-vs-https',
        title: '5. HTTP vs HTTPS',
        content: 'HTTP is the protocol used for web communication. HTTPS is the secure version that encrypts data using SSL/TLS.\n\nHTTPS is critical for:\n\nUser data protection\n\nSecurity compliance\n\nTrust and authentication\n\nDevOps engineers ensure HTTPS is correctly configured in deployments.'
      },
      {
        topicId: 'ports-firewalls',
        title: '6. Ports & Firewalls',
        content: 'Ports allow multiple services to run on the same system. Each service listens on a specific port.\n\nFirewalls control:\n\nWhich ports are accessible\n\nWhich traffic is allowed or blocked\n\nIncorrect firewall rules are a common reason applications fail after deployment.'
      },
      {
        topicId: 'load-balancing',
        title: '7. Load Balancing Basics',
        content: 'Load balancing distributes traffic across multiple servers to improve availability and performance.\n\nBenefits:\n\nPrevents server overload\n\nImproves reliability\n\nEnables scalability\n\nDevOps engineers use load balancers to design resilient systems.'
      },
      {
        topicId: 'reverse-proxy',
        title: '8. Reverse Proxy Explained',
        content: 'A reverse proxy sits between users and backend servers. It forwards client requests to the appropriate server.\n\nCommon uses:\n\nImprove security\n\nHandle SSL termination\n\nBalance traffic\n\nReverse proxies are widely used in DevOps architectures.'
      },
      {
        topicId: 'linux-file-system',
        title: '9. Linux File System Structure',
        content: 'Linux organizes files in a structured hierarchy.\n\nImportant directories:\n\n/etc – configuration files\n\n/var – logs and variable data\n\n/home – user files\n\n/bin and /usr/bin – binaries\n\nUnderstanding the file system helps DevOps engineers manage servers effectively.'
      },
      {
        topicId: 'process-management',
        title: '10. Process Management in Linux',
        content: 'Processes are running programs in the system. Linux provides tools to manage them.\n\nDevOps engineers monitor processes to:\n\nIdentify resource usage\n\nKill stuck processes\n\nEnsure services are running\n\nProcess management is essential for system stability.'
      },
      {
        topicId: 'memory-cpu',
        title: '11. Memory & CPU Concepts',
        content: 'CPU handles computation, while memory stores active data.\n\nKey ideas:\n\nHigh CPU usage → performance bottleneck\n\nLow memory → crashes or slow systems\n\nDevOps engineers monitor resource usage to maintain application health.'
      },
      {
        topicId: 'system-boot-process',
        title: '12. System Boot Process (High-Level)',
        content: 'The boot process defines how a system starts:\n\nHardware initialization\n\nKernel loading\n\nService startup\n\nUnderstanding boot helps in troubleshooting startup failures and system crashes.'
      },
      {
        topicId: 'environment-variables',
        title: '13. Environment Variables',
        content: 'Environment variables store configuration values outside application code.\n\nBenefits:\n\nImprove security\n\nSupport multiple environments\n\nAvoid hardcoding\n\nDevOps engineers use environment variables extensively in deployments.'
      },
      {
        topicId: 'server-vs-desktop',
        title: '14. Server vs Desktop Operating Systems',
        content: 'Servers are optimized for:\n\nStability\n\nPerformance\n\nContinuous uptime\n\nDesktops focus on:\n\nUser interaction\n\nGraphics\n\nConvenience\n\nDevOps engineers work primarily with server OS environments.'
      },
      {
        topicId: 'common-networking-issues',
        title: '15. Common Networking Issues in Deployments',
        content: 'Common issues include:\n\nIncorrect DNS settings\n\nClosed ports\n\nFirewall misconfigurations\n\nIP conflicts\n\nRecognizing these issues helps DevOps engineers resolve incidents quickly.'
      }
    ],
    passingPercentage: 70,
    totalQuestions: 10,
    questions: [
      {
        questionId: 1,
        question: 'Why is networking knowledge important for DevOps engineers?',
        options: [
          'To write application code',
          'To design user interfaces',
          'To ensure systems and applications can communicate correctly',
          'To replace cloud services'
        ],
        correctAnswer: 2
      },
      {
        questionId: 2,
        question: 'What is the primary purpose of an IP address?',
        options: [
          'To encrypt network traffic',
          'To uniquely identify a device in a network',
          'To block unauthorized access',
          'To improve application performance'
        ],
        correctAnswer: 1
      },
      {
        questionId: 3,
        question: 'Why is subnetting used in computer networks?',
        options: [
          'To slow down communication',
          'To divide large networks into smaller, manageable ones',
          'To increase internet speed',
          'To replace firewalls'
        ],
        correctAnswer: 1
      },
      {
        questionId: 4,
        question: 'Which protocol guarantees reliable data delivery?',
        options: [
          'UDP',
          'HTTP',
          'TCP',
          'DNS'
        ],
        correctAnswer: 2
      },
      {
        questionId: 5,
        question: 'What is the role of DNS in applications?',
        options: [
          'Encrypt data',
          'Assign ports',
          'Translate domain names into IP addresses',
          'Block malicious traffic'
        ],
        correctAnswer: 2
      },
      {
        questionId: 6,
        question: 'What is the key difference between HTTP and HTTPS?',
        options: [
          'HTTPS is faster',
          'HTTPS uses encryption for secure communication',
          'HTTP uses ports',
          'HTTPS does not require DNS'
        ],
        correctAnswer: 1
      },
      {
        questionId: 7,
        question: 'Why are ports important in server environments?',
        options: [
          'They store files',
          'They allow multiple services to run on the same system',
          'They manage user authentication',
          'They control CPU usage'
        ],
        correctAnswer: 1
      },
      {
        questionId: 8,
        question: 'What is the primary function of a load balancer?',
        options: [
          'Store data',
          'Manage DNS',
          'Distribute traffic across multiple servers',
          'Encrypt user requests'
        ],
        correctAnswer: 2
      },
      {
        questionId: 9,
        question: 'What is the main purpose of a reverse proxy?',
        options: [
          'Block all traffic',
          'Replace backend servers',
          'Forward client requests to backend servers',
          'Store application logs'
        ],
        correctAnswer: 2
      },
      {
        questionId: 10,
        question: 'Why are environment variables important in DevOps?',
        options: [
          'They increase application size',
          'They hardcode configuration values',
          'They allow configuration without changing code',
          'They replace version control'
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    assignmentId: 'devops-beginner-4',
    courseId: 'devops-beginner',
    title: 'Assignment 4: Security Awareness & Access Management in DevOps',
    description: 'Beginner DevSecOps thinking',
    topics: [
      {
        topicId: 'what-is-devsecops',
        title: '1. What Is DevSecOps? (Detailed Explanation)',
        content: 'DevSecOps is an extension of DevOps that integrates security practices into every phase of the software development lifecycle (SDLC). Traditionally, security was handled at the end of development, which often caused delays and vulnerabilities going unnoticed. DevSecOps eliminates this problem by shifting security left, meaning security checks begin from planning and continue through development, testing, deployment, and monitoring.\n\nIn DevSecOps, developers write secure code, pipelines automatically scan for vulnerabilities, and infrastructure is designed with security in mind. This results in faster releases with reduced risk. DevSecOps also promotes automation of security tasks such as vulnerability scanning, dependency checks, and policy enforcement.'
      },
      {
        topicId: 'shared-responsibility-model',
        title: '2. Security Shared Responsibility Model',
        content: 'The shared responsibility model states that security is everyone’s responsibility, not just the security team’s. In a DevOps environment, multiple teams collaborate, and each team has a role in maintaining security.\n\nDevelopers are responsible for writing secure code and avoiding insecure practices.\n\nDevOps engineers secure infrastructure, pipelines, and deployments.\n\nSecurity teams provide policies, tools, and audits.\n\nWhen security responsibility is shared, gaps are minimized. If one team fails, another layer can still protect the system. This model creates accountability and reduces security breaches.'
      },
      {
        topicId: 'auth-vs-auth',
        title: '3. Authentication vs Authorization',
        content: 'Authentication is the process of verifying identity. It answers the question: Who are you? Examples include logging in using a username and password, biometric verification, or multi-factor authentication.\n\nAuthorization determines permissions after authentication. It answers: What are you allowed to do? For example, a user may log in successfully but only have read-only access.\n\nIn DevOps systems, incorrect authentication or authorization can expose sensitive resources such as production servers, pipelines, or databases.'
      },
      {
        topicId: 'rbac-basics',
        title: '4. Role-Based Access Control (RBAC)',
        content: 'RBAC is a security mechanism where permissions are assigned based on roles rather than individuals. For example, a developer role may have access to code repositories but not production servers.\n\nRBAC simplifies access management, improves security, and prevents accidental misuse. In large organizations, RBAC ensures consistency and scalability.\n\nIt also enforces the principle of least privilege, ensuring users only have the permissions they need to perform their job.'
      },
      {
        topicId: 'secrets-management',
        title: '5. Secrets Management Basics',
        content: 'Secrets are sensitive pieces of information such as passwords, API keys, tokens, and certificates. Hardcoding secrets in code repositories is a major security risk because anyone with access to the repository can see them.\n\nProper secrets management involves:\n\nStoring secrets securely\n\nRotating secrets regularly\n\nLimiting access to secrets\n\nDevOps tools often use encrypted storage and environment variables to manage secrets safely.'
      },
      {
        topicId: 'common-security-risks',
        title: '6. Common Security Risks in DevOps',
        content: 'DevOps environments are fast-moving, which increases the risk of misconfigurations. Common risks include exposed credentials, open network ports, outdated software, and insecure containers.\n\nThese risks can lead to unauthorized access, data breaches, or service outages. Understanding common risks helps DevOps engineers proactively secure systems.'
      },
      {
        topicId: 'least-privilege',
        title: '7. Principle of Least Privilege',
        content: 'Least privilege means users and systems should be given only the minimum permissions required to perform their tasks. This limits the impact of compromised accounts or accidental actions.\n\nFor example, a CI/CD pipeline should not have full administrative access if it only needs deployment rights. Applying least privilege reduces attack surfaces.'
      },
      {
        topicId: 'secure-passwords',
        title: '8. Secure Password Practices',
        content: 'Strong passwords protect systems from brute-force and credential-stuffing attacks. Secure password practices include length, complexity, uniqueness, and periodic changes.\n\nIn DevOps, enforcing password policies and promoting password managers improves overall system security.'
      },
      {
        topicId: 'api-security',
        title: '9. API Security Fundamentals',
        content: 'APIs connect services and applications. Without proper security, APIs become easy targets for attackers.\n\nBasic API security includes authentication, authorization, encryption, and rate limiting. Securing APIs prevents data leaks and unauthorized usage.'
      },
      {
        topicId: 'vuln-threat-risk',
        title: '10. Vulnerability vs Threat vs Risk',
        content: 'A vulnerability is a weakness in a system. A threat is something that can exploit that weakness. Risk is the potential damage if the threat succeeds.\n\nUnderstanding these terms helps DevOps engineers prioritize security measures effectively.'
      },
      {
        topicId: 'cicd-security',
        title: '11. Security in CI/CD Pipelines',
        content: 'CI/CD pipelines automate code deployment, making them high-value targets for attackers. If compromised, malicious code can be deployed automatically.\n\nPipeline security involves protecting credentials, restricting access, validating code, and monitoring activity.'
      },
      {
        topicId: 'static-dynamic-testing',
        title: '12. Static vs Dynamic Security Testing',
        content: 'Static security testing analyzes source code for vulnerabilities without executing it. Dynamic testing analyzes running applications.\n\nUsing both approaches provides comprehensive coverage and improves application security.'
      },
      {
        topicId: 'container-security',
        title: '13. Container Security Basics',
        content: 'Containers share the host OS, which increases security risks if misconfigured. Container security includes using trusted images, limiting privileges, and updating images regularly.\n\nSecuring containers prevents attackers from escaping into host systems.'
      },
      {
        topicId: 'compliance-awareness',
        title: '14. Compliance Awareness (Beginner Level)',
        content: 'Compliance ensures systems follow legal and industry standards. Non-compliance can lead to fines, legal action, and reputation damage.\n\nDevOps engineers must understand compliance requirements even at a basic level to design compliant systems.'
      },
      {
        topicId: 'incident-response',
        title: '15. Security Incident Response (Beginner)',
        content: 'Incident response is the process of detecting, responding to, and recovering from security incidents. It includes preparation, detection, containment, recovery, and learning.\n\nHaving an incident response plan minimizes downtime and damage.'
      }
    ],
    passingPercentage: 70,
    totalQuestions: 10,
    questions: [
      {
        questionId: 1,
        question: 'What is the primary objective of DevSecOps?',
        options: [
          'To slow down software delivery for better testing',
          'To add security only after deployment',
          'To integrate security into every stage of the DevOps lifecycle',
          'To replace DevOps with security teams'
        ],
        correctAnswer: 2
      },
      {
        questionId: 2,
        question: 'In the Shared Responsibility Model, who is responsible for security?',
        options: [
          'Only the security team',
          'Only developers',
          'Only DevOps engineers',
          'Everyone involved in the software lifecycle'
        ],
        correctAnswer: 3
      },
      {
        questionId: 3,
        question: 'Authentication answers which of the following questions?',
        options: [
          'What resources are available?',
          'What actions are allowed?',
          'Who are you?',
          'How fast is the system?'
        ],
        correctAnswer: 2
      },
      {
        questionId: 4,
        question: 'What does Authorization primarily control?',
        options: [
          'User identity verification',
          'Password encryption',
          'Access permissions after authentication',
          'Network traffic flow'
        ],
        correctAnswer: 2
      },
      {
        questionId: 5,
        question: 'Why is Role-Based Access Control (RBAC) important in DevOps?',
        options: [
          'It increases manual configuration',
          'It assigns permissions directly to hardware',
          'It reduces security risks by assigning permissions based on roles',
          'It eliminates the need for authentication'
        ],
        correctAnswer: 2
      },
      {
        questionId: 6,
        question: 'Which of the following is the MOST secure way to handle secrets in DevOps?',
        options: [
          'Hardcoding them in source code',
          'Storing them in public repositories',
          'Using encrypted secrets management tools',
          'Sharing them through email'
        ],
        correctAnswer: 2
      },
      {
        questionId: 7,
        question: 'What does the Principle of Least Privilege ensure?',
        options: [
          'Users have unlimited access',
          'Systems operate without authentication',
          'Users have only the permissions they need',
          'Security checks are disabled'
        ],
        correctAnswer: 2
      },
      {
        questionId: 8,
        question: 'Why are CI/CD pipelines considered high-value attack targets?',
        options: [
          'They only store logs',
          'They automate testing only',
          'They can deploy malicious code automatically if compromised',
          'They do not require authentication'
        ],
        correctAnswer: 2
      },
      {
        questionId: 9,
        question: 'What is the key difference between vulnerability and threat?',
        options: [
          'Vulnerability is an attack; threat is a weakness',
          'Vulnerability is a weakness; threat exploits it',
          'Both mean the same',
          'Threat is a security tool'
        ],
        correctAnswer: 1
      },
      {
        questionId: 10,
        question: 'What is the MAIN purpose of security incident response?',
        options: [
          'To prevent software updates',
          'To identify, respond to, and recover from security incidents',
          'To assign blame',
          'To stop DevOps practices'
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    assignmentId: 'devops-beginner-5',
    courseId: 'devops-beginner',
    title: 'Assignment 5: CI/CD, Automation & Release Management',
    description: 'How modern software moves from code to production automatically',
    topics: [
      {
        topicId: 'what-is-ci',
        title: '1. What is Continuous Integration (CI)?',
        content: 'Continuous Integration is a development practice where developers frequently integrate their code into a shared repository, usually several times a day. Each integration is automatically verified by running builds and tests. The main purpose of CI is to detect issues early, reduce integration problems, and ensure that the codebase is always in a working state.\n\nIn DevOps environments, CI eliminates the traditional problem of “it works on my machine.” Automated builds and tests ensure that every code change is validated in a consistent environment. This practice improves code quality, shortens feedback loops, and increases developer confidence. CI is the foundation on which all modern DevOps pipelines are built.'
      },
      {
        topicId: 'what-is-cd',
        title: '2. What is Continuous Delivery (CD)?',
        content: 'Continuous Delivery is the practice of automatically preparing code for release after it passes CI stages. In CD, the application is always kept in a deployable state, but deployment to production may still require manual approval.\n\nThe key idea of Continuous Delivery is reliability and readiness. Even if the organization chooses not to deploy frequently, it can deploy at any time. This reduces release stress, improves planning, and ensures that deployments are predictable and repeatable. CD helps teams move away from risky, big-bang releases.'
      },
      {
        topicId: 'cd-vs-cd',
        title: '3. Continuous Deployment vs Continuous Delivery',
        content: 'Although often confused, Continuous Deployment and Continuous Delivery are different. In Continuous Deployment, every successful change that passes all pipeline stages is automatically deployed to production without human intervention.\n\nContinuous Delivery stops just before production deployment, while Continuous Deployment goes one step further. Continuous Deployment requires a very high level of automation, testing maturity, monitoring, and confidence. Many beginner DevOps roles start with Continuous Delivery and gradually evolve toward Continuous Deployment as systems mature.'
      },
      {
        topicId: 'pipeline-importance',
        title: '4. Why CI/CD Pipelines Are Important in DevOps',
        content: 'CI/CD pipelines automate the entire journey of code—from commit to deployment. They reduce human errors, speed up software delivery, and create consistency across environments. Pipelines also act as quality gates, ensuring that broken or insecure code never reaches production.\n\nIn real organizations, pipelines are not optional—they are essential. Without CI/CD, teams struggle with slow releases, unstable deployments, and frequent production issues. Pipelines help DevOps teams achieve speed, stability, and scalability at the same time.'
      },
      {
        topicId: 'pipeline-stages',
        title: '5. Typical Stages of a CI/CD Pipeline',
        content: 'A standard CI/CD pipeline includes stages such as:\n\nSource code checkout\n\nBuild\n\nUnit testing\n\nStatic code analysis\n\nPackaging\n\nDeployment\n\nPost-deployment verification\n\nEach stage has a clear purpose and must pass before the next begins. This staged approach ensures early failure detection and prevents faulty code from progressing. Pipelines can be customized based on application type, but the core idea remains the same: automate everything that can be automated.'
      },
      {
        topicId: 'automated-testing',
        title: '6. Automated Testing in CI/CD Pipelines',
        content: 'Automated testing is the backbone of CI/CD. Tests are executed automatically whenever code changes are pushed. This includes unit tests, integration tests, and sometimes functional tests.\n\nAutomated testing ensures that new changes do not break existing functionality. In DevOps, testing is not a separate phase—it is embedded directly into the pipeline. The faster tests provide feedback, the faster developers can fix issues, leading to more stable systems.'
      },
      {
        topicId: 'build-artifacts',
        title: '7. Build Artifacts and Artifact Repositories',
        content: 'A build artifact is the output of a successful build, such as a JAR file, Docker image, or executable. Artifact repositories store and manage these outputs so they can be reused across environments.\n\nUsing artifact repositories ensures consistency. The same artifact tested in staging is deployed to production, eliminating discrepancies. This practice is essential for traceability, rollback, and auditing in enterprise DevOps environments.'
      },
      {
        topicId: 'pipeline-as-code',
        title: '8. Pipeline as Code (PaC)',
        content: 'Pipeline as Code means defining CI/CD pipelines using code instead of manual UI configuration. Pipeline definitions are stored in version control alongside application code.\n\nThis approach provides versioning, auditability, collaboration, and repeatability. Changes to pipelines go through the same review process as application code. Pipeline as Code is a core DevOps best practice and a must-have skill for modern DevOps engineers.'
      },
      {
        topicId: 'env-consistency',
        title: '9. Environment Consistency in CI/CD',
        content: 'Applications typically move through multiple environments such as development, testing, staging, and production. CI/CD pipelines help maintain consistency across these environments.\n\nBy using automation, configuration management, and containers, DevOps teams ensure that applications behave the same everywhere. Environment consistency reduces deployment failures and eliminates configuration drift.'
      },
      {
        topicId: 'rollbacks-versioning',
        title: '10. Rollbacks and Versioning in CI/CD',
        content: 'Even with automation, failures can happen. Rollbacks allow teams to quickly revert to a previously stable version. Proper versioning ensures that every deployment can be tracked and reversed if necessary.\n\nCI/CD pipelines often include rollback strategies as part of deployment steps. This ensures system stability and minimizes downtime during incidents.'
      },
      {
        topicId: 'blue-green',
        title: '11. Blue-Green Deployments (Beginner Concept)',
        content: 'Blue-Green deployment is a release strategy where two environments exist: one live (blue) and one idle (green). The new version is deployed to the idle environment and tested before switching traffic.\n\nThis approach minimizes downtime and allows quick rollback. While advanced implementations exist, understanding the concept is important for beginners to grasp modern release safety techniques.'
      },
      {
        topicId: 'canary-releases',
        title: '12. Canary Releases (Conceptual Overview)',
        content: 'Canary releases involve deploying a new version to a small subset of users before rolling it out fully. This helps detect issues early without affecting all users.\n\nCanary deployments are widely used in large-scale systems. Even understanding the basic idea prepares students for real-world DevOps discussions and interviews.'
      },
      {
        topicId: 'pipeline-security',
        title: '13. Security Checks in CI/CD Pipelines',
        content: 'Modern pipelines include security scanning such as dependency checks, code analysis, and secret detection. This ensures vulnerabilities are caught early.\n\nEmbedding security into pipelines is part of DevSecOps. It shifts security left and reduces risks associated with late-stage security testing.'
      },
      {
        topicId: 'pipeline-monitoring',
        title: '14. Monitoring Deployments Through Pipelines',
        content: 'CI/CD does not stop at deployment. Monitoring ensures that the application behaves as expected after release. Metrics, logs, and alerts provide visibility into system health.\n\nMonitoring helps teams detect failures early and respond quickly. It closes the feedback loop between deployment and operations.'
      },
      {
        topicId: 'cicd-challenges',
        title: '15. Real-World CI/CD Challenges and Best Practices',
        content: 'Real pipelines face challenges such as flaky tests, slow builds, and configuration complexity. Best practices include keeping pipelines fast, modular, well-documented, and secure.\n\nUnderstanding challenges prepares students for real DevOps environments where theory meets reality. DevOps is not about tools alone—it is about discipline, automation, and continuous improvement.'
      }
    ],
    passingPercentage: 70,
    totalQuestions: 10,
    questions: [
      {
        questionId: 1,
        question: 'What is the primary goal of Continuous Integration (CI)?',
        options: [
          'Deploy code directly to production',
          'Frequently merge code and detect issues early',
          'Eliminate the need for testing',
          'Replace version control systems'
        ],
        correctAnswer: 1
      },
      {
        questionId: 2,
        question: 'What makes Continuous Delivery different from Continuous Deployment?',
        options: [
          'Continuous Delivery deploys faster',
          'Continuous Delivery requires manual testing only',
          'Continuous Delivery keeps code deployable but may require approval',
          'Continuous Deployment does not use pipelines'
        ],
        correctAnswer: 2
      },
      {
        questionId: 3,
        question: 'Why are CI/CD pipelines critical in DevOps environments?',
        options: [
          'They increase manual effort',
          'They automate only testing',
          'They ensure fast, reliable, and repeatable releases',
          'They replace developers'
        ],
        correctAnswer: 2
      },
      {
        questionId: 4,
        question: 'Which stage in a CI/CD pipeline is responsible for detecting code errors early?',
        options: [
          'Deployment',
          'Monitoring',
          'Build and automated testing',
          'Rollback'
        ],
        correctAnswer: 2
      },
      {
        questionId: 5,
        question: 'What is a build artifact?',
        options: [
          'A pipeline configuration file',
          'Source code in a repository',
          'The output produced after a successful build',
          'A deployment environment'
        ],
        correctAnswer: 2
      },
      {
        questionId: 6,
        question: 'Why are artifact repositories important in CI/CD?',
        options: [
          'They store logs only',
          'They ensure the same build is deployed across environments',
          'They replace version control',
          'They manage network traffic'
        ],
        correctAnswer: 1
      },
      {
        questionId: 7,
        question: 'What does “Pipeline as Code” mean?',
        options: [
          'Writing pipelines in the UI only',
          'Running pipelines manually',
          'Defining pipelines using version-controlled code',
          'Removing automation from pipelines'
        ],
        correctAnswer: 2
      },
      {
        questionId: 8,
        question: 'Why is automated testing essential in CI/CD pipelines?',
        options: [
          'It increases pipeline execution time',
          'It replaces monitoring',
          'It ensures code quality and prevents regressions',
          'It removes the need for developers'
        ],
        correctAnswer: 2
      },
      {
        questionId: 9,
        question: 'What is the primary advantage of Blue-Green deployment?',
        options: [
          'Increased infrastructure cost',
          'Zero downtime and quick rollback',
          'Slower releases',
          'Manual traffic switching'
        ],
        correctAnswer: 1
      },
      {
        questionId: 10,
        question: 'Why should security checks be included in CI/CD pipelines?',
        options: [
          'To delay deployments',
          'To shift security responsibilities to operations',
          'To detect vulnerabilities early in the development lifecycle',
          'To eliminate monitoring'
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    assignmentId: 'devops-beginner-6',
    courseId: 'devops-beginner',
    title: 'Assignment 6: DevOps Operations, Reliability & Production Readiness',
    description: 'Handling failures, reliability, incidents, scaling, and operational excellence',
    topics: [
      {
        topicId: 'what-is-production-env',
        title: '1. What Does “Production Environment” Mean in DevOps?',
        content: 'A production environment is where the actual users interact with the application. Unlike development or testing environments, production systems must be stable, secure, performant, and continuously available. Any failure here directly impacts users and business.\n\nIn DevOps, production is not “set and forget.” It requires continuous monitoring, fast incident response, controlled deployments, and operational discipline. Understanding production realities helps DevOps engineers make better decisions during design, automation, and deployment.'
      },
      {
        topicId: 'env-differences',
        title: '2. Difference Between Dev, Test, Staging, and Production',
        content: 'DevOps workflows rely on multiple environments to reduce risk.\n\nDevelopment: Fast, flexible, experimental\n\nTesting: Validation and quality checks\n\nStaging: Production-like verification\n\nProduction: Live user-facing system\n\nUnderstanding environment separation prevents accidental failures, data leaks, and unstable releases. A DevOps engineer must always know where a change is happening and why.'
      },
      {
        topicId: 'high-availability',
        title: '3. High Availability (HA) – Beginner Concept',
        content: 'High Availability means designing systems so they remain accessible even when failures occur. This includes redundancy, failover mechanisms, and traffic distribution.\n\nIn DevOps, HA is not optional. Even small outages can cause revenue loss and reputation damage. Beginners must understand that failure is expected, and systems must be designed to survive it.'
      },
      {
        topicId: 'scalability-vs-elasticity',
        title: '4. Scalability vs Elasticity',
        content: 'Scalability is the ability of a system to handle increased load by adding resources. Elasticity is the ability to automatically scale up and down based on demand.\n\nDevOps engineers use automation, cloud services, and monitoring to achieve elasticity. This ensures performance during peak traffic while controlling costs during low usage.'
      },
      {
        topicId: 'why-downtime-happens',
        title: '5. Why Downtime Happens in Real Systems',
        content: 'Downtime can be caused by:\n\nBad deployments\n\nInfrastructure failures\n\nNetwork issues\n\nHuman error\n\nSecurity incidents\n\nUnderstanding causes of downtime helps DevOps engineers design safer pipelines, implement rollbacks, and improve system resilience.'
      },
      {
        topicId: 'incident-management',
        title: '6. Incident Management in DevOps',
        content: 'An incident is any event that disrupts normal service. Incident management focuses on detecting, responding, resolving, and learning from failures.\n\nDevOps culture emphasizes blameless incident response. The goal is not to punish, but to fix issues quickly and prevent recurrence.'
      },
      {
        topicId: 'on-call-culture',
        title: '7. On-Call Culture and Responsibilities',
        content: 'Many DevOps engineers participate in on-call rotations, where they respond to production issues outside normal hours. This requires strong monitoring, alerts, and documentation.\n\nUnderstanding on-call expectations prepares students mentally and professionally for real DevOps roles.'
      },
      {
        topicId: 'monitoring-vs-alerting',
        title: '8. Monitoring vs Alerting',
        content: 'Monitoring collects data about system health (CPU, memory, latency). Alerting notifies teams when something goes wrong.\n\nToo many alerts cause alert fatigue; too few alerts cause missed incidents. DevOps engineers must design meaningful alerts tied to real impact.'
      },
      {
        topicId: 'observability-basics',
        title: '9. Logs, Metrics, and Traces (Observability Basics)',
        content: 'Observability helps teams understand system behavior:\n\nLogs: What happened\n\nMetrics: How much / how often\n\nTraces: Where time is spent\n\nModern DevOps relies on observability to debug issues quickly and confidently in distributed systems.'
      },
      {
        topicId: 'backup-dr',
        title: '10. Backup and Disaster Recovery (DR)',
        content: 'Backups protect data; disaster recovery ensures systems can be restored after major failures. This includes backups, replication, and recovery plans.\n\nDevOps engineers must design backup strategies and test recovery regularly. A backup that cannot be restored is useless.'
      },
      {
        topicId: 'config-drift',
        title: '11. Configuration Drift and Why It’s Dangerous',
        content: 'Configuration drift occurs when systems slowly become inconsistent over time. This leads to unpredictable behavior and failures.\n\nInfrastructure as Code, automation, and configuration management tools help eliminate drift and maintain consistency.'
      },
      {
        topicId: 'change-management',
        title: '12. Change Management in DevOps',
        content: 'Even in fast-moving DevOps teams, changes must be controlled. Change management ensures visibility, approval (when required), and traceability.\n\nDevOps does not remove discipline—it replaces slow manual processes with smart automation and transparency.'
      },
      {
        topicId: 'operational-docs',
        title: '13. Operational Documentation (Runbooks & Playbooks)',
        content: 'Runbooks provide step-by-step instructions for handling common issues. They reduce panic during incidents and enable faster resolution.\n\nGood documentation turns tribal knowledge into shared knowledge, improving team efficiency and reliability.'
      },
      {
        topicId: 'cost-awareness',
        title: '14. Cost Awareness in Operations',
        content: 'DevOps engineers must understand that every resource costs money. Poor monitoring, over-provisioning, and inefficient pipelines increase expenses.\n\nCost awareness is a critical skill, especially in cloud-based DevOps roles.'
      },
      {
        topicId: 'devops-mindset',
        title: '15. DevOps Mindset in Operations',
        content: 'DevOps operations are not just about tools—they are about ownership, responsibility, collaboration, and continuous improvement.\n\nA DevOps engineer owns systems end-to-end, from deployment to reliability to learning from failures. This mindset separates average engineers from great ones.'
      }
    ],
    passingPercentage: 70,
    totalQuestions: 10,
    questions: [
      {
        questionId: 1,
        question: 'What defines a production environment in DevOps?',
        options: [
          'An environment used only for testing features',
          'An environment where real users interact with the application',
          'An environment for experimenting with new tools',
          'An environment without monitoring'
        ],
        correctAnswer: 1
      },
      {
        questionId: 2,
        question: 'Why is the production environment treated differently from staging or testing?',
        options: [
          'It allows frequent breaking changes',
          'It contains fake user data',
          'Failures directly impact real users and business',
          'It does not require automation'
        ],
        correctAnswer: 2
      },
      {
        questionId: 3,
        question: 'What is the primary goal of High Availability (HA)?',
        options: [
          'Reduce development time',
          'Improve code readability',
          'Keep systems running despite failures',
          'Eliminate monitoring'
        ],
        correctAnswer: 2
      },
      {
        questionId: 4,
        question: 'What is the difference between scalability and elasticity?',
        options: [
          'Both mean the same',
          'Scalability is automatic; elasticity is manual',
          'Scalability handles growth, elasticity adapts automatically to demand',
          'Elasticity increases downtime'
        ],
        correctAnswer: 2
      },
      {
        questionId: 5,
        question: 'Which of the following is a common cause of production downtime?',
        options: [
          'Code formatting issues',
          'Poor UI design',
          'Bad deployments or human error',
          'Strong monitoring'
        ],
        correctAnswer: 2
      },
      {
        questionId: 6,
        question: 'What is incident management mainly focused on?',
        options: [
          'Blaming team members',
          'Ignoring system failures',
          'Detecting, responding, resolving, and learning from incidents',
          'Preventing deployments'
        ],
        correctAnswer: 2
      },
      {
        questionId: 7,
        question: 'Why is monitoring important in production systems?',
        options: [
          'To slow down applications',
          'To collect data without purpose',
          'To detect issues before users are severely impacted',
          'To replace alerting'
        ],
        correctAnswer: 2
      },
      {
        questionId: 8,
        question: 'What is alert fatigue?',
        options: [
          'When alerts stop working',
          'When too many alerts cause teams to ignore them',
          'When monitoring tools crash',
          'When systems scale automatically'
        ],
        correctAnswer: 1
      },
      {
        questionId: 9,
        question: 'Why should disaster recovery plans be tested regularly?',
        options: [
          'To increase operational cost',
          'To comply with documentation standards only',
          'To ensure backups can actually restore systems',
          'To avoid automation'
        ],
        correctAnswer: 2
      },
      {
        questionId: 10,
        question: 'What is the core DevOps mindset in operations?',
        options: [
          'Avoid responsibility after deployment',
          'Focus only on tools',
          'Ownership, collaboration, and continuous improvement',
          'Manual intervention for every change'
        ],
        correctAnswer: 2
      }
    ]
  }
];

(async () => {
  try {
    console.log(process.env.MONGODB_URI);
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jasnav_projects';
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    for (const data of assignmentsData) {
      const result = await Assignment.findOneAndUpdate(
        { assignmentId: data.assignmentId },
        { $set: data },
        { upsert: true, new: true }
      );
      console.log(`Upserted assignment: ${result.assignmentId} | ${result.title}`);
    }

    console.log('Done upserting DevOps Beginner assignments.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();
