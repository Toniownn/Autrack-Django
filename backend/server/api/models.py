from django.db import models

# Create your models here.
class User(models.Model):
    type_user = (('S', 'Student'), ('T', 'Teacher'))
    username = models.CharField(max_length=15, null=False, primary_key=True)
    password = models.CharField(max_length=128, null=False)
    first_name = models.CharField(max_length=50, null=False)
    last_name = models.CharField(max_length=50, null=False)
    middle_name = models.CharField(max_length=50, null=True, blank=True)
    type = models.CharField(max_length=1, choices=type_user, null=False)
