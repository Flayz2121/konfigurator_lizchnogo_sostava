from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import RegisterView
from rest_framework.routers import DefaultRouter
from .serializers import KursesViewSet, UserViewSet, FullUserViewSet, get_user_status, PersonsViewSet

router = DefaultRouter()
router.register(r'kurses', KursesViewSet, basename='kurses')
router.register(r'users', UserViewSet, basename='users')
router.register(r'full_users', FullUserViewSet, basename='full_users')
router.register(r'persons', PersonsViewSet, basename='persons')

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('', include(router.urls)),
    path('user-status/', get_user_status),
]


