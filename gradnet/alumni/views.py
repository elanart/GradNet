from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, generics, status, parsers, permissions
from alumni.models import *
from alumni import serializers
from oauth2_provider.views import TokenView
from oauth2_provider.models import Application
from django.contrib.auth import authenticate

# Create your views here.
    
    
class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser, ]
    
    def get_permissions(self):
        if self.action in ['current_user']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
        
    @action(methods=['get', 'patch'], url_path='current-user', detail=False)
    def current_user(self, request):
        user = request.user
        if request.method.__eq__('PATCH'):
            for k,v in request.data.items():
                setattr(user, k, v) #user.k = v
            user.save()
        return Response(serializers.UserSerializer(request.user).data)
    
    @action(methods=['post'], url_path='add-friend', detail=True)
    def add_friend(self, request, pk):
        friend_request, created = FriendRequest.objects.get_or_create(sender=request.user, recipient=self.get_object())
        if not created:
            if friend_request.status == FriendRequest.Status.PENDING:
                friend_request.status = FriendRequest.Status.DECLINED
                friend_request.save()
                return Response(serializers.FriendRequestSerializer(friend_request).data, status=status.HTTP_200_OK)
            else:
                friend_request.status = FriendRequest.Status.PENDING
                friend_request.save()
        return Response(serializers.FriendRequestSerializer(friend_request).data, status=status.HTTP_201_CREATED)