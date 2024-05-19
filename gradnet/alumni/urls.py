from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register('users', views.UserViewSet)
router.register('posts', views.PostViewSet)
router.register('invitations', views.InvitationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]