terraform {
  required_providers {
    random = {
      source  = "hashicorp/random"
      version = "3.7.2"
    }
  }
}
resource "aws_ecs_task_definition" "backend" {
  # provider = aws.admin
  family                   = "${var.project_name}-backend-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "1024"
  memory                   = "2048"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task_execution.arn
  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = "${data.aws_ecr_repository.backend.repository_url}:latest@${data.aws_ecr_image.backend.image_digest}"
      essential = true
      logConfiguration : {
        logDriver = "awslogs",
        options : {
          awslogs-group         = var.backend_log_group_name
          awslogs-stream-prefix = "ecs"
          awslogs-region        = var.region
        }
      },
      portMappings = [
        {
          containerPort = 8000
          hostPort      = 8000
        },
      ],
      environment = [
        {
          name  = "DB_HOST"
          value = var.db_host
        },
        {
          name  = "DB_PORT"
          value = var.db_port
        },
        {
          name  = "DB_NAME"
          value = var.db_name
        },
        {
          name  = "DB_USER"
          value = var.db_username
        },
        {
          name  = "DB_PASSWORD"
          value = data.aws_secretsmanager_secret_version.db_pass.secret_string
        },
        {
          name  = "AWS_ACCESS_KEY_ID"
          value = aws_iam_access_key.backend_s3_user.id
        },
        {
          name  = "AWS_SECRET_ACCESS_KEY"
          value = aws_iam_access_key.backend_s3_user.secret
        },
        {
          name  = "AWS_DEFAULT_REGION"
          value = var.region
        },
        {
          name  = "AWS_BUCKET_NAME"
          value = var.media_bucket_name
        },
        {
          name  = "AWS_S3_CUSTOM_DOMAIN"
          value = var.s3_cloudfront_domain
        },
        {
          name  = "STRIPE_SECRET_KEY"
          value = var.stripe_secret_key
        },
        {
          name  = "STRIPE_WEBHOOK_SECRET"
          value = var.stripe_webhook_secret
        },
        {
          name  = "FRONTEND_URL"
          value = var.frontend_address
        },
        {
          name  = "DJANGO_SECRET_KEY"
          value = aws_secretsmanager_secret_version.django_secret.secret_string
        }
      ],
      healthCheck : {
        command     = ["CMD-SHELL", "curl -f http://127.0.0.1:8000/health || exit 1"]
        interval    = 15 # Reduced from 10 to 15 for stability
        timeout     = 5
        retries     = 2  # Reduced from 3 to 2 for faster failure detection
        startPeriod = 30 # Reduced from 60 to 30 seconds
      },
      # Add resource limits and reservations
      memoryReservation = 2048,
      ulimits = [
        {
          name      = "nofile"
          softLimit = 65536
          hardLimit = 65536
        }
      ]
    },
  ])
}
