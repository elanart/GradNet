from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField
from django.utils import timezone
from datetime import timedelta
from ckeditor.fields import RichTextField

# Create your models here.


class User(AbstractUser):
    class Role(models.IntegerChoices):
        ADMIN = 1, "Admin"
        LECTURER = 2, "Lecturer"
        ALUMNI = 3, "Alumni"

    avatar = CloudinaryField(null=True)
    cover = CloudinaryField(null=True)
    role = models.IntegerField(choices=Role.choices, default=Role.ALUMNI)
    friends = models.ManyToManyField('self', symmetrical=True, blank=True)
    alumni_id = models.CharField(max_length=20, null=True)

    def save(self, *args, **kwargs):
        if self.role == User.Role.LECTURER and not self.password: 
            self.set_password('ou@123')
        super().save()

    def check_password_expiry(self):
        if self.role == User.Role.LECTURER:
            if timezone.now() - self.date_joined > timedelta(hours=24):
                self.is_active = False
                self.save()
                
    def __str__(self):
        return f'{self.last_name} {self.first_name}'
                
                
class FriendRequest(models.Model):
    class Status(models.IntegerChoices):
        PENDING = 1, "Pending"
        ACCEPTED = 2, "Accepted"
        DECLINED = 3, "Declined"
        EXPIRED = 4, "Expired"

    sender = models.ForeignKey(User, related_name='sent_friend_requests', on_delete=models.CASCADE)
    recipient = models.ForeignKey(User, related_name='received_friend_requests', on_delete=models.CASCADE)
    created_date = models.DateTimeField(auto_now_add=True)
    status = models.IntegerField(choices=Status.choices, default=Status.PENDING)


class Group(models.Model):
    name = models.CharField(max_length=50)
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
    content = RichTextField()
    

class Image(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    image = CloudinaryField()


# Survey model: https://pypi.org/project/django-form-surveys/#features


class Invitation(BaseModel):
    class Status(models.IntegerChoices):
        PENDING = 1, "Pending"
        ACCEPTED = 2, "Accepted"
        DECLINED = 3, "Declined"
        EXPIRED = 4, "Expired"
    
    title = models.CharField(max_length=100)
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
        unique_together = ('post', 'user')