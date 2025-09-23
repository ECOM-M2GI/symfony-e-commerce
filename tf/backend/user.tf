# IAM User for S3 uploads to backend files bucket
resource "aws_iam_user" "backend_s3_user" {
  name = "${var.project_name}-backend-s3-user"
  path = "/"

  tags = {
    Name        = "${var.project_name}-backend-s3-user"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Access keys for the IAM user
resource "aws_iam_access_key" "backend_s3_user" {
  user = aws_iam_user.backend_s3_user.name
}

# IAM policy for S3 bucket access
data "aws_iam_policy_document" "backend_s3_policy" {
  statement {
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:PutObjectAcl",
      "s3:GetObject",
      "s3:DeleteObject",
      "s3:ListBucket"
    ]
    resources = [
      "arn:aws:s3:::${var.media_bucket_name}",
      "arn:aws:s3:::${var.media_bucket_name}/*"
    ]
  }
}

# Create the IAM policy
resource "aws_iam_policy" "backend_s3_policy" {
  name        = "${var.project_name}-backend-s3-policy"
  description = "Policy for backend to access S3 bucket for file uploads"
  policy      = data.aws_iam_policy_document.backend_s3_policy.json
}

# Attach the policy to the user
resource "aws_iam_user_policy_attachment" "backend_s3_user_policy" {
  user       = aws_iam_user.backend_s3_user.name
  policy_arn = aws_iam_policy.backend_s3_policy.arn
}
