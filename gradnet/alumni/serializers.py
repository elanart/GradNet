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


class UserInteractionSerializer(serializers.ModelSerializer):
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


# class CommentSerializer(serializers.ModelSerializer):
#     user = UserInteractionSerializer()
    
#     class Meta:
#         model = Comment
#         fields = ['id', 'content', 'created_date', 'updated_date', 'user']


# # class ActionSerializer(serializers.ModelSerializer):
# #     class Meta:
# #         model = Action
# #         fields = ['type', 'created_date', 'updated_date']


class PostSerializer(serializers.ModelSerializer):
    user = UserInteractionSerializer(read_only=True)
    post_media = MediaSerializer(many=True, required=False)
    
    def create(self, validated_data):
        images_data = self.context['request'].FILES
        validated_data['user'] = self.context['request'].user
        post = Post.objects.create(**validated_data)
        for image_data in images_data.values():
            Media.objects.create(post=post, file=image_data)
        return post
    
    class Meta:
        model = Post
        fields = ['id', 'content', 'created_date', 'updated_date', 'user', 'post_media']


class DetailPostSerializer(serializers.ModelSerializer):
    action = serializers.SerializerMethodField()

    def get_action(self, post):
        request = self.context.get('request')
        if request.user.is_authenticated:
            return post.action_set.filter(is_active=True).exists()
    
    class Meta:
        model = PostSerializer.Meta.model
        fields = PostSerializer.Meta.fields + ['action']
        
        
# class GroupSerializer(serializers.ModelSerializer):
#     member = serializers.StringRelatedField(many=True)

#     class Meta:
#         model = Group
#         fields = ['id', 'name', 'member']