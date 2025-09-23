# get latest client image
data "aws_ecr_image" "backend" {
  registry_id     = data.aws_ecr_repository.backend.registry_id
  repository_name = data.aws_ecr_repository.backend.name
  most_recent     = true
}
