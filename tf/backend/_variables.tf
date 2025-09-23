variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "vpc_id" {
  description = "The ID of the VPC where resources will be deployed"
  type        = string
}

variable "private_subnets" {
  description = "List of private subnet IDs"
  type        = list(string)
}

variable "public_subnets" {
  description = "List of public subnet IDs"
  type        = list(string)
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "backend_log_group_name" {
  description = "Name of the CloudWatch log group for backend"
  type        = string
}

variable "db_host" {
  description = "Database host"
  type        = string
}

variable "db_port" {
  description = "Database port"
  type        = string
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "db_username" {
  description = "Database username"
  type        = string
}

variable "db_password_secret_arn" {
  description = "ARN of the Secrets Manager secret for database password"
  type        = string
}

variable "db_security_group_id" {
  description = "Security group ID for the database"
  type        = string
}

variable "media_bucket_name" {
  description = "S3 Bucket name for backend files"
  type        = string
}

variable "s3_cloudfront_domain" {
  description = "CloudFront domain name for S3 bucket"
  type        = string
}

variable "stripe_secret_key" {
  description = "Stripe secret key for payment processing"
  type        = string
}
variable "stripe_webhook_secret" {
  description = "Stripe webhook secret for validating webhooks"
  type        = string
}

variable "frontend_address" {
  description = "Frontend application address"
  type        = string
}
