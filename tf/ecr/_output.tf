output "backend_repo_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "backend_repo_id" {
  value = aws_ecr_repository.backend.registry_id
}

output "backend_repo_name" {
  value = aws_ecr_repository.backend.name
}
