output "backend_log_group_name" {
  description = "Name of the backend CloudWatch log group"
  value       = aws_cloudwatch_log_group.backend.name
}

output "backend_log_group_arn" {
  description = "ARN of the backend CloudWatch log group"
  value       = aws_cloudwatch_log_group.backend.arn
}

output "frontend_log_group_name" {
  description = "Name of the frontend CloudWatch log group"
  value       = aws_cloudwatch_log_group.frontend.name
}

output "frontend_log_group_arn" {
  description = "ARN of the frontend CloudWatch log group"
  value       = aws_cloudwatch_log_group.frontend.arn
}

output "alb_log_group_name" {
  description = "Name of the ALB CloudWatch log group"
  value       = aws_cloudwatch_log_group.alb.name
}

output "alb_log_group_arn" {
  description = "ARN of the ALB CloudWatch log group"
  value       = aws_cloudwatch_log_group.alb.arn
}

output "vpc_flow_logs_group_name" {
  description = "Name of the VPC flow logs CloudWatch log group"
  value       = aws_cloudwatch_log_group.vpc_flow_logs.name
}

output "vpc_flow_logs_group_arn" {
  description = "ARN of the VPC flow logs CloudWatch log group"
  value       = aws_cloudwatch_log_group.vpc_flow_logs.arn
}
