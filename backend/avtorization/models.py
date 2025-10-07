from django.contrib.auth.models import AbstractUser
from django.db import models
from .validators import validate_username_with_spaces

class CustomUser(AbstractUser):
    username = models.CharField(
        max_length=150,
        unique=True,
        validators=[validate_username_with_spaces],
        verbose_name='Никнейм',
        help_text='Никнейм может содержать буквы, цифры, пробелы и символы @/./+/-/_ (3-50 символов).'
    )
    list_password = models.CharField(max_length=20)

    def __str__(self):
        return str(self.username or self.email or f"User #{self.pk}")

class Kurses(models.Model):
    user =  models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    name_kurs = models.CharField(max_length=10)
    number_of_kurs = models.IntegerField()
    p_s = models.IntegerField()
    n_l = models.IntegerField()
    b = models.IntegerField()
    n = models.IntegerField()
    y = models.IntegerField()
    k = models.IntegerField()
    o = models.IntegerField()
    objects = models.Manager()

    def __str__(self):
        return self.name_kurs

class Persons(models.Model):
    Kurses = models.ForeignKey(Kurses, on_delete=models.CASCADE)
    user =  models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    rank = models.CharField(max_length=30)
    name = models.CharField(max_length=40)
    destination = models.CharField(max_length=50)
    reason = models.CharField(max_length=30)
    absenceTime = models.DateField()

    def __str__(self):
        return f"{self.rank} {self.name}"