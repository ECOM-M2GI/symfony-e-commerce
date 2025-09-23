resource "aws_secretsmanager_secret" "django_secret" {
  name        = "${var.project_name}/django_secret_key"
  description = "Django secret key for ${var.project_name}"
}

resource "aws_secretsmanager_secret_version" "django_secret" {
  secret_id     = aws_secretsmanager_secret.django_secret.id
  secret_string = random_password.django_secret.result
}

resource "random_password" "django_secret" {
  length  = 65
  special = true
  upper   = true
  lower   = true
}
