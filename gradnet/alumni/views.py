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
    def send_friend_request(self, request, pk=None):
        sender = request.user
        try:
            recipient = User.objects.get(pk=pk)
        except ObjectDoesNotExist:
            return Response({"error": "Người nhận không tồn tại."}, status=status.HTTP_404_NOT_FOUND)

        if sender == recipient:
            return Response({"error": "Bạn không thể gửi lời mời kết bạn cho chính mình."}, status=status.HTTP_400_BAD_REQUEST)

        if recipient in sender.friends.all():
            return Response({"error": "Người này đã là bạn của bạn."}, status=status.HTTP_400_BAD_REQUEST)

        friend_request, created = FriendRequest.objects.get_or_create(
            sender=sender,
            recipient=recipient
        )

        if created:
            return Response(serializers.UserSerializer(sender).data, status=status.HTTP_201_CREATED)
        else:
            friend_request.delete()
            return Response(serializers.UserSerializer(sender).data, status=status.HTTP_200_OK)