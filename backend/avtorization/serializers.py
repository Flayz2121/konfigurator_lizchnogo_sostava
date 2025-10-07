from rest_framework import serializers, viewsets, status
from django.contrib.auth import get_user_model
from .models import Kurses, Persons
from .pagination import ReactAdminPagination
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
import re
from .validators import validate_username_with_spaces

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']  # обязательно должен быть username!

    def validate_username(self, value):
        validate_username_with_spaces(value)
        return value.strip()  # Нормализация: убираем пробелы в начале/конце


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny] # IsAuthenticated не нужно т.к для авторизации
    pagination_class = ReactAdminPagination  # тот же формат для списка

#-----------------------------------------------------------------------------

class FullUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)  # write_only=True ---> чтобы пользователь мог только читать пароль

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'list_password', 'is_active', 'is_superuser', 'is_staff']

    def validate_username(self, value):
        validate_username_with_spaces(value)
        return value.strip()  # Нормализация: убираем пробелы в начале/конце

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class FullUserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]  # <-- Важно!
    queryset = User.objects.all()
    serializer_class = FullUserSerializer
    pagination_class = ReactAdminPagination

#-----------------------------------------------------------------------------

class KursesSerializer(serializers.ModelSerializer):
    user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='user')

    def validate_user_id(self, value):
        if not User.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("User does not exist")
        return value

    class Meta:
        model = Kurses
        fields = ['id', 'user_id', 'name_kurs', 'number_of_kurs', 'p_s', 'n_l', 'b', 'n', 'y', 'k', 'o']

class KursesViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]  # <-- Важно!
    queryset = Kurses.objects.all()
    serializer_class = KursesSerializer
    pagination_class = ReactAdminPagination

#-----------------------------------------------------------------------------

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Добавим нужные поля в токен
        token['username'] = user.username
        token['is_superuser'] = user.is_superuser
        token['is_active'] = user.is_active
        return token

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_status(request):
    return Response({
        "is_superuser": request.user.is_superuser,
        "username": request.user.username
    })

#-----------------------------------------------------------------------------
class KursesFilterSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()  # <- Явно указываем

    class Meta:
        model = Kurses
        fields = ['id', 'number_of_kurs']

    def validate(self, data):
        """Validate that id and number_of_kurs (if provided) match an existing Kurses instance."""
        kurs_id = data.get('id')
        number_of_kurs = data.get('number_of_kurs')

        if not kurs_id:
            raise serializers.ValidationError("Поле 'id' обязательно.")

        try:
            kurs_instance = Kurses.objects.get(id=kurs_id)
        except Kurses.DoesNotExist:
            raise serializers.ValidationError("Курс с таким ID не существует.")

        # If number_of_kurs is provided, ensure it matches the Kurses instance
        if number_of_kurs is not None and number_of_kurs != kurs_instance.number_of_kurs:
            raise serializers.ValidationError(
                f"Указанный number_of_kurs ({number_of_kurs}) не соответствует курсу с ID {kurs_id} "
                f"(ожидалось {kurs_instance.number_of_kurs})."
            )

        # Return only the id for further processing
        return {'id': kurs_id}


class PersonsSerializer(serializers.ModelSerializer):
    Kurses = KursesFilterSerializer()  # Вложенный ввод/вывод
    user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='user')

    class Meta:
        model = Persons
        fields = ['id', 'Kurses', 'user_id', 'rank', 'name', 'destination', 'reason', 'absenceTime']

    def create(self, validated_data):
        kurses_data = validated_data.pop('Kurses')
        kurs_id = kurses_data['id']  # id is validated by KursesFilterSerializer

        try:
            kurs_instance = Kurses.objects.get(id=kurs_id)
        except Kurses.DoesNotExist:
            raise serializers.ValidationError("Курс с таким ID не существует.")

        return Persons.objects.create(Kurses=kurs_instance, **validated_data)

    def update(self, instance, validated_data):
        kurses_data = validated_data.pop('Kurses', None)
        if kurses_data:
            kurs_id = kurses_data['id']
            try:
                kurs_instance = Kurses.objects.get(id=kurs_id)
                instance.Kurses = kurs_instance
            except Kurses.DoesNotExist:
                raise serializers.ValidationError("Курс с таким ID не существует.")

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    def to_representation(self, instance):
        """Корректный вывод вложенного курса"""
        rep = super().to_representation(instance)
        rep['Kurses'] = KursesFilterSerializer(instance.Kurses).data
        return rep


class PersonsViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Persons.objects.all()
    serializer_class = PersonsSerializer
    pagination_class = ReactAdminPagination


