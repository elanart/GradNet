# Generated by Django 5.0.4 on 2024-05-20 04:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('alumni', '0010_remove_invitation_status_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='allow_comments',
            field=models.BooleanField(default=True),
        ),
    ]
