from rest_framework import serializers
from alumni.models import *
from djf_surveys.models import Survey

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


class ShortUserSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField()

    class Meta:
        model = User
        fields = ['id', 'last_name', 'first_name', 'avatar']

        
class MediaSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        req = super().to_representation(instance)
        if instance.file:
            req['file'] = instance.file.url
        
        return req
    
    class Meta:
        model = Media
        fields = ['id', 'type', 'file']


class PostSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Post
        fields = ['id', 'created_date', 'updated_date']


class ActionSerializer(serializers.ModelSerializer):
    user = ShortUserSerializer(read_only=True)
    class Meta:
        model = Action
        fields = ['id', 'type', 'created_date', 'updated_date', 'user']

        
        
class CommentSerializer(serializers.ModelSerializer):
    user = ShortUserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'created_date', 'updated_date', 'user']


class AuthenticatedDetailPostSerializer(serializers.ModelSerializer):
    user = ShortUserSerializer(read_only=True)
    media = serializers.SerializerMethodField()
        
    def get_media(self, post):
        media_objects = post.post_media.all()
        return MediaSerializer(media_objects, many=True).data
    
    class Meta:
        model = Post
        fields = PostSerializer.Meta.fields + ['caption', 'content', 'user', 'media']
        
        
class InvitationSerializer(serializers.ModelSerializer):
    recipients_users = ShortUserSerializer(many=True, read_only=True)
    # recipients_groups = GroupSerializer(many=True, read_only=True)
    media = serializers.SerializerMethodField()

    def get_media(self, invitation):
        media_objects = invitation.invitation_media.all()
        return MediaSerializer(media_objects, many=True).data
    
    class Meta:
        model = Invitation
        fields = ['id', 'title', 'content', 'location', 'recipients_users', 'recipients_groups', 'media']
        
        
