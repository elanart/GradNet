# admin.py
from django.contrib import admin
from django.template.response import TemplateResponse
from django.db.models.functions import ExtractYear, ExtractMonth, ExtractQuarter
from django.db.models import Count
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django import forms
from django.urls import path
from django.utils.html import mark_safe
import cloudinary
from alumni.models import *

class AlumniAppAdminSite(admin.AdminSite):
    site_header = "HỆ THỐNG MẠNG XÃ HỘI CỰU SINH VIÊN"
    index_template = 'admin/index.html'

    def get_urls(self):
        return [path('user-stats/', self.stats_view),
                path('post-stats/', self.post_stats_view),] + super().get_urls()

    def stats_view(self, request):
        total_users = User.objects.count()


        view_option = request.GET.get('view', 'year')
        selected_year = request.GET.get('year')


        years = User.objects.annotate(year=ExtractYear('date_joined')).values_list('year', flat=True).distinct().order_by('year')

        if view_option == 'month' and selected_year:
            stats = User.objects.filter(date_joined__year=selected_year).annotate(month=ExtractMonth('date_joined')).values('month').annotate(count=Count('id')).order_by('month')
        elif view_option == 'quarter' and selected_year:
            stats = User.objects.filter(date_joined__year=selected_year).annotate(quarter=ExtractQuarter('date_joined')).values('quarter').annotate(count=Count('id')).order_by('quarter')
        else:
            stats = User.objects.annotate(year=ExtractYear('date_joined')).values('year').annotate(count=Count('id')).order_by('year')

        return TemplateResponse(request, 'admin/stats.html', {
            "total_users": total_users,
            "view_option": view_option,
            "selected_year": selected_year,
            "years": years,
            "stats": stats,
        })

    def post_stats_view(self, request):
        total_posts = Post.objects.count()
        total_invitations = Invitation.objects.count()
        total_surveys = Survey.objects.count()

        total_all = total_posts + total_invitations + total_surveys

        view_option = request.GET.get('view', 'year')
        selected_year = request.GET.get('year')
        post_type = request.GET.get('type', 'post')

        if post_type == 'post':
            model = Post
        elif post_type == 'invitation':
            model = Invitation
        else:
            model = Survey

        years = model.objects.annotate(year=ExtractYear('created_date')).values_list('year', flat=True).distinct().order_by('year')

        if view_option == 'month' and selected_year:
            stats = model.objects.filter(created_date__year=selected_year).annotate(month=ExtractMonth('created_date')).values('month').annotate(count=Count('id')).order_by('month')
        elif view_option == 'quarter' and selected_year:
            stats = model.objects.filter(created_date__year=selected_year).annotate(quarter=ExtractQuarter('created_date')).values('quarter').annotate(count=Count('id')).order_by('quarter')
        else:
            stats = model.objects.annotate(year=ExtractYear('created_date')).values('year').annotate(count=Count('id')).order_by('year')

        return TemplateResponse(request, 'admin/post_stats.html', {
            "total_all": total_all,
            "total_posts": total_posts,
            "total_invitations": total_invitations,
            "total_surveys": total_surveys,
            "view_option": view_option,
            "selected_year": selected_year,
            "post_type": post_type,
            "years": years,
            "stats": stats,
        })


admin_site = AlumniAppAdminSite('myalumni')


class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'avatar', 'cover', 'is_active')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password('ou@123')
        user.is_staff = True  # Thiết lập is_staff là True cho người dùng mới
        if commit:
            user.save()
        return user


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'avatar', 'cover', 'is_active', 'is_staff')


class UserAdmin(BaseUserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    list_display = ['username', 'first_name', 'last_name', 'alumni_id']
    search_fields = ['username', 'first_name', 'last_name', 'alumni_id']
    list_filter = ['username', 'first_name', 'last_name', 'alumni_id']
    readonly_fields = ['my_avatar', 'my_cover']


    def get_fieldsets(self, request, obj=None):
        if not obj:
            return self.add_fieldsets
        return super().get_fieldsets(request, obj)


    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'avatar', 'cover')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'first_name', 'last_name', 'avatar', 'cover', 'is_active'),
        }),
    )

    def my_avatar(self, user):
        if user.avatar:
            if isinstance(user.avatar, cloudinary.CloudinaryResource):
                return mark_safe(f"<img width='150' src='{user.avatar.url}' />")

    def my_cover(self, user):
        if user.cover:
            if isinstance(user.cover, cloudinary.CloudinaryResource):
                return mark_safe(f"<img width='300' src='{user.cover.url}' />")

    class Media:
        css = {
            'all': ['/static/css/style.css']
        }


class GroupAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active']
    search_fields = ['name']
    list_filter = ['is_active']

class PostAdmin(admin.ModelAdmin):
    list_display = ['caption', 'created_date', 'updated_date', 'is_active', 'user']
    search_fields = ['caption', 'content']
    list_filter = ['is_active', 'created_date', 'updated_date']
    readonly_fields = ['created_date', 'updated_date']

    class Media:
        css = {
            'all': ['/static/css/style.css']
        }

class MediaAdmin(admin.ModelAdmin):
    list_display = ['type', 'post', 'invitation']
    search_fields = ['type']
    list_filter = ['type']

class InvitationAdmin(admin.ModelAdmin):
    list_display = ['title', 'location', 'created_date', 'updated_date', 'is_active']
    search_fields = ['title', 'location']
    list_filter = ['is_active', 'created_date', 'updated_date']
    readonly_fields = ['created_date', 'updated_date']

class CommentAdmin(admin.ModelAdmin):
    list_display = ['content', 'post', 'created_date', 'updated_date', 'is_active', 'user']
    search_fields = ['content']
    list_filter = ['is_active', 'created_date', 'updated_date']
    readonly_fields = ['created_date', 'updated_date']

class ActionAdmin(admin.ModelAdmin):
    list_display = ['type', 'post', 'created_date', 'updated_date', 'is_active', 'user']
    search_fields = ['type']
    list_filter = ['type', 'is_active', 'created_date', 'updated_date']
    readonly_fields = ['created_date', 'updated_date']

class SurveyAdmin(admin.ModelAdmin):
    list_display = ['title', 'created_date', 'updated_date', 'is_active', 'user']
    search_fields = ['title', 'content']
    list_filter = ['is_active', 'created_date', 'updated_date']
    readonly_fields = ['created_date', 'updated_date']

class QuestionAdmin(admin.ModelAdmin):
    list_display = ['name', 'survey']
    search_fields = ['name']
    list_filter = ['survey']

class ChoiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'question']
    search_fields = ['name']
    list_filter = ['question']

class AnswerAdmin(admin.ModelAdmin):
    list_display = ['survey', 'choice', 'question', 'created_date', 'updated_date', 'is_active', 'user']
    search_fields = ['survey', 'choice', 'question']
    list_filter = ['survey', 'choice', 'question', 'created_date', 'updated_date', 'is_active']
    readonly_fields = ['created_date', 'updated_date']


admin_site.register(User, UserAdmin)
admin_site.register(Group, GroupAdmin)
admin_site.register(Post, PostAdmin)
admin_site.register(Media, MediaAdmin)
admin_site.register(Invitation, InvitationAdmin)
admin_site.register(Comment, CommentAdmin)
admin_site.register(Action, ActionAdmin)
admin_site.register(Survey, SurveyAdmin)
admin_site.register(Question, QuestionAdmin)
admin_site.register(Choice, ChoiceAdmin)
admin_site.register(Answer, AnswerAdmin)
