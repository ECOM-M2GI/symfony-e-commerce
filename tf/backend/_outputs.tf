output "alb_dns_name" {
  description = "DNS name of the load balancer"
  value       = aws_lb.backend.dns_name
}

output "alb_zone_id" {
  description = "Zone ID of the load balancer"
  value       = aws_lb.backend.zone_id
}

output "target_group_arn" {
  description = "ARN of the target group"
  value       = aws_lb_target_group.backend.arn
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name for HTTPS API access"
  value       = aws_cloudfront_distribution.backend_api.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.backend_api.id
}

output "api_https_url" {
  description = "HTTPS URL for accessing the API through CloudFront"
  value       = "https://${aws_cloudfront_distribution.backend_api.domain_name}"
}
