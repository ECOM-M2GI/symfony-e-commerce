# CloudWatch Log Groups for the application
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${var.project_name}-${var.environment}/backend"
  retention_in_days = var.log_retention_days

  tags = {
    Name      = "${var.project_name}-backend-logs"
    Component = "backend"
    Service   = "ecs"
  }
}

resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/ecs/${var.project_name}-${var.environment}/frontend"
  retention_in_days = var.log_retention_days

  tags = {
    Name      = "${var.project_name}-frontend-logs"
    Component = "frontend"
    Service   = "ecs"
  }
}

# CloudWatch Log Group for Application Load Balancer
resource "aws_cloudwatch_log_group" "alb" {
  name              = "/aws/applicationloadbalancer/${var.project_name}-${var.environment}"
  retention_in_days = var.log_retention_days

  tags = {
    Name      = "${var.project_name}-alb-logs"
    Component = "alb"
    Service   = "load-balancer"
  }
}

# CloudWatch Log Group for VPC Flow Logs (optional but recommended for security)
resource "aws_cloudwatch_log_group" "vpc_flow_logs" {
  name              = "/aws/vpc/flowlogs/${var.project_name}-${var.environment}"
  retention_in_days = var.log_retention_days

  tags = {
    Name      = "${var.project_name}-vpc-flow-logs"
    Component = "vpc"
    Service   = "networking"
  }
}
