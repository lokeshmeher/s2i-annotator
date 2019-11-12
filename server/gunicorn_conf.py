import os
import multiprocessing

# bind = "0.0.0.0:{}".format(os.environ.get('PORT', 8000))
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "gevent"
loglevel = "info"
accesslog = "-"  # stdout
# access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'
errorlog = "-"  # stderr
capture_output = True  # Redirect stdout/stderr to specified file in errorlog
enable_stdio_inheritance = True
