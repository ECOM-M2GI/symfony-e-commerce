#scaling
resource "aws_appautoscaling_target" "backend" {
  max_capacity       = 20
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.backend.name}/${aws_ecs_service.backend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# CPU Utilization Scaling Policy
resource "aws_appautoscaling_policy" "backend_cpu" {
  name               = "${var.project_name}-backend-scaling-policy-cpu"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.backend.resource_id
  scalable_dimension = aws_appautoscaling_target.backend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.backend.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    scale_in_cooldown  = 30
    scale_out_cooldown = 15
    target_value       = 40
  }
}

resource "aws_appautoscaling_policy" "backend_mem" {
  name               = "${var.project_name}-backend-scaling-policy-mem"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.backend.resource_id
  scalable_dimension = aws_appautoscaling_target.backend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.backend.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    scale_in_cooldown  = 30
    scale_out_cooldown = 15
    target_value       = 50
  }
}

# Add ALB Request Count Based Scaling for faster response to traffic spikes
resource "aws_appautoscaling_policy" "backend_request_count" {
  name               = "${var.project_name}-backend-scaling-policy-requests"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.backend.resource_id
  scalable_dimension = aws_appautoscaling_target.backend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.backend.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ALBRequestCountPerTarget"
      resource_label         = "${aws_lb.backend.arn_suffix}/${aws_lb_target_group.backend.arn_suffix}"
    }
    scale_in_cooldown  = 30
    scale_out_cooldown = 15
    target_value       = 50
  }
}

# Add Step Scaling Policy for extreme load situations
resource "aws_appautoscaling_policy" "backend_cpu_step" {
  name               = "${var.project_name}-backend-step-scaling-cpu"
  policy_type        = "StepScaling"
  resource_id        = aws_appautoscaling_target.backend.resource_id
  scalable_dimension = aws_appautoscaling_target.backend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.backend.service_namespace

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown                = 60
    metric_aggregation_type = "Average"

    step_adjustment {
      metric_interval_lower_bound = 0
      metric_interval_upper_bound = 20
      scaling_adjustment          = 2
    }

    # Very high CPU - add 4 tasks
    step_adjustment {
      metric_interval_lower_bound = 20
      scaling_adjustment          = 4
    }
  }
}

# NEW: Step Scaling Policy for scale-in when CPU is very low
resource "aws_appautoscaling_policy" "backend_cpu_step_in" {
  name               = "${var.project_name}-backend-step-scaling-cpu-in"
  policy_type        = "StepScaling"
  resource_id        = aws_appautoscaling_target.backend.resource_id
  scalable_dimension = aws_appautoscaling_target.backend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.backend.service_namespace

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown                = 60
    metric_aggregation_type = "Average"

    # Very low CPU - remove 1 task
    step_adjustment {
      metric_interval_upper_bound = 0
      scaling_adjustment          = -1
    }
  }
}
