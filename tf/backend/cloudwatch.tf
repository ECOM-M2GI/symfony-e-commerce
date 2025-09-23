# CloudWatch Alarms for Better Monitoring and Scaling

# High CPU Alarm for Step Scaling
resource "aws_cloudwatch_metric_alarm" "backend_cpu_high" {
  alarm_name          = "${var.project_name}-backend-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "10"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ECS service CPU utilization for step scaling"
  alarm_actions       = [aws_appautoscaling_policy.backend_cpu_step.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    ServiceName = aws_ecs_service.backend.name
    ClusterName = aws_ecs_cluster.backend.name
  }

  tags = {
    Environment = var.environment
    Service     = "backend"
    Project     = var.project_name
  }
}

resource "aws_cloudwatch_metric_alarm" "backend_cpu_low" {
  alarm_name          = "${var.project_name}-backend-cpu-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "5"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = "20"
  alarm_description   = "This metric monitors ECS service CPU utilization for step scaling in"
  alarm_actions       = [aws_appautoscaling_policy.backend_cpu_step_in.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    ServiceName = aws_ecs_service.backend.name
    ClusterName = aws_ecs_cluster.backend.name
  }

  tags = {
    Environment = var.environment
    Service     = "backend"
    Project     = var.project_name
  }
}

# ALB Response Time Alarm - Updated threshold
resource "aws_cloudwatch_metric_alarm" "backend_response_time" {
  alarm_name          = "${var.project_name}-backend-response-time-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "3"
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = "60"
  statistic           = "Average"
  threshold           = "2" # 2 seconds
  alarm_description   = "This metric monitors ALB response time"
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = aws_lb.backend.arn_suffix
  }

  tags = {
    Environment = var.environment
    Service     = "backend"
    Project     = var.project_name
  }
}

# ALB 5xx Error Rate Alarm
resource "aws_cloudwatch_metric_alarm" "backend_5xx_errors" {
  alarm_name          = "${var.project_name}-backend-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = "60"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "This metric monitors 5xx errors from backend"
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = aws_lb.backend.arn_suffix
  }

  tags = {
    Environment = var.environment
    Service     = "backend"
    Project     = var.project_name
  }
}

# ECS Service Task Count for Monitoring
resource "aws_cloudwatch_metric_alarm" "backend_task_count_low" {
  alarm_name          = "${var.project_name}-backend-task-count-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "RunningTaskCount"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = "2"
  alarm_description   = "This metric monitors if ECS service has minimum tasks running"

  dimensions = {
    ServiceName = aws_ecs_service.backend.name
    ClusterName = aws_ecs_cluster.backend.name
  }

  tags = {
    Environment = var.environment
    Service     = "backend"
    Project     = var.project_name
  }
}

resource "aws_cloudwatch_metric_alarm" "backend_request_count_high" {
  alarm_name          = "${var.project_name}-backend-request-count-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "RequestCountPerTarget"
  namespace           = "AWS/ApplicationELB"
  period              = "60"
  statistic           = "Average"
  threshold           = "200"
  alarm_description   = "This metric monitors high request count for immediate scaling"
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = aws_lb.backend.arn_suffix
    TargetGroup  = aws_lb_target_group.backend.arn_suffix
  }

  tags = {
    Environment = var.environment
    Service     = "backend"
    Project     = var.project_name
  }
}
