import { PrismaClient, Difficulty } from "@prisma/client";

const prisma = new PrismaClient();

type SeedQuestion = {
  category: string;
  difficulty: Difficulty;
  question: string;
};

type SeedTechnology = {
  name: string;
  description: string;
  questions: SeedQuestion[];
};

const technologies: SeedTechnology[] = [
  {
    name: "Kubernetes",
    description: "Container orchestration platform",
    questions: [
      { category: "Architecture", difficulty: "medium", question: "Explain the difference between a Deployment, a StatefulSet, and a DaemonSet, and describe a real scenario where you would choose each." },
      { category: "Troubleshooting", difficulty: "medium", question: "A pod is stuck in CrashLoopBackOff. Walk through how you would diagnose and resolve it." },
      { category: "Networking", difficulty: "hard", question: "How does Kubernetes Service discovery and load balancing work under the hood, including the role of kube-proxy and CoreDNS?" },
      { category: "Production", difficulty: "medium", question: "What happens, step by step, when a Kubernetes node becomes NotReady while running production workloads?" },
      { category: "Deployment", difficulty: "easy", question: "What is the difference between a rolling update and a recreate deployment strategy?" },
      { category: "Security", difficulty: "hard", question: "How would you design RBAC and network policies to isolate a multi-tenant Kubernetes cluster?" },
      { category: "Best Practices", difficulty: "medium", question: "Why are resource requests and limits important, and what happens when a pod exceeds its memory limit versus its CPU limit?" },
      { category: "Architecture", difficulty: "medium", question: "Explain how the Kubernetes control plane components (API server, etcd, scheduler, controller manager) interact when you run kubectl apply." },
      { category: "Troubleshooting", difficulty: "easy", question: "How do liveness, readiness, and startup probes differ, and what problems can misconfiguring them cause?" },
      { category: "Infrastructure", difficulty: "medium", question: "How would you plan and execute a zero-downtime upgrade of a production Kubernetes cluster?" },
    ],
  },
  {
    name: "Docker",
    description: "Containerization platform",
    questions: [
      { category: "Fundamentals", difficulty: "easy", question: "Explain the difference between a Docker image and a Docker container." },
      { category: "Best Practices", difficulty: "medium", question: "What techniques would you use to reduce the size of a production Docker image?" },
      { category: "Architecture", difficulty: "medium", question: "Describe how Docker uses layered filesystems and how build caching affects image layers." },
      { category: "Networking", difficulty: "medium", question: "Explain the difference between bridge, host, and overlay networking modes in Docker." },
      { category: "Security", difficulty: "hard", question: "What are the security risks of running containers as root, and how would you harden a Dockerfile against them?" },
      { category: "Troubleshooting", difficulty: "medium", question: "A container exits immediately after starting. How would you debug why?" },
      { category: "Production", difficulty: "hard", question: "How would you design a multi-stage Dockerfile for a compiled application to minimize the final image attack surface and size?" },
      { category: "Fundamentals", difficulty: "easy", question: "What is the purpose of a .dockerignore file and why does it matter for build performance?" },
      { category: "Infrastructure", difficulty: "medium", question: "How does Docker Compose differ from Docker Swarm, and when would you use one over the other?" },
      { category: "Best Practices", difficulty: "medium", question: "How do you manage secrets (API keys, credentials) for containers without baking them into the image?" },
    ],
  },
  {
    name: "Terraform",
    description: "Infrastructure as Code tool",
    questions: [
      { category: "Fundamentals", difficulty: "easy", question: "What is the purpose of the Terraform state file, and why should it not be manually edited?" },
      { category: "Infrastructure", difficulty: "medium", question: "How does Terraform build a dependency graph, and how does it decide the order of resource creation?" },
      { category: "Production", difficulty: "hard", question: "How would you design remote state management with locking for a team of engineers working on the same infrastructure?" },
      { category: "Troubleshooting", difficulty: "medium", question: "You run terraform plan and it shows a resource will be destroyed and recreated unexpectedly. How do you investigate why?" },
      { category: "Best Practices", difficulty: "medium", question: "How would you structure Terraform code and modules for a multi-environment (dev/staging/prod) setup?" },
      { category: "Security", difficulty: "medium", question: "How do you avoid storing sensitive values like database passwords in plain text in Terraform state and version control?" },
      { category: "Architecture", difficulty: "hard", question: "Explain how Terraform providers work and how you would manage provider version constraints across a large codebase." },
      { category: "Troubleshooting", difficulty: "easy", question: "What is the difference between terraform plan, terraform apply, and terraform refresh?" },
      { category: "Production", difficulty: "medium", question: "How would you safely import an existing manually-created cloud resource into Terraform management?" },
      { category: "Best Practices", difficulty: "medium", question: "What strategies do you use to handle state file locking conflicts and drift detection in a CI/CD pipeline?" },
    ],
  },
  {
    name: "GitHub Actions",
    description: "CI/CD automation platform on GitHub",
    questions: [
      { category: "Fundamentals", difficulty: "easy", question: "Explain the relationship between a workflow, a job, and a step in GitHub Actions." },
      { category: "CI/CD", difficulty: "medium", question: "How would you design a workflow that only deploys to production after tests pass on a tagged release?" },
      { category: "Best Practices", difficulty: "medium", question: "How do you securely handle secrets and credentials in GitHub Actions workflows?" },
      { category: "Architecture", difficulty: "medium", question: "What is the difference between a reusable workflow and a composite action, and when would you use each?" },
      { category: "Troubleshooting", difficulty: "medium", question: "A workflow that worked yesterday is now failing intermittently on the same commit. How would you investigate?" },
      { category: "Infrastructure", difficulty: "hard", question: "How would you set up self-hosted runners for GitHub Actions in a private VPC, and what security considerations apply?" },
      { category: "CI/CD", difficulty: "easy", question: "What is the purpose of caching dependencies in a GitHub Actions workflow, and how do you configure it?" },
      { category: "Security", difficulty: "hard", question: "How do you protect against supply-chain risks from third-party GitHub Actions used in your workflows?" },
      { category: "Production", difficulty: "medium", question: "How would you implement environment-specific approval gates before deploying to production using GitHub Actions?" },
      { category: "Best Practices", difficulty: "medium", question: "How would you parallelize a matrix build across multiple OS and language versions while keeping the workflow maintainable?" },
    ],
  },
  {
    name: "GitLab CI",
    description: "CI/CD platform built into GitLab",
    questions: [
      { category: "Fundamentals", difficulty: "easy", question: "Explain the structure of a .gitlab-ci.yml file: stages, jobs, and pipelines." },
      { category: "CI/CD", difficulty: "medium", question: "How does GitLab CI handle caching versus artifacts, and when would you use each?" },
      { category: "Architecture", difficulty: "medium", question: "What is the difference between shared runners, group runners, and specific runners in GitLab CI?" },
      { category: "Best Practices", difficulty: "medium", question: "How would you use GitLab CI templates and includes to avoid duplicating pipeline configuration across many repositories?" },
      { category: "Troubleshooting", difficulty: "medium", question: "A GitLab CI job fails only in the pipeline but succeeds when you run the same commands locally. How do you debug it?" },
      { category: "Production", difficulty: "hard", question: "How would you design a GitLab CI pipeline that supports manual approval, rollback, and canary deployment to production?" },
      { category: "Security", difficulty: "medium", question: "How do you manage protected variables and masked secrets in GitLab CI, and what are the limitations?" },
      { category: "Infrastructure", difficulty: "hard", question: "How would you scale GitLab Runners using Kubernetes executor for high-throughput pipelines?" },
      { category: "CI/CD", difficulty: "easy", question: "What is the difference between a pipeline trigger by merge request versus by push to a branch?" },
      { category: "Best Practices", difficulty: "medium", question: "How would you implement DAG-based pipelines (needs keyword) to speed up job execution in GitLab CI?" },
    ],
  },
  {
    name: "Jenkins",
    description: "Open-source automation server",
    questions: [
      { category: "Fundamentals", difficulty: "easy", question: "What is the difference between a Freestyle project and a Declarative Pipeline in Jenkins?" },
      { category: "Architecture", difficulty: "medium", question: "Explain the Jenkins master/agent (controller/agent) architecture and how jobs get distributed to agents." },
      { category: "CI/CD", difficulty: "medium", question: "How would you structure a Jenkinsfile to support build, test, and deploy stages with post-build notifications?" },
      { category: "Troubleshooting", difficulty: "medium", question: "A Jenkins pipeline hangs indefinitely on a specific stage. How would you diagnose the cause?" },
      { category: "Security", difficulty: "hard", question: "How would you secure Jenkins credentials and prevent secret leakage into build logs?" },
      { category: "Production", difficulty: "hard", question: "How would you design a highly available Jenkins setup that can tolerate a controller node failure?" },
      { category: "Best Practices", difficulty: "medium", question: "How do you manage Jenkins plugin versioning and upgrades without breaking existing pipelines?" },
      { category: "Infrastructure", difficulty: "medium", question: "How would you configure dynamic build agents using Kubernetes or Docker so Jenkins scales with load?" },
      { category: "CI/CD", difficulty: "easy", question: "What is the purpose of the Jenkinsfile being stored in source control (Pipeline as Code)?" },
      { category: "Best Practices", difficulty: "medium", question: "How would you implement shared libraries in Jenkins to reduce duplication across multiple pipelines?" },
    ],
  },
  {
    name: "Linux",
    description: "Operating system fundamentals",
    questions: [
      { category: "Fundamentals", difficulty: "easy", question: "Explain the difference between a hard link and a symbolic link in Linux." },
      { category: "Troubleshooting", difficulty: "medium", question: "A production server is running out of memory. Walk through the commands you would use to diagnose which process is responsible." },
      { category: "Networking", difficulty: "medium", question: "How would you troubleshoot a service that is not reachable on a given port using tools like netstat, ss, and tcpdump?" },
      { category: "Security", difficulty: "medium", question: "How do file permissions, ownership, and setuid/setgid bits work together to control access on a Linux system?" },
      { category: "Architecture", difficulty: "hard", question: "Explain how the Linux kernel schedules processes and how nice/renice and cgroups influence CPU allocation." },
      { category: "Troubleshooting", difficulty: "hard", question: "A disk is reporting 100% utilization but df shows plenty of free space. What could be causing this and how would you investigate?" },
      { category: "Production", difficulty: "medium", question: "How would you use systemd to manage a custom application as a service, including restart policies?" },
      { category: "Fundamentals", difficulty: "easy", question: "What is the difference between a process and a thread, and how would you list open file descriptors for a process?" },
      { category: "Best Practices", difficulty: "medium", question: "How would you set up log rotation for an application that writes large amounts of log data daily?" },
      { category: "Security", difficulty: "medium", question: "How would you audit and restrict SSH access on a production Linux server?" },
    ],
  },
  {
    name: "AWS",
    description: "Amazon Web Services cloud platform",
    questions: [
      { category: "Fundamentals", difficulty: "easy", question: "Explain the difference between an IAM role and an IAM user, and when you would use each." },
      { category: "Networking", difficulty: "hard", question: "How does routing work between a VPC, a NAT gateway, and an internet gateway for a private subnet needing outbound internet access?" },
      { category: "Architecture", difficulty: "medium", question: "How would you design a highly available multi-AZ architecture for a stateless web application on AWS?" },
      { category: "Security", difficulty: "hard", question: "How would you design least-privilege IAM policies for a team of engineers managing production infrastructure?" },
      { category: "Troubleshooting", difficulty: "medium", question: "An application hosted on EC2 behind an ALB is returning intermittent 502 errors. How would you diagnose the cause?" },
      { category: "Production", difficulty: "medium", question: "How would you design autoscaling for an EC2 fleet handling a variable, spiky traffic pattern?" },
      { category: "Infrastructure", difficulty: "medium", question: "What is the difference between an Application Load Balancer and a Network Load Balancer, and when would you choose each?" },
      { category: "Best Practices", difficulty: "medium", question: "How would you architect a cost-effective S3 storage strategy using lifecycle policies and storage classes?" },
      { category: "Fundamentals", difficulty: "easy", question: "What is the difference between S3, EBS, and EFS storage in AWS, and when would you use each?" },
      { category: "Security", difficulty: "medium", question: "How would you rotate and manage secrets such as database credentials for applications running on AWS?" },
    ],
  },
  {
    name: "Azure",
    description: "Microsoft Azure cloud platform",
    questions: [
      { category: "Fundamentals", difficulty: "easy", question: "Explain the relationship between Azure Subscriptions, Resource Groups, and Management Groups." },
      { category: "Security", difficulty: "medium", question: "How does Azure Active Directory (Entra ID) integrate with role-based access control (RBAC) for resource management?" },
      { category: "Networking", difficulty: "hard", question: "How would you design a hub-and-spoke Virtual Network topology for a multi-team Azure environment with shared services?" },
      { category: "Architecture", difficulty: "medium", question: "What is the difference between Azure App Service, Azure Container Apps, and AKS, and when would you use each?" },
      { category: "Troubleshooting", difficulty: "medium", question: "An Azure Function is timing out intermittently under load. How would you investigate the root cause?" },
      { category: "Production", difficulty: "medium", question: "How would you design a disaster recovery strategy across Azure regions for a critical production workload?" },
      { category: "Best Practices", difficulty: "medium", question: "How would you use Azure Policy and Azure Blueprints to enforce governance across multiple subscriptions?" },
      { category: "Infrastructure", difficulty: "medium", question: "How would you set up private connectivity to an Azure SQL Database using Private Link, avoiding public internet exposure?" },
      { category: "Fundamentals", difficulty: "easy", question: "What is the difference between an Azure Storage Account's Blob, File, Table, and Queue services?" },
      { category: "Security", difficulty: "hard", question: "How would you design secrets management for applications using Azure Key Vault, including access policies and rotation?" },
    ],
  },
  {
    name: "GCP",
    description: "Google Cloud Platform",
    questions: [
      { category: "Fundamentals", difficulty: "easy", question: "What is the difference between a VPC and a subnet in Google Cloud, and how do subnets relate to regions?" },
      { category: "Architecture", difficulty: "medium", question: "How would you design a highly available application architecture using GCE managed instance groups and a load balancer?" },
      { category: "Security", difficulty: "hard", question: "How does GCP IAM's resource hierarchy (Organization, Folder, Project) affect policy inheritance, and how would you design least-privilege access?" },
      { category: "Networking", difficulty: "hard", question: "How would you design a shared VPC setup allowing multiple projects to use centrally managed networking?" },
      { category: "Troubleshooting", difficulty: "medium", question: "A Cloud Run service is returning 500 errors under load but works fine with low traffic. How would you investigate?" },
      { category: "Production", difficulty: "medium", question: "How would you architect a data pipeline using BigQuery for a workload that needs both real-time and batch ingestion?" },
      { category: "Best Practices", difficulty: "medium", question: "How would you control BigQuery query costs in an organization where many teams run ad-hoc analytical queries?" },
      { category: "Infrastructure", difficulty: "medium", question: "What is the difference between GKE Standard and GKE Autopilot, and what tradeoffs come with each?" },
      { category: "Fundamentals", difficulty: "easy", question: "What is the difference between Cloud Run and Cloud Functions, and when would you choose one over the other?" },
      { category: "Security", difficulty: "medium", question: "How would you use Workload Identity Federation to allow a GKE workload to access GCP services without storing service account keys?" },
    ],
  },
];

async function main() {
  console.log("Seeding database...");

  for (const tech of technologies) {
    const technology = await prisma.technology.upsert({
      where: { name: tech.name },
      update: { description: tech.description, active: true },
      create: {
        name: tech.name,
        description: tech.description,
        active: true,
      },
    });

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
    }

    console.log(`  ${tech.name}: ${tech.questions.length} questions`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
