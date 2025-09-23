output "backend_repo_url" {
  value = module.ecr.backend_repo_url
}

output "frontend_s3_bucket_name" {
  value = module.frontend.frontend_s3_bucket_name
}

output "cloudfront_distribution_id" {
  value = module.frontend.cloudfront_distribution_id
}

output "frontend_domain_name" {
  value = module.frontend.domain_name
}

output "backend_bucket_name" {
  description = "The name of the S3 bucket"
  value       = module.backend_files.bucket_name
}

output "backend_cloudfront_domain_name" {
  description = "The domain name of the CloudFront distribution"
  value       = module.backend_files.cloudfront_domain_name
}

output "backend_api_url" {
  description = "The HTTPS URL of the backend API via CloudFront"
  value       = module.backend.api_https_url
}
