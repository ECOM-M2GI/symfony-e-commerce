
resource "aws_s3_bucket" "backend" {
  bucket        = "${var.project_name}-backend-files"
  force_destroy = true
}

resource "aws_s3_bucket_versioning" "backend" {
  bucket = aws_s3_bucket.backend.id
  versioning_configuration {
    status = "Disabled"
  }
}

resource "aws_s3_bucket_public_access_block" "backend" {
  bucket                  = aws_s3_bucket.backend.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Bucket policy so only CloudFront can access S3
data "aws_iam_policy_document" "backend" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.backend.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.backend.arn]
    }
  }
}


resource "aws_s3_bucket_policy" "backend" {
  bucket = aws_s3_bucket.backend.id
  policy = data.aws_iam_policy_document.backend.json
}
