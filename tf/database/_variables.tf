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

variable "db_subnet_group_name" {
  description = "The name of the DB subnet group"
  type        = string
}

variable "private_subnets_ids" {
  description = "List of private subnet IDs"
  type        = list(string)
}

variable "environment" {
  description = "Environment name"
  type        = string
}
