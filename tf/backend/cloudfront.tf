# CloudFront Distribution for Backend API
resource "aws_cloudfront_distribution" "backend_api" {
  enabled = true
  comment = "CloudFront distribution for backend API with HTTPS"

  # ALB as origin
  origin {
    domain_name = aws_lb.backend.dns_name
    origin_id   = "ALB-${aws_lb.backend.name}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "ALB-${aws_lb.backend.name}"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    compress               = true

    forwarded_values {
      query_string = true
      headers      = ["Authorization", "Content-Type", "Accept", "Origin", "Referer"]

      cookies {
        forward = "all"
      }
    }

    # Cache settings optimized for API
    min_ttl     = 0
    default_ttl = 0     # Don't cache by default for API responses
    max_ttl     = 86400 # 1 day max
  }

  # Cache behavior for health checks
  ordered_cache_behavior {
    path_pattern     = "/health"
    target_origin_id = "ALB-${aws_lb.backend.name}"

    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 0 # Don't cache health checks
    max_ttl     = 0
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Use CloudFront's default SSL certificate (*.cloudfront.net)
  viewer_certificate {
    cloudfront_default_certificate = true
  }

}
