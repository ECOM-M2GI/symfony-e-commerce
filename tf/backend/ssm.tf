data "aws_secretsmanager_secret_version" "db_pass" {
  secret_id = var.db_password_secret_arn
}
