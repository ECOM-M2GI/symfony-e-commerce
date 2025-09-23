resource "random_password" "db_password" {
  length  = 20
  special = true
}

resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "${var.project_name}-rds-credentials"
  description             = "RDS Postgres credentials"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "db_credentials_version" {
  secret_id     = aws_secretsmanager_secret.db_credentials.id
  secret_string = random_password.db_password.result
  # secret_string = jsonencode({
  #   username = aws_db_instance.postgres.username
  #   password = random_password.db_password.result
  #   dbname   = aws_db_instance.postgres.db_name
  #   host     = aws_db_instance.postgres.address
  #   port     = aws_db_instance.postgres.port
  # })
}
