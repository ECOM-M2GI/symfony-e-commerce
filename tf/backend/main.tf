resource "aws_ecs_cluster" "backend" {
  name = "${var.project_name}-backend-cluster"
}
