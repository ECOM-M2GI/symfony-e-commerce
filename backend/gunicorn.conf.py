# Gunicorn configuration file

# Server socket
bind = "0.0.0.0:8000"
backlog = 2048

workers = 4
worker_class = "gevent"
worker_connections = 1000
timeout = 60
keepalive = 5

# Restart workers after this many requests, to help prevent memory leaks
max_requests = 2000  # Increased from 1000 to 2000
max_requests_jitter = 200  # Increased proportionally

# Preload application for better performance
preload_app = False  # theading and gevent do not work well with preload_app=True

# Thread settings for gevent
# threads = 4  # Add threading support

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = "gunicorn_ebey"

# Server mechanics
daemon = False
pidfile = "/tmp/gunicorn.pid"

# Performance tuning
worker_tmp_dir = "/dev/shm"  # Use tmpfs for better performance
forwarded_allow_ips = "*"  # Allow forwarded IPs from ALB
