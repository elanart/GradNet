# Generated by Django 5.0.4 on 2024-04-27 08:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('alumni', '0005_alter_alumni_user'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='alumni',
            name='id',
        ),
        migrations.AddField(
            model_name='alumni',
            name='name',
            field=models.CharField(default='ho va ten', max_length=100),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='alumni',
            name='alumni_id',
            field=models.CharField(max_length=255, primary_key=True, serialize=False),
        ),
    ]