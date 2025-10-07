# your_app/validators.py
from django.core.exceptions import ValidationError
import re

def validate_username_with_spaces(value):
    # Разрешаем буквы, цифры, пробелы и символы @ . + - _
    if not re.match(r'^[\w\s@.+_-]+$', value):
        raise ValidationError('Никнейм может содержать только буквы, цифры, пробелы и символы @/./+/-/_.')
    # Запрещаем пробелы в начале или конце
    if value.startswith(' ') or value.endswith(' '):
        raise ValidationError('Никнейм не может начинаться или заканчиваться пробелом.')
    # Запрещаем множественные пробелы подряд
    if '  ' in value:
        raise ValidationError('Никнейм не может содержать несколько пробелов подряд.')
    # Минимальная и максимальная длина (например, 3-50 символов)
    if len(value) < 3:
        raise ValidationError('Никнейм должен содержать минимум 3 символа.')
    if len(value) > 50:
        raise ValidationError('Никнейм не может быть длиннее 50 символов.')