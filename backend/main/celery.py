import os
from celery import Celery

# 'celery' 프로그램의 기본 Django 설정 모듈을 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main.settings')

app = Celery('main')

# 여기서 문자열을 사용하면 워커가 자식 프로세스에 설정 객체를 직렬화할 필요가 없습니다.
# - namespace='CELERY'는 모든 Celery 관련 설정 키가 `CELERY_` 접두사를 가져야 함을 의미
app.config_from_object('django.conf:settings', namespace='CELERY')

# 등록된 모든 Django 앱에서 task 모듈을 로드
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
