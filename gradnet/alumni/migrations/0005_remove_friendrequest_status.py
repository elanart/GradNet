# Generated by Django 5.0.4 on 2024-05-02 13:55

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('alumni', '0004_alter_friendrequest_status'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='friendrequest',
            name='status',
        ),
    ]