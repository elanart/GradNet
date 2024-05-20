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


class PostViewSet(viewsets.ViewSet, 
                  generics.ListAPIView,
                  generics.RetrieveDestroyAPIView):
    queryset = Post.objects.filter(is_active=True).order_by('-created_date').all()
    parser_classes = [parsers.MultiPartParser, ]
    permission_classes = [permissions.IsAuthenticated()]
    pagination_class = paginators.PostPaginator
    
    def get_permissions(self):
        if self.action in ['partial_update']:
            return [perms.PostOwner()]
        elif self.action in ['destroy']:
            return [perms.PostOwner() or permissions.IsAdminUser()]
        return self.permission_classes
    
    def get_serializer_class(self):
        if self.action.__eq__('retrieve'):
            return serializers.AuthenticatedDetailPostSerializer
        return serializers.PostSerializer
    
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
        
        post = Post.objects.create(user=user, content=content)
        
        media_image_request = request.FILES.getlist('media_image')
        media_video_request = request.FILES.getlist('media_video')
        
        for media_file in media_image_request:
            Media.objects.create(file=media_file, type=Media.MEDIA_TYPES.IMAGE, post=post)
        
        for media_file in media_video_request:
            Media.objects.create(file=media_file, type=Media.MEDIA_TYPES.VIDEO, post=post)
        
        response_data = serializers.AuthenticatedDetailPostSerializer(post, context={'request': request}).data
        return Response(response_data, status=status.HTTP_201_CREATED)         

    def partial_update(self, request, pk):
        post = self.get_object()
        
        for k, v in request.data.items():
            if k not in ['media_image', 'media_video', 'delete_media_ids']:
                setattr(post, k, v)
        post.save()
        
        delete_media_ids = request.data.get('delete_media_ids', "")
        if delete_media_ids:
            delete_media_ids_list = [int(id.strip()) for id in delete_media_ids.split(",")]
            Media.objects.filter(id__in=delete_media_ids_list, post=post).delete()
        
        media_image_request = request.FILES.getlist('media_image')
        media_video_request = request.FILES.getlist('media_video')
        
        for media_file in media_image_request:
            Media.objects.create(file=media_file, type=Media.MEDIA_TYPES.IMAGE, post=post)
                
        for media_file in media_video_request:
            Media.objects.create(file=media_file, type=Media.MEDIA_TYPES.VIDEO, post=post)

        response_data = serializers.AuthenticatedDetailPostSerializer(post, context={'request': request}).data
        return Response(response_data)
    
    
class InvitationViewSet(viewsets.ViewSet,
                        generics.ListAPIView,
                        generics.RetrieveDestroyAPIView):
    queryset = Invitation.objects.filter(is_active=True).order_by('-created_date').all()
    serializer_class = serializers.InvitationSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def create(self, request):
        data = request.data
        user = request.user
        
        title = data.get('title')
        content = data.get('content')
        location = data.get('location')
        recipients_users_ids = data.get('recipients_users', [])
        recipients_groups_ids = data.get('recipients_groups', [])
        
        # Tạo lời mời (invitation)
        invitation = Invitation.objects.create(user=user, title=title, content=content, location=location)
        
        # Xử lý recipients_users
        if recipients_users_ids:
            recipients_users_lists = [int(id.strip()) for id in recipients_users_ids]
            users = User.objects.filter(id__in=recipients_users_lists)
            invitation.recipients_users.set(users)
        
        # Xử lý recipients_groups
        if recipients_groups_ids:
            recipients_groups_lists = [int(id.strip()) for id in recipients_groups_ids]
            groups = Group.objects.filter(id__in=recipients_groups_lists)
            invitation.recipients_groups.set(groups)
    
        # Xử lý các tệp media
        media_image_request = request.FILES.getlist('media_image')
        media_video_request = request.FILES.getlist('media_video')
        
        media_list = []
        
        # Thêm các tệp hình ảnh vào danh sách
        for media_file in media_image_request:
            media = Media(file=media_file, type=Media.MEDIA_TYPES.IMAGE, invitation=invitation)
            media.save()
            media_list.append(media)
        
        # Thêm các tệp video vào danh sách
        for media_file in media_video_request:
            media = Media(file=media_file, type=Media.MEDIA_TYPES.VIDEO, invitation=invitation)
            media.save()
            media_list.append(media)
            
        media_image = [media for media in media_list if media.type == Media.MEDIA_TYPES.IMAGE]
        media_video = [media for media in media_list if media.type == Media.MEDIA_TYPES.VIDEO]
        
        # Tuần tự hóa dữ liệu invitation và các media liên quan
        response_data = serializers.InvitationSerializer(invitation).data
        response_data['media_image'] = serializers.MediaSerializer(media_image, many=True).data
        response_data['media_video'] = serializers.MediaSerializer(media_video, many=True).data
        
        return Response(response_data, status=status.HTTP_201_CREATED)