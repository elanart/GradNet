from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, generics, status, parsers, permissions
from alumni.models import *
from alumni import serializers

# Create your views here.
    
    
class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser, ]
    
    def list(self, request):
        queryset = User.objects.filter(is_active=True)
        return Response(serializers.UserSerializer(queryset, many=True).data)
    
    # def update(self, request, pk):
    #     user = request.user
    #     for k,v in request.data.items():
    #             setattr(user, k, v) #user.k = v
    #     user.save()
    #     return Response(serializers.UserSerializer(request.user).data)
    
    # def get_permissions(self):
    #     if self.action in ['current_user']:
    #         return [permissions.IsAuthenticated()]
        
    # @action(methods=['get', 'patch'], url_path='current-user', detail=False)
    # def current_user(self, request):
    #     user = request.user
    #     if request.method.__eq__('PATCH'):
    #         for k,v in request.data.items():
    #             setattr(user, k, v) #user.k = v
    #         user.save()
    #     return Response(serializers.UserSerializer(request.user).data)