from rest_framework import serializers
from .models import Alumni

class AlumniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alumni
        fields = ['alumni_id','user','avatar']

