from rest_framework import generics, serializers,  status
from .serializers import UserSerializer, KursesSerializer
from .models import CustomUser
from rest_framework.response import Response
from rest_framework import viewsets
import json
import logging
from .models import Kurses


class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

logger = logging.getLogger(__name__)

class KursesViewSet(viewsets.ModelViewSet):
    queryset = Kurses.objects.all()
    serializer_class = KursesSerializer
    filterset_fields = ['name_kurs']

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except serializers.ValidationError as e:
            logger.error(f"Validation error in KursesViewSet.create: {str(e)}", exc_info=True)
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error in KursesViewSet.create: {str(e)}", exc_info=True)
            return Response({'detail': f'Internal Server Error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            sort = request.query_params.get('sort', '["id", "ASC"]')
            sort_field, sort_order = json.loads(sort)
            if sort_order == 'DESC':
                sort_field = f'-{sort_field}'
            queryset = queryset.order_by(sort_field)
            range_param = request.query_params.get('range', '[0, 24]')
            start, end = json.loads(range_param)
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(queryset[start:end+1], request)
            serializer = self.get_serializer(page, many=True)
            response = Response(serializer.data)
            response['Content-Range'] = f'kurses {start}-{min(end, queryset.count())}/{queryset.count()}'
            return response
        except Exception as e:
            logger.error(f"Error in KursesViewSet.list: {str(e)}", exc_info=True)
            return Response({'detail': f'Internal Server Error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)