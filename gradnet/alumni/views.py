from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status

from .serializers import AlumniSerializer
from . import serializers
from .models import *

from rest_framework import viewsets, parsers,generics
from . import serializers
class AlumniRegisterView(generics.CreateAPIView):
    serializer_class = serializers.AlumniSerializer
    parser_classes = [parsers.MultiPartParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AlumniConfirmView(generics.UpdateAPIView):
    queryset = Alumni.objects.all()
    serializer_class = AlumniSerializer
    lookup_field = 'alumni_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object() # lấy đối tượng của
        instance.is_confirmed = True  # Xác nhận thông tin cựu sinh viên
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)





