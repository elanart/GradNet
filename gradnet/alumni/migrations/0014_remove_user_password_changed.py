# Generated by Django 5.0.4 on 2024-05-23 07:21

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('alumni', '0013_user_password_changed'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='password_changed',
        ),
    ]