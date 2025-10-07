from django.contrib import admin
from django import forms
from .models import CustomUser, Kurses, Persons
from django.contrib.auth.forms import UserCreationForm

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ['username','password','list_password','is_superuser','is_staff']

@admin.register(CustomUser)
class YourUserAdmin(admin.ModelAdmin):
    form = CustomUserCreationForm
    list_display = ['username', 'password', 'list_password', 'is_superuser', 'is_staff']

try:
    admin.site.register(CustomUser, YourUserAdmin)
except admin.sites.AlreadyRegistered:
    print("модель пользователя зарегистрирована")


#-----------------------------------------------------------------------------


class KursesCreationForm(forms.ModelForm):
    class Meta:
        model = Kurses
        fields = ['user','name_kurs','number_of_kurs','p_s','n_l','b','n','y','k','o']

@admin.register(Kurses)
class KursesAdmin(admin.ModelAdmin):
    form = KursesCreationForm
    list_display = ['name_kurs', 'user', 'number_of_kurs','p_s','n_l','b','n','y','k','o']

try:
    admin.site.register(Kurses, KursesAdmin)
except admin.sites.AlreadyRegistered:
    print("модель курсов зарегистрирована")

#-----------------------------------------------------------------------------

class PersonsCreationForm(forms.ModelForm):
    class Meta:
        model = Persons
        fields = ['rank', 'name','Kurses','user','destination','reason','absenceTime']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Сортируем курсы по номеру
        self.fields['Kurses'].queryset = Kurses.objects.all().order_by('name_kurs')

@admin.register(Persons)
class PersonsAdmin(admin.ModelAdmin):
    form = PersonsCreationForm
    list_display = ['name','rank', 'Kurses','user', 'destination', 'reason', 'absenceTime']

try:
    admin.site.register(Persons, PersonsAdmin)
except admin.sites.AlreadyRegistered:
    print("модель персон зарегистрирована")

