from django.shortcuts import render
from rest_framework import viewsets, permissions, generics
from alumni.models import *
from alumni.serializers import AlumniSerializer, UserSerializer

# Create your views here.
class AlumniViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Alumni.objects.all()
    serializer_class = AlumniSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    
class UserViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]