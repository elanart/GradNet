from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, generics, status, parsers, permissions
from alumni.models import *
from alumni import serializers
from django.core.exceptions import ObjectDoesNotExist

# Create your views here.
    
    
class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser, ]
    
    def get_permissions(self):
        if self.action in ['current_user', 'my_posts', 'get_posts', 'create_post']:
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
    
    @action(methods=['get'], url_path='current-user/posts', detail=False)
    def my_posts(self, request):
        user = request.user
        posts = Post.objects.filter(user=user)
        return Response(serializers.PostSerializer(posts, many=True).data)
    
    @action(methods=['get'], url_path='posts', detail=True)
    def get_posts(self, request, pk):
        posts = self.get_object().post_set.all()
            
        return Response(serializers.PostSerializer(posts, many=True).data)
        
    @action(methods=['post'], url_path='current-user/post', detail=False)
    def create_post(self, request):
        user = request.user
        if request.method.__eq__('POST'):
            posts = Post.objects.create(user=user, content=request.data.get('content'))
            
        return Response(serializers.PostSerializer(posts).data, status=status.HTTP_201_CREATED)
    

class PostViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = Post.objects.filter(is_active=True)
    serializer_class = serializers.PostSerializer