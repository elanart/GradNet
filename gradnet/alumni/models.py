from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField
from django.utils import timezone
from datetime import timedelta
from ckeditor.fields import RichTextField

# Create your models here.


class User(AbstractUser):
    avatar = CloudinaryField(null=True)
    cover = CloudinaryField(null=True)
    alumni_id = models.CharField(max_length=20, null=True)

    def save(self, *args, **kwargs):
        if self.is_staff and not self.is_superuser and not self.password:
            self.set_password('ou@123')
        super().save()

    def check_password_expiry(self):
        if self.is_staff:
            if timezone.now() - self.date_joined > timedelta(hours=24):
                self.is_active = False
                self.save()

    def __str__(self):
        return f'{self.last_name} {self.first_name}'


class Group(models.Model):
    name = models.CharField(max_length=50)
    member = models.ManyToManyField(User)
    is_active = models.BooleanField(default=True)

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
    caption = models.CharField(max_length=100)
    content = RichTextField()
    allow_comments = models.BooleanField(default=True)

    def __str__(self):
        return self.caption


class Media(models.Model):
    class MEDIA_TYPES(models.IntegerChoices):
        IMAGE = 1, 'Image',
        VIDEO = 2, 'Video',
    type = models.IntegerField(choices=MEDIA_TYPES.choices)
    file = CloudinaryField('gradnet_media')
    post = models.ForeignKey('Post', on_delete=models.CASCADE, related_name='post_media', null=True, blank=True)
    invitation = models.ForeignKey('Invitation', on_delete=models.CASCADE, related_name='invitation_media', null=True, blank=True)

    class Meta:
        verbose_name_plural = "Media"


# Survey model: https://pypi.org/project/django-form-surveys/#features


class Invitation(BaseModel):
    title = models.CharField(max_length=100)
    content = models.TextField()
    location = models.CharField(max_length=255)
    recipients_users = models.ManyToManyField(User, related_name='recipients_users')
    recipients_groups = models.ManyToManyField(Group, related_name='recipients_groups')

    def __str__(self):
        return self.title


class Interaction(BaseModel):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)

    class Meta:
        abstract = True


class Comment(Interaction):
    content = RichTextField()


class Action(Interaction):
    class Type(models.IntegerChoices):
        LIKE = 1, "Like"
        LOVE = 2, "Love"
        HAHA = 3, "Haha"
        WOW = 4, "Wow"
        SAD = 5, "Sad"
        ANGRY = 6, "Angry"

    type = models.IntegerField(choices=Type.choices, default=Type.LIKE)

    class Meta:
        unique_together = ('post', 'user', 'type')


class Survey(BaseModel):
    title = models.CharField(max_length=255)
    content = RichTextField(null= True)

    def __str__(self):
        return self.title


class Question(models.Model):
    name = models.CharField(max_length=255)
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, null=True, related_name='questions')

    def __str__(self):
        return self.name


class Choice(models.Model):
    name = models.CharField(max_length=255)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return self.name


class Answer(BaseModel):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE)
    choice = models.ForeignKey(Choice, on_delete=models.CASCADE, null=True)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, null=True)