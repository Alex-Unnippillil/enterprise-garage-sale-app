terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "your-terraform-state-bucket"
    key    = "enterprise-real-estate/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "enterprise-real-estate"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# VPC and Networking
module "vpc" {
  source = "./modules/vpc"
  
  environment = var.environment
  vpc_cidr    = var.vpc_cidr
  azs         = var.availability_zones
}

# Security Groups
module "security_groups" {
  source = "./modules/security_groups"
  
  vpc_id = module.vpc.vpc_id
  environment = var.environment
}

# RDS Database
module "rds" {
  source = "./modules/rds"
  
  environment     = var.environment
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.private_subnet_ids
  security_group_ids = [module.security_groups.rds_security_group_id]
  
  db_name     = var.database_name
  db_username = var.database_username
  db_password = var.database_password
  db_instance_class = var.database_instance_class
}

# S3 Buckets
module "s3" {
  source = "./modules/s3"
  
  environment = var.environment
  bucket_names = {
    "property-images" = "property-images-${var.environment}"
    "documents"       = "documents-${var.environment}"
    "backups"         = "backups-${var.environment}"
  }
}

# Cognito User Pool
module "cognito" {
  source = "./modules/cognito"
  
  environment = var.environment
  user_pool_name = "real-estate-users-${var.environment}"
}

# EC2 Instance for Backend
module "ec2" {
  source = "./modules/ec2"
  
  environment = var.environment
  vpc_id     = module.vpc.vpc_id
  subnet_id  = module.vpc.public_subnet_ids[0]
  security_group_ids = [module.security_groups.ec2_security_group_id]
  
  instance_type = var.ec2_instance_type
  key_name      = var.ec2_key_name
}

# Application Load Balancer
module "alb" {
  source = "./modules/alb"
  
  environment = var.environment
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.public_subnet_ids
  security_group_ids = [module.security_groups.alb_security_group_id]
  
  target_id = module.ec2.instance_id
}

# CloudFront Distribution
module "cloudfront" {
  source = "./modules/cloudfront"
  
  environment = var.environment
  domain_name = var.domain_name
  s3_bucket_id = module.s3.bucket_ids["property-images"]
}

# Route 53
module "route53" {
  source = "./modules/route53"
  
  environment = var.environment
  domain_name = var.domain_name
  alb_dns_name = module.alb.dns_name
  cloudfront_domain_name = module.cloudfront.domain_name
}

# CloudWatch Logs
module "cloudwatch" {
  source = "./modules/cloudwatch"
  
  environment = var.environment
  log_group_names = [
    "application-logs-${var.environment}",
    "error-logs-${var.environment}",
    "access-logs-${var.environment}"
  ]
}

# IAM Roles and Policies
module "iam" {
  source = "./modules/iam"
  
  environment = var.environment
  s3_bucket_arns = values(module.s3.bucket_arns)
  rds_cluster_arn = module.rds.cluster_arn
}

# Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "rds_endpoint" {
  description = "RDS cluster endpoint"
  value       = module.rds.endpoint
  sensitive   = true
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = module.cognito.user_pool_id
}

output "cognito_client_id" {
  description = "Cognito App Client ID"
  value       = module.cognito.client_id
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = module.alb.dns_name
}

output "ec2_public_ip" {
  description = "EC2 instance public IP"
  value       = module.ec2.public_ip
}

output "s3_bucket_names" {
  description = "S3 bucket names"
  value       = module.s3.bucket_names
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = module.cloudfront.domain_name
} 