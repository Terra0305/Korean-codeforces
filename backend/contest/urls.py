from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminContestViewSet, AdminProblemViewSet, ContestViewSet, ProblemViewSet

app_name = 'contest'

router = DefaultRouter()
router.register(r'admin/contests', AdminContestViewSet, basename='admin-contest')
router.register(r'admin/problems', AdminProblemViewSet, basename='admin-problem')

urlpatterns = [
    path('', include(router.urls)),
    path('contests/', ContestViewSet.as_view({'get': 'list'})),
    path('contests/<int:pk>/', ContestViewSet.as_view({'get': 'retrieve'})),
    path('problems/', ProblemViewSet.as_view({'get': 'list'})),
    path('problems/<int:contest_id>/', ProblemViewSet.as_view({'get': 'list_by_contest'})),
    path('problems/<int:contest_id>/<int:pk>/', ProblemViewSet.as_view({'get': 'retrieve_by_contest'})),
]
# 1. 대회 관리 (AdminContestViewSet)
# Base URL: admin/contests/
# -------------------------------------------------------------
# GET    /admin/contests/          : 대회 전체 목록 조회 (List)
#        ?name=xxx                 : 대회명 검색 (부분 일치)
# POST   /admin/contests/          : 새 대회 생성 (Create)
# GET    /admin/contests/{pk}/     : 특정 대회 상세 조회 (Retrieve)
# PUT    /admin/contests/{pk}/     : 특정 대회 전체 수정 (Update)
# PATCH  /admin/contests/{pk}/     : 특정 대회 일부 수정 (Partial Update)
# DELETE /admin/contests/{pk}/     : 특정 대회 삭제 (Destroy)


# 2. 문제 관리 (AdminProblemViewSet)
# Base URL: admin/problems/
# -------------------------------------------------------------
# GET    /admin/problems/          : 문제 전체 목록 조회 (List)
#        ?contest={id}&index={idx} : 대회 ID 및 문제 번호로 필터링
#쿼리를 통해 알아낸 pk로 다음들 수행가능
# POST   /admin/problems/          : 새 문제 생성 (Create)
# GET    /admin/problems/{pk}/     : 특정 문제 상세 조회 (Retrieve)
# PUT    /admin/problems/{pk}/     : 특정 문제 전체 수정 (Update)
# PATCH  /admin/problems/{pk}/     : 특정 문제 일부 수정 (Partial Update)
# DELETE /admin/problems/{pk}/     : 특정 문제 삭제 (Destroy)


# 3. 대회 공개 API (ContestViewSet)
# Base URL: api/contests/contests/
# -------------------------------------------------------------
# GET    /api/contests/contests/          : 대회 전체 목록 조회 (List)
# GET    /api/contests/contests/{pk}/     : 특정 대회 상세 조회 (Retrieve)


# 4. 문제 공개 API (ProblemViewSet)
# Base URL: api/contests/problems/
# -------------------------------------------------------------
# GET    /api/contests/problems/               : 문제 전체 목록 조회 (List)
# GET    /api/contests/problems/{contest_id}/  : 특정 대회의 문제 목록 조회 (List by Contest)
# GET    /api/contests/problems/{contest_id}/{pk}/ : 특정 대회의 특정 문제 상세 조회 (Retrieve by Contest)