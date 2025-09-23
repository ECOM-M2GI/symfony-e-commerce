resource "aws_iam_role" "ecs_task_execution" {
  # provider = aws.admin
  name               = "ecsTaskExecutionRole"
  assume_role_policy = <<EOF
{
      "Version": "2012-10-17",
      "Statement": [
          {
            "Sid": "",
            "Effect": "Allow",
            "Principal": {
                "Service": "ecs-tasks.amazonaws.com"
            },
              "Action": "sts:AssumeRole"
          }
      ]
}
EOF
}

resource "aws_iam_policy" "ecs_task_execution" {
  # provider = aws.admin
  name        = "ecsTaskExecutionPolicy"
  description = "Policy for ECS task execution role"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid    = "EnableCreationAndManagementOfRDSCloudwatchLogEvents",
        Effect = "Allow",
        Action = [
          "logs:GetLogEvents",
          "logs:PutLogEvents"
        ],
        Resource = "*"
      },
      {
        Sid    = "EnableCreationAndManagementOfRDSCloudwatchLogGroupsAndStreams",
        Effect = "Allow",
        Action = [
          "logs:CreateLogStream",
          "logs:DescribeLogStreams",
          "logs:PutRetentionPolicy",
          "logs:CreateLogGroup"
        ],
        Resource = "*"
      },
      {
        Effect = "Allow",
        Action = [
          "ecr:*"
        ],
        Resource = "*"
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "ssm:GetParameters",
          "secretsmanager:GetSecretValue",
          "kms:Decrypt"
        ],
        "Resource" = "*"
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "ssmmessages:CreateControlChannel",
          "ssmmessages:CreateDataChannel",
          "ssmmessages:OpenControlChannel",
          "ssmmessages:OpenDataChannel"
        ],
        "Resource" : "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  # provider = aws.admin
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = aws_iam_policy.ecs_task_execution.arn

}
