resource "aws_db_instance" "postgres" {
  identifier              = "${var.project_name}-${var.environment}-postgres"
  engine                  = "postgres"
  engine_version          = "17.4"
  instance_class          = "db.t4g.micro" # locked by free tier
  allocated_storage       = 20
  storage_type            = "gp2"
  username                = "${var.project_name}_admin"
  password                = random_password.db_password.result
  db_subnet_group_name    = var.db_subnet_group_name
  publicly_accessible     = false
  vpc_security_group_ids  = [aws_security_group.rds_sg.id]
  skip_final_snapshot     = true
  backup_retention_period = 7
  multi_az                = false
  db_name                 = "${var.project_name}_db"
}
