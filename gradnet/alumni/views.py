from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, generics, status, parsers, permissions
from alumni.models import *
from alumni import serializers, perms, paginators
from django.core.exceptions import ObjectDoesNotExist

# Create your views here.
    
    
class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser, ]
    
    def get_permissions(self):
        if self.action in ['current_user', 'list_posts', 'get_posts', 'my_post', 'change_password']:
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
    
    @action(methods=['post'], url_path='change-password', detail=False)
    def change_password(self, request):
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        
        if user.check_password(current_password):
            if new_password.__eq__(confirm_password):
                user.set_password(new_password)
                user.save()
                return Response({"success": "Mật khẩu đã được thay đổi thành công!"})
            else: 
                return Response({"error": "Xác nhận mật khẩu không khớp!"})
        
        return Response({"error": "Mật khẩu hiện tại không chính xác!"}, status=status.HTTP_400_BAD_REQUEST)
    
    # @action(methods=['get'], url_path='current-user/posts', detail=False)
    # def list_posts(self, request):
    #     user = request.user
        
    #     if request.method.__eq__('GET'):
    #         posts = Post.objects.filter(user=user)
    #         return Response(serializers.PostSerializer(posts, many=True).data)      


class PostViewSet(viewsets.ViewSet, 
                  generics.ListAPIView,
                  generics.RetrieveDestroyAPIView):
    queryset = Post.objects.filter(is_active=True).order_by('-created_date').all()
    serializer_class = serializers.PostSerializer
    parser_classes = [parsers.MultiPartParser, ]
    permission_classes = [permissions.IsAuthenticated()]
    pagination_class = paginators.PostPaginator
    
    def get_permissions(self):
        if self.action in ['partial_update']:
            return [perms.PostOwner()]
        elif self.action in ['destroy']:
            return [perms.PostOwner(), permissions.IsAdminUser()]
        return self.permission_classes
    
    def get_queryset(self):
        queryset = self.queryset

        if self.action.__eq__('list'):
            user_id = self.request.query_params.get("userId")

            if user_id:
                queryset = queryset.filter(user_id=user_id)
        return queryset
    
    def create(self, request):
        content = request.data.get('content')
        user = request.user
        
        # Tạo bài post
        post = Post.objects.create(user=user, content=content)
        
        # Xử lý các tệp media
        media_image_request = request.FILES.getlist('media_image')
        media_video_request = request.FILES.getlist('media_video')
        
        media_list = []
        
        # Thêm các tệp hình ảnh vào danh sách
        for media_file in media_image_request:
            media = Media(file=media_file, type=Media.MEDIA_TYPES.IMAGE, post=post)
            media.save()
            media_list.append(media)
        
        # Thêm các tệp video vào danh sách
        for media_file in media_video_request:
            media = Media(file=media_file, type=Media.MEDIA_TYPES.VIDEO, post=post)
            media.save()
            media_list.append(media)
            
        media_image = [media for media in media_list if media.type == Media.MEDIA_TYPES.IMAGE]
        media_video = [media for media in media_list if media.type == Media.MEDIA_TYPES.VIDEO]
        
        # Tuần tự hóa dữ liệu bài post và các media liên quan
        response_data = serializers.PostSerializer(post).data
        response_data['media_image'] = serializers.MediaSerializer(media_image, many=True).data
        response_data['media_video'] = serializers.MediaSerializer(media_video, many=True).data
        
        return Response(response_data, status=status.HTTP_201_CREATED)      

    def partial_update(self, request, pk):
        post = self.get_object()
        for k, v in request.data.items():
            setattr(post, k, v)
        post.save()
        return Response(serializers.PostSerializer(post).data)
    
    
# class GroupViewSet(viewsets.ViewSet, generics.ListAPIView):
#     queryset = Group.objects.all()
#     serializer_class = serializers.GroupSerializer
    
#     @action(methods=['get'], url_path='groups', detail=False)
#     def get_group(self, request):
#         pass