# ══════════════════════════════════════════════════════════════════
# Shippeasy SaaS — Packer AMI template for AWS Marketplace
#
# Builds an Amazon Linux 2023 AMI with Docker, Docker Compose,
# and pre-pulled Shippeasy images. Application auto-starts via
# systemd on instance boot.
#
# Usage:
#   cd infra/packer
#   packer init .
#   packer build \
#     -var "acr_registry=your-registry.azurecr.io" \
#     -var "acr_username=<sp-client-id>" \
#     -var "acr_password=<sp-client-secret>" \
#     shippeasy-ami.pkr.hcl
# ══════════════════════════════════════════════════════════════════

packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

# ── Variables ─────────────────────────────────────────────────────

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "acr_registry" {
  type        = string
  description = "ACR hostname, e.g. yourname.azurecr.io"
}

variable "acr_username" {
  type        = string
  description = "ACR service principal client ID"
}

variable "acr_password" {
  type        = string
  sensitive   = true
  description = "ACR service principal client secret"
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

# ── Source ─────────────────────────────────────────────────────────

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

  # Encrypt the root volume for AWS Marketplace compliance
  launch_block_device_mappings {
    device_name           = "/dev/xvda"
    volume_size           = 50
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }
}

# ── Build ──────────────────────────────────────────────────────────

build {
  sources = ["source.amazon-ebs.shippeasy"]

  # 1. Install Docker + Compose
  provisioner "shell" {
    inline = [
      "sudo dnf update -y",
      "sudo dnf install -y docker",
      "sudo systemctl enable docker",
      "sudo systemctl start docker",
      "sudo usermod -aG docker ec2-user",

      # Docker Compose v2 plugin
      "sudo mkdir -p /usr/local/lib/docker/cli-plugins",
      "sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose",
      "sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose",
    ]
  }

  # 2. Create application directory
  provisioner "shell" {
    inline = [
      "sudo mkdir -p /opt/shipeasy/scripts",
      "sudo chown -R ec2-user:ec2-user /opt/shipeasy",
    ]
  }

  # 3. Copy Docker Compose file
  provisioner "file" {
    source      = "../../docker-compose.yml"
    destination = "/opt/shipeasy/docker-compose.yml"
  }

  # 4. Copy default environment file
  provisioner "file" {
    source      = "../../.env.example"
    destination = "/opt/shipeasy/.env"
  }

  # 5. Pull pre-built images from ACR and re-tag for local use
  provisioner "shell" {
    inline = [
      "echo '${var.acr_password}' | docker login '${var.acr_registry}' --username '${var.acr_username}' --password-stdin",

      "docker pull ${var.acr_registry}/shipeasy-api:${var.backend_tag}",
      "docker pull ${var.acr_registry}/shipeasy-frontend:${var.frontend_tag}",

      # Re-tag to match docker-compose.yml defaults (shipeasy-api:latest, shipeasy-frontend:latest)
      "docker tag ${var.acr_registry}/shipeasy-api:${var.backend_tag} shipeasy-api:latest",
      "docker tag ${var.acr_registry}/shipeasy-frontend:${var.frontend_tag} shipeasy-frontend:latest",

      # Remove ACR-tagged images (keep only local tags)
      "docker rmi ${var.acr_registry}/shipeasy-api:${var.backend_tag} || true",
      "docker rmi ${var.acr_registry}/shipeasy-frontend:${var.frontend_tag} || true",

      "docker logout '${var.acr_registry}' || true",
    ]
  }

  # 6. Pull MongoDB image
  provisioner "shell" {
    inline = [
      "docker pull mongo:6",
    ]
  }

  # 7. Create systemd service for auto-start on boot
  provisioner "shell" {
    inline = [
      <<-EOF
      sudo tee /etc/systemd/system/shipeasy.service > /dev/null <<'UNIT'
      [Unit]
      Description=Shippeasy SaaS Platform
      After=docker.service
      Requires=docker.service

      [Service]
      Type=oneshot
      RemainAfterExit=yes
      WorkingDirectory=/opt/shipeasy
      ExecStart=/usr/bin/docker compose up -d
      ExecStop=/usr/bin/docker compose down
      TimeoutStartSec=120

      [Install]
      WantedBy=multi-user.target
      UNIT
      EOF
      ,
      "sudo systemctl daemon-reload",
      "sudo systemctl enable shipeasy.service",
    ]
  }

  # 8. Clean up for AMI security scan
  provisioner "shell" {
    inline = [
      "sudo dnf clean all",
      "sudo rm -rf /tmp/* /var/tmp/*",
      "sudo rm -rf /root/.docker/config.json",
      "rm -rf ~/.docker/config.json",
      "history -c",
    ]
  }
}
