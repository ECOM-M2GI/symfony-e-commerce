resource "aws_security_group" "backend" {
  name        = "${var.project_name}-backend-sg"
  description = "Allows access to the backend"
  vpc_id      = var.vpc_id

  # ingress {
  #   from_port = 0
  #   to_port   = 8000 # convert to 80 later with ALB
  #   protocol  = "tcp"
  #   cidr_blocks = ["0.0.0.0/0"]
  # }

  ingress {
    description = "Debug temp Allow All"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Debug temp Allow All"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group_rule" "allow_backend_to_db" {
  description              = "Allow backend to access Postgres"
  from_port                = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.backend.id
  security_group_id        = var.db_security_group_id
  to_port                  = 5432
  type                     = "ingress"
}
