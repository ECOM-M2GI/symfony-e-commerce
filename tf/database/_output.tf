output "username" {
  value = aws_db_instance.postgres.username
}

output "address" {
  value = aws_db_instance.postgres.address
}

output "name" {
  value = aws_db_instance.postgres.db_name
}

output "password_secret_arn" {
  value = aws_secretsmanager_secret.db_credentials.arn
}

output "port" {
  value = aws_db_instance.postgres.port
}

output "security_group_id" {
  value = aws_security_group.rds_sg.id
}
