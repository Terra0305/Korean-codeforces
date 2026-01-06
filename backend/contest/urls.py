from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminContestViewSet, AdminProblemViewSet, ContestViewSet, ProblemViewSet, AdminParticipantViewSet

app_name = 'contest'

router = DefaultRouter()
router.register(r'admin/contests', AdminContestViewSet, basename='admin-contest')
router.register(r'admin/problems', AdminProblemViewSet, basename='admin-problem')
router.register(r'admin/participants', AdminParticipantViewSet, basename='admin-participant')

urlpatterns = [
    path('', include(router.urls)),
    path('contests/', ContestViewSet.as_view({'get': 'list'})),
    path('contests/<int:pk>/', ContestViewSet.as_view({'get': 'retrieve'})),
    path('contests/<int:pk>/register/', ContestViewSet.as_view({'post': 'register'})),
    path('contests/<int:pk>/unregister/', ContestViewSet.as_view({'delete': 'unregister'})),
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
# POST   /api/contests/contests/{pk}/register/ : 대회 참가 신청
# DELETE /api/contests/contests/{pk}/unregister/ : 대회 참가 취소

# 4. 관리자 참가자 관리 (AdminParticipantViewSet)
# Base URL: admin/participants/
# -------------------------------------------------------------
# GET    /admin/participants/          : 참가자 전체 목록 조회 (List)
#        ?contest={id}                 : 특정 대회의 참가자 목록 조회
# PUT/PATCH /admin/participants/{pk}/  : 참가자 정보 수정 (점수 등)
# DELETE /admin/participants/{pk}/     : 참가자 삭제 (강제 취소)


# 4. 문제 공개 API (ProblemViewSet)
# Base URL: api/contests/problems/
# -------------------------------------------------------------
# GET    /api/contests/problems/               : 문제 전체 목록 조회 (List)
# GET    /api/contests/problems/{contest_id}/  : 특정 대회의 문제 목록 조회 (List by Contest)
# GET    /api/contests/problems/{contest_id}/{pk}/ : 특정 대회의 특정 문제 상세 조회 (Retrieve by Contest)