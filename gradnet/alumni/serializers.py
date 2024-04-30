from rest_framework import serializers
from alumni.models import *


class ItemSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        req = super().to_representation(instance)
        req['image'] = instance.image.url
        
        return req


class UserSerializer(serializers.ModelSerializer):    
    def to_representation(self, instance):
        req = super().to_representation(instance)
        if instance.avatar:
            req['avatar'] = instance.avatar.url
            
        if instance.cover:
            req['cover'] = instance.cover.url
        
        return req
    
    def create(self, validated_data):        
        data = validated_data.copy()
        
        user = User(**data)
        user.set_password(user.password)
        user.save()
        
        return user
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'password', 'email', 'avatar', 'cover', 'alumni_id']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }