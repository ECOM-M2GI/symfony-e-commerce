resource "aws_ecs_service" "backend" {
  # provider = aws.admin
  name                   = "${var.project_name}-backend-service"
  cluster                = aws_ecs_cluster.backend.id
  task_definition        = aws_ecs_task_definition.backend.arn
  desired_count          = 2
  launch_type            = "FARGATE"
  enable_execute_command = true
  platform_version       = "LATEST"

  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 75
  # Optimize deployment configuration

  network_configuration {
    subnets          = var.public_subnets
    security_groups  = [aws_security_group.backend.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 8000
  }

  # Enable service discovery and health check grace period
  health_check_grace_period_seconds = 60

  # load_balancer {
  #   target_group_arn = aws_lb_target_group.mqtt.arn
  #   container_name   = "mqtt-replicant"
  #   container_port   = 8000
  # }

  # do not override desired count when applying if the cluster is scaled up
  lifecycle {
    ignore_changes = [desired_count]
  }

  # Add service tags for better monitoring
  tags = {
    Environment = var.environment
    Service     = "backend"
    Project     = var.project_name
  }
}
