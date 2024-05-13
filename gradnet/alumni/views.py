from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, generics, status, parsers, permissions
from alumni.models import *
from alumni import serializers, perms
from django.core.exceptions import ObjectDoesNotExist

# Create your views here.
    
    
class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser, ]
    
    def get_permissions(self):
        if self.action in ['current_user', 'list_posts', 'get_posts', 'my_post']:
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
    def list_posts(self, request):
        user = request.user
        
        if request.method.__eq__('GET'):
            posts = Post.objects.filter(user=user)
            return Response(serializers.PostSerializer(posts, many=True).data)      


class PostViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Post.objects.filter(is_active=True)
    serializer_class = serializers.PostSerializer
    parser_classes = [parsers.MultiPartParser, ]
    
    def get_permissions(self):
        if self.action in ['get_post', 'create_post']:
            return [permissions.IsAuthenticated()]
        elif self.action in ['update_post', 'delete_post']:
            return [perms.PostOwner()]
        return [permissions.AllowAny()]
    
    @action(methods=['get'], url_path='get-post', detail=True)
    def get_post(self, request, pk):
        post = self.get_object()
        return Response(serializers.PostSerializer(post).data)

    @action(methods=['post'], url_path='create-post', detail=False)
    def create_post(self, request):
        user = request.user
        post = Post.objects.create(user=user, content=request.data.get('content'))
        return Response(serializers.PostSerializer(post).data, status=status.HTTP_201_CREATED)

    @action(methods=['patch'], url_path='update-post', detail=True)
    def update_post(self, request, pk):
        post = self.get_object()
        for k, v in request.data.items():
            setattr(post, k, v)
        post.save()
        return Response(serializers.PostSerializer(post).data)

    @action(methods=['delete'], url_path='delete-post', detail=True)
    def delete_post(self, request, pk):
        post = self.get_object()
        post.delete()
        return Response({'status': 'Đã xóa bài viết'}, status=status.HTTP_204_NO_CONTENT)