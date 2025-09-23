# resource "aws_appautoscaling_scheduled_action" "scale_up_business_hours" {
#   name               = "${var.project_name}-scale-up-business-hours"
#   service_namespace  = aws_appautoscaling_target.backend.service_namespace
#   resource_id        = aws_appautoscaling_target.backend.resource_id
#   scalable_dimension = aws_appautoscaling_target.backend.scalable_dimension
#
#   schedule = "cron(0 8 * * MON-FRI *)"  # 8 AM UTC Monday-Friday
#
#   scalable_target_action {
#     min_capacity = 2   # Scale to minimum 2 instances during day
#     max_capacity = 20
#   }
# }
#
# resource "aws_appautoscaling_scheduled_action" "scale_down_off_hours" {
#   name               = "${var.project_name}-scale-down-off-hours"
#   service_namespace  = aws_appautoscaling_target.backend.service_namespace
#   resource_id        = aws_appautoscaling_target.backend.resource_id
#   scalable_dimension = aws_appautoscaling_target.backend.scalable_dimension
#
#   schedule = "cron(0 23 * * MON-FRI *)"  # 11 PM UTC Monday-Friday
#
#   scalable_target_action {
#     min_capacity = 0   # Scale down to 0 instances during off-hours
#     max_capacity = 0
#   }
# }
