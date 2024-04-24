from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField
from django.utils import timezone
from datetime import timedelta

# Create your models here.


class Alumni(models.Model):
    alumni_id = models.CharField(max_length=255)
    user = models.ForeignKey('User', related_name='alumni', on_delete=models.CASCADE)


class User(AbstractUser):

    class Role(models.IntegerChoices):
        ADMIN = 1, "Admin"
        LECTURER = 2, "Lecturer"
        ALUMNI = 3, "Alumni"

    avatar = CloudinaryField(null=True)
    cover = CloudinaryField(null=True)
    role = models.IntegerField(choices=Role.choices, default=Role.ALUMNI)

    def save(self, *args, **kwargs):
        if self.role.__eq__(User.Role.LECTURER) and not self.password: # Điều kiện kiểm tra mật khẩu chưa có khi mới tạo tài khoản để thiết lập giá trị mặc định
            self.set_password('ou@123')  # Mật khẩu sẽ được băm tự động
        super().save()

    def check_password_expiry(self):
        if self.role.__eq__(User.Role.LECTURER):
            if timezone.now() - self.date_joined > timedelta(hours=24):
                self.is_active = False
                self.save()


class Group(models.Model):
    name = models.CharField(max_length=255)
    member = models.ManyToManyField(User)
    
    def __str__(self):
        return self.name


class BaseModel(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        abstract = True

class Post(BaseModel):
    content = models.TextField()
    

class Image(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    image = CloudinaryField()


class Survey(BaseModel):
    title = models.CharField(max_length=255)
    
    
class SurveyQuestion(models.Model):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE)
    text = models.CharField(max_length=255)


class SurveyAnswer(models.Model):
    question = models.ForeignKey(SurveyQuestion, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()


class Invitation(BaseModel):
    class Status(models.IntegerChoices):
        PENDING = 1, "Pending"
        ACCEPTED = 2, "Accepted"
        DECLINED = 3, "Declined"
        EXPIRED = 4, "Expired"
    
    title = models.CharField(max_length=255)
    content = models.TextField()
    location = models.CharField(max_length=255)
    status = models.IntegerField(choices=Status.choices, default=Status.PENDING)
    recipients_users = models.ManyToManyField(User, related_name='recipients_users')
    recipients_groups = models.ManyToManyField(Group)


class Interaction(BaseModel):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)

    class Meta:
        abstract = True


class Comment(Interaction):
    content = models.CharField(max_length=255)


class Action(Interaction):
    class Meta:
        unique_together = ('post', 'user')