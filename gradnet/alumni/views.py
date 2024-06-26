from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, generics, status, parsers, permissions
from alumni.models import *
from alumni import serializers, perms, paginators
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.parsers import MultiPartParser, JSONParser
from .models import Survey, Question, Choice, Answer
from .serializers import SurveySerializer, AnswerSerializer
# Create your views here.


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [MultiPartParser, JSONParser]

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

    # @action(methods=['post'], url_path='change-password', detail=False)
    # def change_password(self, request):
    #     user = request.user
    #     current_password = request.data.get('current_password')
    #     new_password = request.data.get('new_password')
    #     confirm_password = request.data.get('confirm_password')

    #     if user.check_password(current_password):
    #         if new_password.__eq__(confirm_password):
    #             user.set_password(new_password)
    #             user.save()
    #             return Response({"success": "Mật khẩu đã được thay đổi thành công!"})
    #         else:
    #             return Response({"error": "Xác nhận mật khẩu không khớp!"})

    #     return Response({"error": "Mật khẩu hiện tại không chính xác!"}, status=status.HTTP_400_BAD_REQUEST)


class PostViewSet(viewsets.ViewSet,
                  generics.ListAPIView,
                  generics.RetrieveDestroyAPIView):
    queryset = Post.objects.filter(is_active=True).order_by('-created_date').all()
    parser_classes = [MultiPartParser, JSONParser]
    permission_classes = [permissions.IsAuthenticated()]
    pagination_class = paginators.PostPaginator
    serializer_class = serializers.AuthenticatedDetailPostSerializer

    def get_permissions(self):
        if self.action in ['list']:
            return [permissions.AllowAny()]
        elif self.action in ['partial_update', 'block-comments', 'delete_comment', 'update_comment']:
            return [perms.PostOwner()]
        elif self.action in ['delete_comment']:
            return [perms.PostOwner() or perms.CommentOwner()]
        elif self.action in ['update_comment']:
            return [perms.CommentOwner()]
        elif self.action in ['destroy']:
            return [perms.PostOwner() or permissions.IsAdminUser()]
        return self.permission_classes

    # def get_serializer_class(self):
    #     if self.action.__eq__('retrieve'):
    #         return serializers.AuthenticatedDetailPostSerializer
    #     return serializers.PostSerializer

    def get_queryset(self):
        queryset = self.queryset

        if self.action.__eq__('list'):
            content = self.request.query_params.get("content")

            if content:
                queryset = queryset.filter(content__icontains=content)

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

    @action(methods=['get'], url_path='get-comments', detail=True)
    def get_comments(self, request, pk):
        post = self.get_object()

        comments = post.comment_set.select_related('user').all()
        paginator = paginators.CommentPaginator()

        page = paginator.paginate_queryset(comments, request)
        if page is not None:
            serializer = serializers.CommentSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(serializers.CommentSerializer(comments, many=True).data)

    @action(methods=['post'], url_path='add-comment', detail=True)
    def add_comment(self, request, pk):
        post = self.get_object()
        if post.allow_comments:
            c = post.comment_set.create(user=request.user, content=request.data.get('content'))

            return Response(serializers.CommentSerializer(c).data,
                            status=status.HTTP_201_CREATED)

        else:
            return Response({'detail': 'Không thể comment trong bài viết này!'}, status=status.HTTP_403_FORBIDDEN)

    @action(methods=['post'], url_path='block-comments', detail=True)
    def block_comments(self, request, pk=None):
        post = self.get_object()
        post.allow_comments = not post.allow_comments
        post.save()

        if post.allow_comments:
            status_message = 'Mở khóa bình luận'
        else:
            status_message = 'Đã khóa bình luận'

        return Response({'status': status_message}, status=status.HTTP_200_OK)

    @action(methods=['delete'], url_path='delete-comment', detail=True)
    def delete_comment(self, request, pk=None):
        # post = self.get_object()
        comment_id = request.data.get('comment_id')
        try:
            comment = Comment.objects.get(id=comment_id, post_id=pk)
        except Comment.DoesNotExist:
            return Response({'error': 'Không tìm thấy comment'}, status=status.HTTP_404_NOT_FOUND)
        comment.delete()
        return Response({'message': 'Xóa comment thành công!'}, status=status.HTTP_204_NO_CONTENT)

    @action(methods=['post'], url_path='update-comment', detail=True)
    def update_comment(self, request, pk):
        comment_id = request.data.get('comment_id')
        content = request.data.get('content')
        comment = Comment.objects.get(pk=comment_id)

        comment.content = content
        comment.save()
        return Response(serializers.CommentSerializer(comment).data, status=status.HTTP_200_OK)

    @action(methods=['get'], url_path='get-actions', detail=True)
    def get_actions(self, request, pk):
        post = self.get_object()
        actions = post.action_set.select_related('user').all()

        return Response(serializers.ActionSerializer(actions, many=True).data)

    @action(methods=['post'], url_path='add-action', detail=True)
    def add_action(self, request, pk):
        post = self.get_object()
        action, created = Action.objects.get_or_create(user=request.user, post=post, type=request.data.get('type'))

        if not created:
            action.is_active = not action.is_active
            action.save()
        return Response(serializers.ActionSerializer(action).data,
                        status=status.HTTP_201_CREATED)


class InvitationViewSet(viewsets.ViewSet,
                        generics.ListAPIView,
                        generics.RetrieveDestroyAPIView):
    queryset = Invitation.objects.filter(is_active=True).order_by('-created_date').all()
    parser_classes = [MultiPartParser, JSONParser]
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
            recipients_users_lists = [int(id.strip()) for id in recipients_users_ids.split(",") if id.strip().isdigit()]
            users = User.objects.filter(id__in=recipients_users_lists)
            invitation.recipients_users.set(users)

        # Xử lý recipients_groups
        if recipients_groups_ids:
            recipients_groups_lists = [int(id.strip()) for id in recipients_groups_ids.split(",") if id.strip().isdigit()]
            groups = Group.objects.filter(id__in=recipients_groups_lists)
            invitation.recipients_groups.set(groups)

        # Xử lý các tệp media
        media_image_request = request.FILES.getlist('media_image')
        media_video_request = request.FILES.getlist('media_video')

        for media_file in media_image_request:
            Media.objects.create(file=media_file, type=Media.MEDIA_TYPES.IMAGE, invitation=invitation)

        for media_file in media_video_request:
            Media.objects.create(file=media_file, type=Media.MEDIA_TYPES.VIDEO, invitation=invitation)

        # Tuần tự hóa dữ liệu invitation và các media liên quan
        response_data = serializers.InvitationSerializer(invitation, context={'request': request}).data
        return Response(response_data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk):
        invitation = self.get_object()

        for k, v in request.data.items():
            if k not in ['media_image', 'media_video', 'delete_media_ids']:
                setattr(invitation, k, v)
        invitation.save()

        delete_media_ids = request.data.get('delete_media_ids', "")
        if delete_media_ids:
            delete_media_ids_list = [int(id.strip()) for id in delete_media_ids.split(",")]
            Media.objects.filter(id__in=delete_media_ids_list, invitation=invitation).delete()

        media_image_request = request.FILES.getlist('media_image')
        media_video_request = request.FILES.getlist('media_video')

        for media_file in media_image_request:
            Media.objects.create(file=media_file, type=Media.MEDIA_TYPES.IMAGE, invitation=invitation)

        for media_file in media_video_request:
            Media.objects.create(file=media_file, type=Media.MEDIA_TYPES.VIDEO, invitation=invitation)

        response_data = serializers.InvitationSerializer(invitation, context={'request': request}).data
        return Response(response_data)


################
class SurveyViewSet(viewsets.ViewSet,generics.ListAPIView,
                        generics.DestroyAPIView):
    queryset = Survey.objects.all()
    serializer_class = serializers.SurveySerializer
    parser_classes = [MultiPartParser, JSONParser]
    permission_classes = [permissions.IsAdminUser]

    def create(self, request):
        data = request.data
        user = request.user

        title = data.get('title')
        content = data.get('content')

        # Tạo survey
        survey = Survey.objects.create(user=user, title=title, content=content)

        response_data = serializers.SurveySerializer(survey, context={'request': request}).data
        return Response(response_data, status=status.HTTP_201_CREATED)

    @action(methods=['get'], url_path='get-questions', detail=True)
    def get_questions(self, request, pk):
        question = self.get_object().questions.all()

        return Response(serializers.QuestionSerializer(question, many=True).data)

    @action(methods=['post'], url_path='add-question', detail=True)
    def add_question(self, request, pk):
        survey = self.get_object()
        name = request.data.get('name')
        if name:
            question = Question.objects.create(name=name, survey=survey)
            return Response(serializers.QuestionSerializer(question).data,
                        status=status.HTTP_201_CREATED)

    # @action(detail=True, methods=['post'])
    # def add_choice(self, request, pk=None):
    #     question_id = request.data.get('question_id')
    #     name = request.data.get('name')
    #     if question_id and name:
    #         try:
    #             question = Question.objects.get(id=question_id)
    #             Choice.objects.create(name=name, question=question)
    #             return Response({'status': 'choice added'}, status=status.HTTP_201_CREATED)
    #         except Question.DoesNotExist:
    #             return Response({'status': 'question not found'}, status=status.HTTP_404_NOT_FOUND)
    #     return Response({'status': 'question_id and name are required'}, status=status.HTTP_400_BAD_REQUEST)


class QuestionViewSet(viewsets.ViewSet, generics.DestroyAPIView):
    queryset = Question.objects.all()
    serializer_class = serializers.QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(methods=['get'], url_path='get-choices', detail=True)
    def get_choices(self, request, pk):
        choices = self.get_object().choice_set.all()

        return Response(serializers.ChoiceSerializer(choices, many=True).data)

    @action(methods=['post'], url_path='create-choices', detail=True)
    def create_choices(self, request, pk):
        question = self.get_object()
        name = request.data.get('name')

        choices = Choice.objects.create(name=name, question=question)

        return Response(serializers.ChoiceSerializer(choices).data,
                        status=status.HTTP_201_CREATED)




#####################
class AnswerViewSet(viewsets.ViewSet,generics.ListAPIView, generics.DestroyAPIView):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
    permission_classes = [permissions.IsAuthenticated]


    # def create(self, request, *args, **kwargs):
    #     survey_id = request.data.get('survey')
    #     question_id = request.data.get('question')
    #     choice_id = request.data.get('choice')

    #     try:
    #         survey = Survey.objects.get(id=survey_id)
    #         question = Question.objects.get(id=question_id)
    #         choice = Choice.objects.get(id=choice_id)

    #         answer = Answer.objects.create(
    #             user=request.user,
    #             survey=survey,
    #             question=question,
    #             choice=choice
    #         )
    #         serializer = self.get_serializer(answer)
    #         return Response(serializer.data, status=status.HTTP_201_CREATED)
    #     except (Survey.DoesNotExist, Question.DoesNotExist, Choice.DoesNotExist):
    #         return Response({'status': 'survey, question, or choice not found'}, status=status.HTTP_404_NOT_FOUND)