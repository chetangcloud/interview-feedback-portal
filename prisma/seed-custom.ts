/**
 * Extends the base seed with the interviewer's real question set and
 * quick-note phrase bank, sourced from their actual interview rubric.
 * Additive and idempotent: existing technologies (GCP, Docker, Kubernetes,
 * Linux, Terraform) get new questions/notes merged in; two new
 * technologies (CI/CD Concepts, Programming & Scripting) are created.
 * Safe to re-run — skips anything that already exists.
 */
import { PrismaClient, Difficulty, Sentiment } from "@prisma/client";

const prisma = new PrismaClient();

type SeedQuestion = { category: string; difficulty: Difficulty; question: string };
type SeedNote = { category: string; sentiment: Sentiment; text: string };
type SeedTechnology = {
  name: string;
  description?: string;
  questions: SeedQuestion[];
  notes: SeedNote[];
};

const technologies: SeedTechnology[] = [
  {
    name: "GCP",
    questions: [
      { category: "Networking", difficulty: "easy", question: "What is a subnet and why is it used in cloud networking?" },
      { category: "Networking", difficulty: "easy", question: "What is DNS and how does the resolution process work?" },
      { category: "Networking", difficulty: "easy", question: "What is the OSI model and what do its layers represent?" },
      { category: "Networking", difficulty: "easy", question: "What is NAT (Network Address Translation) and when is it used?" },
      { category: "Networking", difficulty: "easy", question: "What are TCP and UDP, and how do they differ?" },
      { category: "Networking", difficulty: "easy", question: "What is a VPN and how does it secure communication over public networks?" },
      { category: "Networking", difficulty: "medium", question: "What is a VPC (Virtual Private Cloud) in GCP, and what's the difference between auto and custom mode?" },
      { category: "Networking", difficulty: "medium", question: "What is a Shared VPC in GCP, and how do host and service projects interact?" },
      { category: "Networking", difficulty: "medium", question: "What is VPC peering, and what are its limitations (e.g. non-transitive connectivity)?" },
      { category: "Networking", difficulty: "hard", question: "What is Cloud Interconnect, and how does it compare to a VPN for connecting on-premises to GCP?" },
      { category: "Security", difficulty: "easy", question: "How would you grant read access to a specific user for a Cloud Storage bucket?" },
      { category: "Security", difficulty: "medium", question: "How would you ensure sensitive data stored in Cloud Storage is encrypted, and what's the difference between Google-managed and customer-managed keys?" },
      { category: "Security", difficulty: "medium", question: "How would you enhance the security of a Cloud SQL instance using SSL/TLS, IP whitelisting, and IAM?" },
      { category: "Infrastructure", difficulty: "medium", question: "How would you configure a Cloud Storage lifecycle rule to automatically delete objects older than 30 days?" },
      { category: "Infrastructure", difficulty: "medium", question: "How does Cloud Storage replicate data across regions, and what's the difference between regional, dual-region, and multi-region storage?" },
      { category: "Infrastructure", difficulty: "medium", question: "What scaling options are available for Cloud SQL instances, and what are the trade-offs between vertical and horizontal scaling?" },
      { category: "Infrastructure", difficulty: "medium", question: "How would you connect an application running on a Compute Engine VM to a Cloud SQL database?" },
      { category: "Best Practices", difficulty: "medium", question: "How would you reduce storage costs for large amounts of infrequently accessed data in Cloud Storage?" },
      { category: "Production", difficulty: "easy", question: "What backup options are available for a Cloud SQL database?" },
      { category: "Production", difficulty: "medium", question: "How would you migrate a large dataset from an on-premises data center to Google Cloud Storage?" },
      { category: "Production", difficulty: "medium", question: "How would you migrate an existing on-premises database to Cloud SQL with minimal downtime?" },
      { category: "Production", difficulty: "medium", question: "How would you recover a Cloud SQL database to a specific point in time before a data corruption incident?" },
      { category: "Production", difficulty: "hard", question: "Your application requires geo-redundancy across multiple regions for Cloud SQL — how would you design the deployment and networking?" },
      { category: "Production", difficulty: "hard", question: "How would you design high availability for Cloud SQL, including failover and read replicas?" },
      { category: "Monitoring", difficulty: "easy", question: "How would you track access to objects in a Cloud Storage bucket for auditing purposes?" },
      { category: "Monitoring", difficulty: "medium", question: "How would you set up advanced monitoring and alerting for Cloud SQL instances?" },
      { category: "Monitoring", difficulty: "medium", question: "How would you use Cloud Audit Logs to track admin actions across GCP projects for compliance?" },
      { category: "Monitoring", difficulty: "medium", question: "How would you set up Error Reporting to detect, group, and get notified about recurring errors in a GCP-based web app?" },
      { category: "Troubleshooting", difficulty: "medium", question: "How would you use Cloud Audit Logs to investigate suspicious or unauthorized activity?" },
      { category: "Architecture", difficulty: "easy", question: "What is the difference between IaaS, PaaS, and SaaS?" },
      { category: "Architecture", difficulty: "medium", question: "You need full control over the OS and infrastructure — which cloud service model would you choose and why?" },
      { category: "Architecture", difficulty: "medium", question: "Your application has strict compliance and security requirements — how does security responsibility change across IaaS, PaaS, and SaaS?" },
      { category: "Architecture", difficulty: "medium", question: "You have a global web application with users across 3 continents — what are the key design considerations?" },
      { category: "Architecture", difficulty: "medium", question: "What is the difference between regional and global load balancing, and when would you use each?" },
    ],
    notes: [
      { category: "Networking", sentiment: "positive", text: "Clearly explained subnets and IP segmentation." },
      { category: "Networking", sentiment: "positive", text: "Solid understanding of DNS resolution flow." },
      { category: "Networking", sentiment: "positive", text: "Correctly described OSI model layers." },
      { category: "Networking", sentiment: "positive", text: "Explained NAT use cases accurately." },
      { category: "Networking", sentiment: "positive", text: "Correctly differentiated TCP vs UDP." },
      { category: "Networking", sentiment: "positive", text: "Understood VPC, peering, and Shared VPC concepts." },
      { category: "Networking", sentiment: "negative", text: "Unclear on CIDR ranges and IP planning." },
      { category: "Networking", sentiment: "negative", text: "Could not explain recursive vs authoritative DNS." },
      { category: "Networking", sentiment: "negative", text: "Struggled to map OSI layers to real protocols." },
      { category: "Networking", sentiment: "negative", text: "Limited understanding of NAT types (SNAT/DNAT)." },
      { category: "Networking", sentiment: "negative", text: "Could not explain VPC peering limitations (non-transitive)." },
      { category: "Networking", sentiment: "negative", text: "Unclear on Cloud Interconnect vs VPN trade-offs." },
      { category: "Infrastructure", sentiment: "positive", text: "Understood storage class selection for cost optimization." },
      { category: "Infrastructure", sentiment: "positive", text: "Explained Cloud SQL scaling options clearly." },
      { category: "Infrastructure", sentiment: "positive", text: "Correctly described multi-region replication." },
      { category: "Infrastructure", sentiment: "negative", text: "Not confident configuring lifecycle policies." },
      { category: "Infrastructure", sentiment: "negative", text: "Unclear on regional vs dual-region vs multi-region storage." },
      { category: "Infrastructure", sentiment: "negative", text: "Limited depth on vertical vs horizontal scaling trade-offs." },
      { category: "Security", sentiment: "positive", text: "Understood IAM-based access control for buckets." },
      { category: "Security", sentiment: "positive", text: "Aware of encryption options (Google-managed vs CMEK)." },
      { category: "Security", sentiment: "positive", text: "Explained SSL/TLS and IP whitelisting for Cloud SQL." },
      { category: "Security", sentiment: "negative", text: "Lacks fine-grained IAM policy design experience." },
      { category: "Security", sentiment: "negative", text: "Unclear on customer-managed encryption key setup." },
      { category: "Security", sentiment: "negative", text: "Not confident configuring IAM database authentication." },
      { category: "Production", sentiment: "positive", text: "Solid grasp of backup and point-in-time recovery." },
      { category: "Production", sentiment: "positive", text: "Understood migration strategies to Cloud SQL/Storage." },
      { category: "Production", sentiment: "positive", text: "Aware of geo-redundant deployment considerations." },
      { category: "Production", sentiment: "negative", text: "Unclear on minimal-downtime migration strategies." },
      { category: "Production", sentiment: "negative", text: "Limited depth on point-in-time recovery configuration." },
      { category: "Production", sentiment: "negative", text: "Struggled to design failover for geo-redundant Cloud SQL." },
      { category: "Monitoring", sentiment: "positive", text: "Understood Cloud Audit Logs for compliance tracking." },
      { category: "Monitoring", sentiment: "positive", text: "Aware of Error Reporting grouping and alerting." },
      { category: "Monitoring", sentiment: "positive", text: "Understood the need for auditing storage access." },
      { category: "Monitoring", sentiment: "negative", text: "Limited hands-on experience with monitoring tool configuration." },
      { category: "Monitoring", sentiment: "negative", text: "Unclear on exporting audit logs for long-term retention." },
      { category: "Troubleshooting", sentiment: "positive", text: "Used Cloud Audit Logs effectively to investigate activity." },
      { category: "Troubleshooting", sentiment: "negative", text: "Struggled to outline an investigation workflow using audit logs." },
      { category: "Architecture", sentiment: "positive", text: "Clearly explained IaaS vs PaaS vs SaaS trade-offs." },
      { category: "Architecture", sentiment: "positive", text: "Mapped real-world requirements to the right service model." },
      { category: "Architecture", sentiment: "positive", text: "Understood shared responsibility model for security." },
      { category: "Architecture", sentiment: "negative", text: "Lacks depth on control vs cost vs effort trade-offs." },
      { category: "Architecture", sentiment: "negative", text: "Unclear on compliance implications per service model." },
      { category: "Architecture", sentiment: "negative", text: "Limited clarity on regional vs global load balancing." },
    ],
  },
  {
    name: "Docker",
    questions: [
      { category: "Architecture", difficulty: "medium", question: "How does Docker Compose differ from a plain Dockerfile, and when would you use multi-container orchestration?" },
      { category: "Best Practices", difficulty: "medium", question: "What best practices would you follow to reduce Docker image size and improve build caching?" },
      { category: "Best Practices", difficulty: "easy", question: "What is the difference between docker build and docker-compose up, and how do they fit into a workflow?" },
      { category: "Infrastructure", difficulty: "medium", question: "How do Docker volumes and networking work, and how would you design persistent storage for a multi-container app?" },
    ],
    notes: [
      { category: "Best Practices", sentiment: "positive", text: "Understood Dockerfile structure and directives (FROM, RUN, COPY)." },
      { category: "Best Practices", sentiment: "positive", text: "Explained Docker Compose use cases for multi-container apps." },
      { category: "Best Practices", sentiment: "positive", text: "Aware of build caching and multi-stage builds." },
      { category: "Best Practices", sentiment: "negative", text: "Unclear on reducing image size / multi-stage builds." },
      { category: "Best Practices", sentiment: "negative", text: "Could not differentiate docker build vs docker-compose up." },
      { category: "Best Practices", sentiment: "negative", text: "Didn't mention build caching as an optimization." },
      { category: "Infrastructure", sentiment: "positive", text: "Understood volume mounting options." },
      { category: "Infrastructure", sentiment: "positive", text: "Could describe container networking modes clearly." },
      { category: "Infrastructure", sentiment: "negative", text: "Unclear on volume mounting options." },
      { category: "Infrastructure", sentiment: "negative", text: "Limited understanding of container networking modes." },
    ],
  },
  {
    name: "Kubernetes",
    questions: [
      { category: "Troubleshooting", difficulty: "medium", question: "How would you troubleshoot a Kubernetes Service that isn't routing traffic to its pods?" },
      { category: "Architecture", difficulty: "medium", question: "What is the difference between a StatefulSet and a Deployment, and when would you use a StatefulSet?" },
      { category: "Deployment", difficulty: "hard", question: "How would you design HPA (Horizontal Pod Autoscaling) tuned for real-world traffic spikes?" },
      { category: "Deployment", difficulty: "medium", question: "How does an Ingress controller route external traffic to services, and how would you configure path-based routing?" },
      { category: "Deployment", difficulty: "hard", question: "How would you design a Blue/Green or Canary deployment strategy in Kubernetes for zero-downtime releases?" },
    ],
    notes: [
      { category: "Architecture", sentiment: "positive", text: "Explained control plane vs data plane clearly." },
      { category: "Architecture", sentiment: "positive", text: "Understood etcd's role in cluster state." },
      { category: "Architecture", sentiment: "positive", text: "Correctly described master vs worker node responsibilities." },
      { category: "Architecture", sentiment: "negative", text: "Unclear on control plane vs data plane split." },
      { category: "Architecture", sentiment: "negative", text: "Could not explain etcd's role in maintaining state." },
      { category: "Architecture", sentiment: "negative", text: "Unclear on how kube-scheduler assigns pods to nodes." },
      { category: "Troubleshooting", sentiment: "positive", text: "Used kubectl logs/describe effectively for root cause analysis." },
      { category: "Troubleshooting", sentiment: "positive", text: "Identified common failure modes (crashloops, resource exhaustion)." },
      { category: "Troubleshooting", sentiment: "negative", text: "Unfamiliar with kubectl logs/describe for diagnosis." },
      { category: "Troubleshooting", sentiment: "negative", text: "Struggled to identify common pod failure modes." },
      { category: "Deployment", sentiment: "positive", text: "Understood HPA and custom metrics scaling." },
      { category: "Deployment", sentiment: "positive", text: "Explained Ingress path-based routing and TLS." },
      { category: "Deployment", sentiment: "positive", text: "Understood Blue/Green and Canary deployment concepts." },
      { category: "Deployment", sentiment: "negative", text: "Unclear on HPA tuning for real-world traffic." },
      { category: "Deployment", sentiment: "negative", text: "Limited hands-on experience configuring Ingress controllers." },
      { category: "Deployment", sentiment: "negative", text: "Could not explain Blue/Green vs Canary trade-offs." },
    ],
  },
  {
    name: "Linux",
    questions: [
      { category: "Troubleshooting", difficulty: "medium", question: "A service crashes intermittently with no log output — how would you trace the problem and prevent future crashes?" },
      { category: "Troubleshooting", difficulty: "easy", question: "How would you identify the largest directories or files consuming disk space on a system?" },
      { category: "Troubleshooting", difficulty: "medium", question: "Your /var partition is almost full — how would you identify and safely remove unnecessary files?" },
      { category: "Production", difficulty: "medium", question: "A patch applied to a production server caused instability — how would you roll back the update?" },
      { category: "Production", difficulty: "hard", question: "You need to patch hundreds of servers automatically — what strategy would you use to prevent patch failures at scale?" },
      { category: "Networking", difficulty: "medium", question: "Explain the DNS resolution process on a Linux system, from request to final resolution." },
      { category: "Networking", difficulty: "easy", question: "What is the role of TTL, A, CNAME, and MX records in a DNS zone file?" },
      { category: "Networking", difficulty: "medium", question: "How would you use dig, nslookup, and host to troubleshoot DNS problems on Linux?" },
      { category: "Fundamentals", difficulty: "easy", question: "How would you use ps, netstat, and systemctl to investigate a misbehaving service?" },
    ],
    notes: [
      { category: "Troubleshooting", sentiment: "positive", text: "Used ps/top to identify the offending process." },
      { category: "Troubleshooting", sentiment: "positive", text: "Used kill before resorting to kill -9." },
      { category: "Troubleshooting", sentiment: "positive", text: "Investigated disk usage correctly with du -h." },
      { category: "Troubleshooting", sentiment: "negative", text: "Missed using ps/top to identify the process ID." },
      { category: "Troubleshooting", sentiment: "negative", text: "Went straight to kill -9 without trying graceful kill first." },
      { category: "Troubleshooting", sentiment: "negative", text: "Missed using du to investigate disk usage." },
      { category: "Production", sentiment: "positive", text: "Followed installation/patching steps correctly." },
      { category: "Production", sentiment: "positive", text: "Verified patch versions before applying." },
      { category: "Production", sentiment: "positive", text: "Considered dependencies during patching." },
      { category: "Production", sentiment: "negative", text: "Missed steps in the installation process." },
      { category: "Production", sentiment: "negative", text: "Did not verify patch versions before applying." },
      { category: "Production", sentiment: "negative", text: "Overlooked dependencies during patching." },
      { category: "Networking", sentiment: "positive", text: "Understood DNS resolution and zone file structure." },
      { category: "Networking", sentiment: "positive", text: "Effectively used dig/nslookup/host to troubleshoot." },
      { category: "Networking", sentiment: "positive", text: "Correctly identified DNS server issues." },
      { category: "Networking", sentiment: "negative", text: "Struggled to resolve DNS errors." },
      { category: "Networking", sentiment: "negative", text: "Missed checking DNS logs." },
      { category: "Networking", sentiment: "negative", text: "Didn't verify DNS records before making changes." },
      { category: "Fundamentals", sentiment: "positive", text: "Used ps, netstat, systemctl effectively." },
      { category: "Fundamentals", sentiment: "positive", text: "Comfortable with ls for directory/file checks." },
      { category: "Fundamentals", sentiment: "negative", text: "Struggled using netstat for network checks." },
      { category: "Fundamentals", sentiment: "negative", text: "Didn't use ps to find active processes." },
      { category: "Fundamentals", sentiment: "negative", text: "Missed using systemctl to manage services." },
    ],
  },
  {
    name: "Terraform",
    questions: [
      { category: "Security", difficulty: "medium", question: "How does Terraform authenticate with cloud providers like AWS or GCP, and what are best practices for managing credentials securely?" },
      { category: "Security", difficulty: "medium", question: "How would you handle authentication and authorization across multiple environments (dev/staging/prod) in Terraform?" },
      { category: "Fundamentals", difficulty: "easy", question: "What files and directories does terraform init create, and what is the .terraform directory used for?" },
      { category: "Best Practices", difficulty: "medium", question: "How would you specify and pin provider versions in Terraform, and why does it matter?" },
      { category: "Infrastructure", difficulty: "hard", question: "Your Terraform state file is growing large and causing performance issues — how would you redesign state management for scalability?" },
      { category: "Infrastructure", difficulty: "hard", question: "You're designing Terraform architecture across multiple accounts (Dev/Prod/Shared Services) — how would you structure state and modules?" },
      { category: "Best Practices", difficulty: "medium", question: "When would you use count vs for_each in Terraform, and what are the trade-offs?" },
      { category: "CI/CD", difficulty: "medium", question: "How would you design a secure, automated Terraform pipeline: validate, test, scan, apply?" },
      { category: "CI/CD", difficulty: "hard", question: "How would you design policy enforcement, auditability, and approval workflows for Terraform at an organization level?" },
      { category: "CI/CD", difficulty: "medium", question: "What tools (Terratest, Terragrunt, Checkov) would you use to test and standardize Terraform code, and why?" },
    ],
    notes: [
      { category: "Security", sentiment: "positive", text: "Explained cloud provider auth clearly with examples." },
      { category: "Security", sentiment: "positive", text: "Mentioned secure secret storage (Vault/Terraform Cloud)." },
      { category: "Security", sentiment: "positive", text: "Demonstrated least-privilege IAM role design." },
      { category: "Security", sentiment: "negative", text: "Lacks understanding of cloud provider auth methods." },
      { category: "Security", sentiment: "negative", text: "Suggested hardcoding credentials (insecure)." },
      { category: "Security", sentiment: "negative", text: "Confused IAM roles and policies, or over-permissive design." },
      { category: "Infrastructure", sentiment: "positive", text: "Understood remote state and locking for team collaboration." },
      { category: "Infrastructure", sentiment: "positive", text: "Aware state files may contain sensitive data." },
      { category: "Infrastructure", sentiment: "positive", text: "Understood separating state across environments." },
      { category: "Infrastructure", sentiment: "negative", text: "Unclear on backend configuration (S3/GCS with locking)." },
      { category: "Infrastructure", sentiment: "negative", text: "No hands-on experience with state recovery scenarios." },
      { category: "Infrastructure", sentiment: "negative", text: "Limited clarity on state isolation for large-scale environments." },
      { category: "Best Practices", sentiment: "positive", text: "Understood count vs for_each trade-offs." },
      { category: "Best Practices", sentiment: "positive", text: "Aware of modules for reusable infrastructure." },
      { category: "Best Practices", sentiment: "positive", text: "Understood implicit vs explicit dependencies." },
      { category: "Best Practices", sentiment: "negative", text: "Unclear on when to use count vs for_each." },
      { category: "Best Practices", sentiment: "negative", text: "Lacks experience designing reusable modules." },
      { category: "Best Practices", sentiment: "negative", text: "Limited understanding of complex iteration patterns." },
      { category: "CI/CD", sentiment: "positive", text: "Understood validate/test/scan/apply pipeline design." },
      { category: "CI/CD", sentiment: "positive", text: "Aware of Terratest, Terragrunt, Checkov for testing." },
      { category: "CI/CD", sentiment: "positive", text: "Understood policy enforcement and approval gates." },
      { category: "CI/CD", sentiment: "negative", text: "Limited hands-on experience with Terraform CI/CD pipelines." },
      { category: "CI/CD", sentiment: "negative", text: "Unclear on integrating security scans into IaC workflows." },
      { category: "CI/CD", sentiment: "negative", text: "Lacks depth on governance/compliance enforcement." },
    ],
  },
  {
    name: "CI/CD Concepts",
    description: "Pipeline design, source control workflows, and deployment strategy concepts independent of any single CI/CD tool.",
    questions: [
      { category: "Fundamentals", difficulty: "easy", question: "What are the key differences between Continuous Delivery and Continuous Deployment?" },
      { category: "Fundamentals", difficulty: "medium", question: "How would you ensure every code commit automatically triggers the CI pipeline?" },
      { category: "Best Practices", difficulty: "medium", question: "How do you manage and organize automated tests to avoid long build times?" },
      { category: "Troubleshooting", difficulty: "hard", question: "Multiple teams commit to the same repo, causing frequent merge conflicts and broken builds — how would you redesign the CI workflow to stabilize builds?" },
      { category: "Best Practices", difficulty: "medium", question: "Your pipeline runs unnecessary jobs even for small changes — how would you optimize execution using change detection?" },
      { category: "Security", difficulty: "medium", question: "A critical vulnerability is found in a dependency — how would you ensure your CI pipeline prevents that code from being merged?" },
      { category: "Deployment", difficulty: "medium", question: "How would you set up a pipeline where code is production-ready but requires manual approval before deployment?" },
      { category: "Deployment", difficulty: "hard", question: "You need to deploy a feature to only 5% of users initially — how would you design this rollout?" },
      { category: "Deployment", difficulty: "hard", question: "You have a strict 99.99% SLA with zero downtime — how would you design your deployment strategy?" },
      { category: "Security", difficulty: "medium", question: "How would you ensure no secrets are exposed in code or logs across your CI/CD pipeline?" },
      { category: "Deployment", difficulty: "medium", question: "How would you design safe promotion across Dev → Staging → Prod environments?" },
      { category: "Deployment", difficulty: "medium", question: "How would you handle versioning and rollback of infrastructure changes in a CI/CD pipeline?" },
      { category: "Best Practices", difficulty: "medium", question: "How would you design a branching strategy to minimize merge conflicts for a team working on multiple features simultaneously?" },
      { category: "Best Practices", difficulty: "medium", question: "How would you enforce consistent, automated pull request reviews instead of manual, inconsistent ones?" },
      { category: "Deployment", difficulty: "hard", question: "50+ developers work across multiple services — how would you design an end-to-end branching and PR strategy (feature branch → PR → main → release)?" },
      { category: "Monitoring", difficulty: "medium", question: "Your pipeline fails but the logs aren't sufficient to debug — how would you improve logging and observability?" },
      { category: "Monitoring", difficulty: "medium", question: "How would you design centralized logging for all pipeline executions?" },
      { category: "Monitoring", difficulty: "medium", question: "Deployments sometimes succeed but the application fails later — how would you integrate monitoring with your CI/CD pipeline?" },
      { category: "Monitoring", difficulty: "medium", question: "How would you design a proactive alerting strategy for pipeline failures?" },
    ],
    notes: [
      { category: "Fundamentals", sentiment: "positive", text: "Clearly explained continuous delivery vs continuous deployment." },
      { category: "Fundamentals", sentiment: "positive", text: "Understood event-driven pipeline triggers." },
      { category: "Fundamentals", sentiment: "negative", text: "Confused continuous delivery with continuous deployment." },
      { category: "Fundamentals", sentiment: "negative", text: "Unclear on how commit-based triggers work." },
      { category: "Best Practices", sentiment: "positive", text: "Understood test organization to reduce build times." },
      { category: "Best Practices", sentiment: "positive", text: "Aware of change-detection to skip unnecessary jobs." },
      { category: "Best Practices", sentiment: "positive", text: "Understood trunk-based development benefits." },
      { category: "Best Practices", sentiment: "negative", text: "No hands-on experience with pipeline parallelization/caching." },
      { category: "Best Practices", sentiment: "negative", text: "Lacks clarity on conditional/dynamic pipeline jobs." },
      { category: "Best Practices", sentiment: "negative", text: "Limited experience with trunk-based development." },
      { category: "Security", sentiment: "positive", text: "Understood blocking vulnerable dependencies pre-merge." },
      { category: "Security", sentiment: "positive", text: "Aware of secrets management in CI/CD." },
      { category: "Security", sentiment: "negative", text: "Lacks depth on dependency/secret scanning implementation." },
      { category: "Security", sentiment: "negative", text: "Unclear on secure secrets injection practices." },
      { category: "Deployment", sentiment: "positive", text: "Understood canary/feature-flag progressive delivery." },
      { category: "Deployment", sentiment: "positive", text: "Aware of zero-downtime deployment strategies." },
      { category: "Deployment", sentiment: "positive", text: "Understood environment promotion with approval gates." },
      { category: "Deployment", sentiment: "negative", text: "Limited practical experience with zero-downtime deployments under SLA." },
      { category: "Deployment", sentiment: "negative", text: "Unclear on designing approval gates and rollback mechanisms." },
      { category: "Deployment", sentiment: "negative", text: "Lacks depth on infrastructure change versioning/rollback." },
      { category: "Monitoring", sentiment: "positive", text: "Understood centralized logging design for pipelines." },
      { category: "Monitoring", sentiment: "positive", text: "Aware of integrating APM/health checks with deployments." },
      { category: "Monitoring", sentiment: "positive", text: "Understood proactive alerting for pipeline failures." },
      { category: "Monitoring", sentiment: "negative", text: "No hands-on experience with centralized logging tools." },
      { category: "Monitoring", sentiment: "negative", text: "Lacks depth on correlating logs/metrics/events for RCA." },
      { category: "Monitoring", sentiment: "negative", text: "Unclear on defining meaningful pipeline metrics." },
      { category: "Troubleshooting", sentiment: "positive", text: "Understood redesigning CI workflow to reduce merge conflicts/broken builds." },
      { category: "Troubleshooting", sentiment: "negative", text: "Lacks experience stabilizing CI workflows for multi-team repos." },
    ],
  },
  {
    name: "Programming & Scripting",
    description: "General scripting, automation, and programming fundamentals used across DevOps tooling.",
    questions: [
      { category: "Fundamentals", difficulty: "easy", question: "How would you approach writing a simple script to print numbers from 1 to 100?" },
      { category: "Fundamentals", difficulty: "easy", question: "How would you write a script that takes user input and prints a formatted output?" },
      { category: "Troubleshooting", difficulty: "medium", question: "Your script fails due to invalid input — how would you handle this gracefully?" },
      { category: "Troubleshooting", difficulty: "medium", question: "A script is intermittently failing — how would you identify the root cause?" },
      { category: "Best Practices", difficulty: "medium", question: "What practices would you follow to write readable, modular, and maintainable automation scripts?" },
    ],
    notes: [
      { category: "Fundamentals", sentiment: "positive", text: "Solid grasp of basic programming constructs and syntax." },
      { category: "Fundamentals", sentiment: "positive", text: "Demonstrated logical, structured problem-solving." },
      { category: "Fundamentals", sentiment: "negative", text: "Struggled with basic control flow / syntax." },
      { category: "Fundamentals", sentiment: "negative", text: "Needed prompting to structure the solution logically." },
      { category: "Troubleshooting", sentiment: "positive", text: "Handled invalid input gracefully with proper error handling." },
      { category: "Troubleshooting", sentiment: "positive", text: "Used a structured approach to find root cause of intermittent failures." },
      { category: "Troubleshooting", sentiment: "negative", text: "Didn't account for invalid/edge-case input." },
      { category: "Troubleshooting", sentiment: "negative", text: "Lacked a structured debugging approach for intermittent failures." },
      { category: "Best Practices", sentiment: "positive", text: "Followed readability and modularity best practices." },
      { category: "Best Practices", sentiment: "positive", text: "Wrote reusable, well-structured automation code." },
      { category: "Best Practices", sentiment: "negative", text: "Code lacked modularity/readability." },
      { category: "Best Practices", sentiment: "negative", text: "Missed logging or testing considerations for production scripts." },
    ],
  },
];

async function main() {
  console.log("Seeding custom (real-world) question bank + note suggestions...");

  for (const tech of technologies) {
    const technology = await prisma.technology.upsert({
      where: { name: tech.name },
      update: {},
      create: {
        name: tech.name,
        description: tech.description ?? null,
        active: true,
      },
    });

    let addedQuestions = 0;
    for (const q of tech.questions) {
      const existing = await prisma.question.findFirst({
        where: { technologyId: technology.id, questionText: q.question },
      });
      if (existing) continue;
      await prisma.question.create({
        data: {
          technologyId: technology.id,
          category: q.category,
          difficulty: q.difficulty,
          questionText: q.question,
          active: true,
        },
      });
      addedQuestions++;
    }

    let addedNotes = 0;
    for (const n of tech.notes) {
      const existing = await prisma.noteSuggestion.findFirst({
        where: { technologyId: technology.id, category: n.category, sentiment: n.sentiment, text: n.text },
      });
      if (existing) continue;
      await prisma.noteSuggestion.create({
        data: {
          technologyId: technology.id,
          category: n.category,
          sentiment: n.sentiment,
          text: n.text,
          active: true,
        },
      });
      addedNotes++;
    }

    console.log(`  ${tech.name}: +${addedQuestions} questions, +${addedNotes} note suggestions`);
  }

  console.log("Custom seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
