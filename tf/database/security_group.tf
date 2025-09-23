resource "aws_security_group" "rds_sg" {
  name        = "rds-sg"
  description = "Allow ECS tasks to access Postgres"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
