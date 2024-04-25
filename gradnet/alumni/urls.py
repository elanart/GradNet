
from django.urls import path
from . import views

urlpatterns = [
    path('alumni/register/', views.AlumniRegisterView.as_view(), name='alumni-register'),
    path('alumni/confirm/<str:alumni_id>/', views.AlumniConfirmView.as_view(), name='alumni-confirm'),
]
