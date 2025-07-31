terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "rentiful-terraform-state"
    key    = "infrastructure/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "Rentiful"
      Environment = var.environment
      ManagedBy   = "Terraform"
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

# RDS Database
module "rds" {
  source = "./modules/rds"
  
  environment     = var.environment
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.private_subnet_ids
  db_name        = var.database_name
  db_username    = var.database_username
  db_password    = var.database_password
  instance_class = var.database_instance_class
}

# S3 Bucket for file storage
module "s3" {
  source = "./modules/s3"
  
  environment = var.environment
  bucket_name = var.s3_bucket_name
}

# Cognito User Pool
module "cognito" {
  source = "./modules/cognito"
  
  environment = var.environment
  user_pool_name = var.cognito_user_pool_name
}

# EC2 Instance for API
module "ec2" {
  source = "./modules/ec2"
  
  environment     = var.environment
  vpc_id         = module.vpc.vpc_id
  subnet_id      = module.vpc.public_subnet_ids[0]
  instance_type  = var.ec2_instance_type
  key_name       = var.ec2_key_name
  ami_id         = var.ec2_ami_id
}

# Application Load Balancer
module "alb" {
  source = "./modules/alb"
  
  environment = var.environment
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.public_subnet_ids
}

# CloudFront Distribution
module "cloudfront" {
  source = "./modules/cloudfront"
  
  environment = var.environment
  domain_name = var.domain_name
  s3_bucket_id = module.s3.bucket_id
}

# Route53 DNS
module "route53" {
  source = "./modules/route53"
  
  environment = var.environment
  domain_name = var.domain_name
  alb_dns_name = module.alb.alb_dns_name
  cloudfront_domain_name = module.cloudfront.cloudfront_domain_name
}

# CloudWatch Logs
module "cloudwatch" {
  source = "./modules/cloudwatch"
  
  environment = var.environment
}

# IAM Roles and Policies
module "iam" {
  source = "./modules/iam"
  
  environment = var.environment
  s3_bucket_arn = module.s3.bucket_arn
  rds_arn       = module.rds.db_arn
} 