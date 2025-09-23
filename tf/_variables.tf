variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "region" {
  description = "AWS region"
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
