# AWS Marketplace Deployment Guide

This guide covers how to package Shippeasy SaaS for **AWS Marketplace** as an AMI-based product, built and published through **Azure Pipelines**.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [AMI Build with Packer](#ami-build-with-packer)
- [Azure Pipelines — Marketplace Stage](#azure-pipelines--marketplace-stage)
- [CloudFormation Template for Buyers](#cloudformation-template-for-buyers)
- [AWS Marketplace Listing](#aws-marketplace-listing)
- [Post-Launch Checklist](#post-launch-checklist)

---

## Overview

Shippeasy is distributed on AWS Marketplace as a **single-AMI product**. Buyers launch an EC2 instance from the AMI and the application starts automatically via Docker Compose with a systemd service.

**Delivery model**: AMI-based (single instance)

```
AWS Marketplace Listing
         │
         ▼
  Buyer clicks "Subscribe" → launches CloudFormation stack
         │
         ▼
  EC2 instance boots from Shippeasy AMI
         │
         ▼
  systemd starts docker-compose on boot
         │
         ├── MongoDB 6 (local, persistent volume)
         ├── Express API (:3000)
         └── nginx + Angular SPA (:80)
```

---

## Architecture

### AMI Contents

The AMI is built on **Amazon Linux 2023** and contains:

| Component | Details |
|---|---|
| OS | Amazon Linux 2023 (latest) |
| Docker | Docker CE + Docker Compose v2 |
| Application | Pre-built Docker images (backend + frontend) |
| Database | MongoDB 6 (Docker, persistent volume) |
| Config | `/opt/shipeasy/docker-compose.yml`, `.env` template |
| Service | `shipeasy.service` (systemd, starts on boot) |
| Health Check | Exposed at `http://<ip>/health` and `http://<ip>:3000/health` |

### Network Ports

| Port | Service | Required |
|---|---|---|
| 80 | Frontend (nginx) | Yes |
| 443 | HTTPS (TLS termination) | Recommended |
| 3000 | Backend API (internal) | No (proxied by nginx) |
| 22 | SSH (administration) | Optional |

---

## Prerequisites

### AWS Account Setup

1. **AWS Marketplace Seller Account** — register at [AWS Marketplace Management Portal](https://aws.amazon.com/marketplace/management/)
2. **AWS IAM credentials** with permissions for:
   - EC2 (AMI creation, snapshots)
   - S3 (Packer artifacts)
   - CloudFormation (template validation)
3. **Packer** installed in the build agent (or Azure Pipelines agent)

### Azure DevOps Setup

Add these variables to the `shipeasy-secrets` variable group:

| Variable | Description |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM access key for AMI build |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key for AMI build |
| `AWS_MARKETPLACE_REGION` | Target region (e.g., `us-east-1`) |
| `ACR_REGISTRY` | ACR hostname (for pulling images into AMI) |
| `ACR_SP_CLIENT_ID` | ACR service principal for docker login |
| `ACR_SP_CLIENT_SECRET` | ACR service principal secret |

---

## AMI Build with Packer

### Packer Template

Create `infra/packer/shippeasy-ami.pkr.hcl`:

```hcl
packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "acr_registry" {
  type = string
}

variable "acr_username" {
  type = string
}

variable "acr_password" {
  type      = string
  sensitive = true
}

variable "backend_tag" {
  type    = string
  default = "latest"
}

variable "frontend_tag" {
  type    = string
  default = "latest"
}

variable "ami_name_prefix" {
  type    = string
  default = "shippeasy-saas"
}

source "amazon-ebs" "shippeasy" {
  ami_name      = "${var.ami_name_prefix}-{{timestamp}}"
  instance_type = "t3.medium"
  region        = var.aws_region

  source_ami_filter {
    filters = {
      name                = "al2023-ami-*-x86_64"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["amazon"]
  }

  ssh_username = "ec2-user"

  ami_description = "Shippeasy SaaS - Logistics & Freight Management Platform"

  tags = {
    Name        = "Shippeasy SaaS"
    Application = "shippeasy"
    ManagedBy   = "packer"
  }
}

build {
  sources = ["source.amazon-ebs.shippeasy"]

  # Install Docker
  provisioner "shell" {
    inline = [
      "sudo dnf update -y",
      "sudo dnf install -y docker",
      "sudo systemctl enable docker",
      "sudo systemctl start docker",
      "sudo usermod -aG docker ec2-user",

      # Install Docker Compose v2
      "sudo mkdir -p /usr/local/lib/docker/cli-plugins",
      "sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose",
      "sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose",
    ]
  }

  # Copy application files
  provisioner "shell" {
    inline = [
      "sudo mkdir -p /opt/shipeasy",
      "sudo chown ec2-user:ec2-user /opt/shipeasy",
    ]
  }

  provisioner "file" {
    source      = "../../docker-compose.yml"
    destination = "/opt/shipeasy/docker-compose.yml"
  }

  provisioner "file" {
    source      = "../../.env.example"
    destination = "/opt/shipeasy/.env"
  }

  # Pull pre-built images from ACR
  provisioner "shell" {
    inline = [
      "echo '${var.acr_password}' | docker login '${var.acr_registry}' --username '${var.acr_username}' --password-stdin",
      "docker pull ${var.acr_registry}/shipeasy-api:${var.backend_tag}",
      "docker pull ${var.acr_registry}/shipeasy-frontend:${var.frontend_tag}",

      # Re-tag images to match docker-compose.yml defaults
      "docker tag ${var.acr_registry}/shipeasy-api:${var.backend_tag} shipeasy-api:latest",
      "docker tag ${var.acr_registry}/shipeasy-frontend:${var.frontend_tag} shipeasy-frontend:latest",

      # Logout from ACR
      "docker logout ${var.acr_registry} || true",
    ]
  }

  # Create systemd service
  provisioner "shell" {
    inline = [
      "sudo tee /etc/systemd/system/shipeasy.service > /dev/null <<'EOF'",
      "[Unit]",
      "Description=Shippeasy SaaS Platform",
      "After=docker.service",
      "Requires=docker.service",
      "",
      "[Service]",
      "Type=oneshot",
      "RemainAfterExit=yes",
      "WorkingDirectory=/opt/shipeasy",
      "ExecStart=/usr/local/lib/docker/cli-plugins/docker-compose up -d",
      "ExecStop=/usr/local/lib/docker/cli-plugins/docker-compose down",
      "TimeoutStartSec=120",
      "",
      "[Install]",
      "WantedBy=multi-user.target",
      "EOF",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable shipeasy.service",
    ]
  }

  # Clean up
  provisioner "shell" {
    inline = [
      "sudo dnf clean all",
      "sudo rm -rf /tmp/* /var/tmp/*",
      "history -c",
    ]
  }
}
```

### Build Locally

```bash
cd infra/packer
packer init .
packer build \
  -var "acr_registry=your-registry.azurecr.io" \
  -var "acr_username=<sp-client-id>" \
  -var "acr_password=<sp-client-secret>" \
  -var "backend_tag=latest" \
  -var "frontend_tag=latest" \
  shippeasy-ami.pkr.hcl
```

---

## Azure Pipelines — Marketplace Stage

Add this stage to `azure-pipelines.yml` after the `BuildPush` stage to automate AMI creation:

```yaml
# ══════════════════════════════════════════════════════════════════
# Stage — Build AWS Marketplace AMI
# Runs after images are pushed to ACR. Builds an AMI with Packer.
# ══════════════════════════════════════════════════════════════════
- stage: BuildAMI
  displayName: Build AWS Marketplace AMI
  dependsOn:
    - BuildPush
  condition: and(succeeded(), eq(variables['IS_MAIN_PUSH'], 'true'))
  variables:
    backendTag:  $[stageDependencies.BuildPush.BuildBackend.outputs['exportTag.backendTag']]
    frontendTag: $[stageDependencies.BuildPush.BuildFrontend.outputs['exportTag.frontendTag']]
  jobs:
    - job: PackerBuild
      displayName: Packer → AMI
      pool:
        vmImage: ubuntu-latest
      steps:
        - task: PackerTool@0
          displayName: Install Packer
          inputs:
            version: "latest"

        - script: |
            cd infra/packer
            packer init .
            packer build \
              -var "aws_region=$(AWS_MARKETPLACE_REGION)" \
              -var "acr_registry=$(ACR_NAME).azurecr.io" \
              -var "acr_username=$(ACR_SP_CLIENT_ID)" \
              -var "acr_password=$(ACR_SP_CLIENT_SECRET)" \
              -var "backend_tag=${backendTag:-latest}" \
              -var "frontend_tag=${frontendTag:-latest}" \
              shippeasy-ami.pkr.hcl
          displayName: Build AMI with Packer
          env:
            AWS_ACCESS_KEY_ID: $(AWS_ACCESS_KEY_ID)
            AWS_SECRET_ACCESS_KEY: $(AWS_SECRET_ACCESS_KEY)
            AWS_DEFAULT_REGION: $(AWS_MARKETPLACE_REGION)
```

### Pipeline Flow with Marketplace

```
Push to main
     │
     ▼
DetectChanges → Test → Build & Push (ACR)
                              │
                    ┌─────────┼──────────┐
                    ▼         ▼          ▼
              Deploy      Deploy      Build AMI
              Staging     Production  (Packer)
                                        │
                                        ▼
                                  AWS Marketplace
                                  (manual submit)
```

---

## CloudFormation Template for Buyers

Create `infra/cloudformation/shippeasy-marketplace.yaml` and submit it with the AMI listing:

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Description: >
  Shippeasy SaaS — Logistics & Freight Management Platform.
  Launches a single EC2 instance with the Shippeasy application.

Parameters:
  InstanceType:
    Type: String
    Default: t3.medium
    AllowedValues:
      - t3.medium
      - t3.large
      - t3.xlarge
      - m5.large
      - m5.xlarge
    Description: EC2 instance type

  KeyPairName:
    Type: AWS::EC2::KeyPair::KeyName
    Description: SSH key pair for instance access

  VpcId:
    Type: AWS::EC2::VPC::Id
    Description: VPC to launch the instance in

  SubnetId:
    Type: AWS::EC2::Subnet::Id
    Description: Subnet to launch the instance in

  JWTSecret:
    Type: String
    NoEcho: true
    MinLength: 16
    Description: JWT signing secret (minimum 16 characters)

Mappings:
  RegionAMI:
    us-east-1:
      AMI: ami-PLACEHOLDER    # Replace with actual AMI ID after Packer build
    us-west-2:
      AMI: ami-PLACEHOLDER
    eu-west-1:
      AMI: ami-PLACEHOLDER
    ap-south-1:
      AMI: ami-PLACEHOLDER

Resources:
  SecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Shippeasy SaaS Security Group
      VpcId: !Ref VpcId
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 80
          ToPort: 80
          CidrIp: 0.0.0.0/0
          Description: HTTP
        - IpProtocol: tcp
          FromPort: 443
          ToPort: 443
          CidrIp: 0.0.0.0/0
          Description: HTTPS
        - IpProtocol: tcp
          FromPort: 22
          ToPort: 22
          CidrIp: 0.0.0.0/0
          Description: SSH (restrict in production)

  Instance:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: !FindInMap [RegionAMI, !Ref "AWS::Region", AMI]
      InstanceType: !Ref InstanceType
      KeyName: !Ref KeyPairName
      SubnetId: !Ref SubnetId
      SecurityGroupIds:
        - !Ref SecurityGroup
      BlockDeviceMappings:
        - DeviceName: /dev/xvda
          Ebs:
            VolumeSize: 50
            VolumeType: gp3
            Encrypted: true
      UserData:
        Fn::Base64: !Sub |
          #!/bin/bash
          set -euo pipefail

          # Write production environment variables
          cat > /opt/shipeasy/.env <<'ENVEOF'
          NODE_ENV=production
          FRONTEND_PORT=80
          BACKEND_PORT=3000
          MONGO_DB_NAME=shipeasy
          SECRET_KEY_JWT=${JWTSecret}
          CORS_ORIGINS=http://localhost
          FRONTEND_URL=http://localhost
          ENABLE_SWAGGER=false
          ENCRYPTION=false
          LOG_LEVEL=info
          BACKEND_URL=http://backend:3000
          API_URL=/api
          API_URL_MASTER=/api/
          SOCKET_URL=
          BACKEND_IMAGE=shipeasy-api
          FRONTEND_IMAGE=shipeasy-frontend
          BACKEND_TAG=latest
          FRONTEND_TAG=latest
          ENVEOF

          # Start the application
          systemctl start shipeasy
      Tags:
        - Key: Name
          Value: Shippeasy-SaaS

Outputs:
  InstanceId:
    Description: EC2 Instance ID
    Value: !Ref Instance

  PublicIP:
    Description: Public IP address
    Value: !GetAtt Instance.PublicIp

  ApplicationURL:
    Description: Shippeasy application URL
    Value: !Sub "http://${Instance.PublicIp}"

  APIURL:
    Description: Backend API URL (proxied through nginx)
    Value: !Sub "http://${Instance.PublicIp}/api/"

  HealthCheckURL:
    Description: Health check endpoint
    Value: !Sub "http://${Instance.PublicIp}/health"
```

---

## AWS Marketplace Listing

### Listing Details

| Field | Value |
|---|---|
| **Product Title** | Shippeasy SaaS — Logistics & Freight Management |
| **Short Description** | Multi-tenant SaaS platform for freight forwarding, shipping, and warehouse management |
| **Category** | Business Applications > Supply Chain Management |
| **Delivery Method** | Amazon Machine Image (AMI) |
| **OS** | Amazon Linux 2023 |
| **Recommended Instance** | t3.medium (2 vCPU, 4 GB RAM) |
| **Minimum Instance** | t3.medium |
| **Minimum Disk** | 50 GB gp3 |

### Pricing Model Options

| Model | Description |
|---|---|
| **Free Tier** | Single-user, limited features |
| **Hourly** | Pay-as-you-go based on EC2 instance hours |
| **Annual** | Discounted annual subscription |
| **BYOL** | Bring Your Own License (contact sales) |

### Submission Checklist

- [ ] AMI passes AWS Marketplace security scan (no hardcoded credentials, no open ports except 80/443/22)
- [ ] AMI uses encrypted EBS volumes
- [ ] Application starts automatically on boot (systemd service)
- [ ] Health check endpoint responds (`/health`)
- [ ] CloudFormation template validated (`aws cloudformation validate-template`)
- [ ] Product logo uploaded (120×120 and 300×300)
- [ ] Usage instructions documented
- [ ] Support contact and EULA provided
- [ ] AMI shared to AWS Marketplace account (`679593333241`)

---

## Post-Launch Checklist

### For Marketplace Sellers

1. **Monitor** AWS Marketplace reports for subscriber count and revenue
2. **Automate AMI updates** — run the Packer pipeline on each release
3. **Submit updated AMIs** via the Marketplace Management Portal
4. **Version management** — include version in AMI name (e.g., `shippeasy-saas-v1.2.0-20260306`)

### For Buyers (Post-Launch Setup)

1. **Access the application** at `http://<instance-public-ip>`
2. **SSH into the instance** to configure advanced settings:
   ```bash
   ssh -i your-key.pem ec2-user@<instance-public-ip>
   cd /opt/shipeasy
   sudo nano .env      # edit JWT secret, CORS origins, etc.
   sudo systemctl restart shipeasy
   ```
3. **Set up TLS** using Certbot or an ALB with ACM certificate
4. **Configure backups** using the included MongoDB backup script:
   ```bash
   /opt/shipeasy/scripts/backup-mongo.sh
   ```
5. **Monitor health** at `http://<instance-public-ip>/health`
