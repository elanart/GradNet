from django.contrib import admin
from datetime import datetime

from django.contrib import admin
from django.contrib.auth.decorators import permission_required
from django.template.response import TemplateResponse
from django.urls import path
from rest_framework import permissions


from .models import *

from django.urls import path
# Register your models here.
admin.site.register(User)