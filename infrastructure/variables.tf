variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "database_name" {
  description = "Database name"
  type        = string
  default     = "rentiful_db"
}

variable "database_username" {
  description = "Database username"
  type        = string
  default     = "rentiful_user"
}

variable "database_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "database_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "s3_bucket_name" {
  description = "S3 bucket name for file storage"
  type        = string
  default     = "rentiful-files"
}

variable "cognito_user_pool_name" {
  description = "Cognito user pool name"
  type        = string
  default     = "rentiful-users"
}

variable "ec2_instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "ec2_key_name" {
  description = "EC2 key pair name"
  type        = string
}

variable "ec2_ami_id" {
  description = "EC2 AMI ID"
  type        = string
  default     = "ami-0c02fb55956c7d323" # Amazon Linux 2
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "rentiful.com"
}

variable "stripe_secret_key" {
  description = "Stripe secret key"
  type        = string
  sensitive   = true
}

variable "stripe_publishable_key" {
  description = "Stripe publishable key"
  type        = string
}

variable "mapbox_access_token" {
  description = "Mapbox access token"
  type        = string
}

variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}

variable "sentry_dsn" {
  description = "Sentry DSN for error tracking"
  type        = string
  default     = ""
}

variable "google_analytics_id" {
  description = "Google Analytics ID"
  type        = string
  default     = ""
} 