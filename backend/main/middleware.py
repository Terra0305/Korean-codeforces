import logging
import time

logger = logging.getLogger('django.request')

class RequestLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        
        response = self.get_response(request)
        
        duration = time.time() - start_time
        user = request.user.username if request.user.is_authenticated else 'Anonymous'
        ip = self.get_client_ip(request)
        
        log_data = f"{ip} {request.method} {request.path} (User: {user}) - {response.status_code} ({duration:.2f}s)"
        logger.info(log_data)
        
        return response

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
