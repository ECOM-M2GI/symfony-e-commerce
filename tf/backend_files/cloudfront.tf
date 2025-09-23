resource "aws_cloudfront_origin_access_control" "backend" {
  name                              = "${var.project_name}-media-oac"
  description                       = "Access control for media bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "backend" {
  enabled             = true
  default_root_object = ""

  origin {
    domain_name              = aws_s3_bucket.backend.bucket_regional_domain_name
    origin_id                = aws_s3_bucket.backend.bucket
    origin_access_control_id = aws_cloudfront_origin_access_control.backend.id
  }

  default_cache_behavior {
    target_origin_id       = aws_s3_bucket.backend.bucket
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]

    cache_policy_id = data.aws_cloudfront_cache_policy.caching_optimized.id

  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

}

data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}
