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
    
    
# class LoginView(TokenView):
#     def post(self, request, *args, **kwargs):
#         username = request.data.get("username")
#         password = request.data.get("password")
#         user = authenticate(request, username=username, password=password)
#         if user is not None:
#             # Assuming you have a single application
#             application = Application.objects.first()
#             request.POST = request.POST.copy()
#             request.POST.update({
#                 'grant_type': 'password',
#                 'username': username,
#                 'password': password,
#                 'client_id': application.client_id,
#                 'client_secret': application.client_secret,
#             })
#             return super().post(request, *args, **kwargs)
#         else:
#             return Response({"error": "Invalid username/password"}, status=status.HTTP_400_BAD_REQUEST)