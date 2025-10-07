from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class ReactAdminPagination(PageNumberPagination):
    page_size = 100  # настройка по желанию

    def get_paginated_response(self, data):
        response = Response(data)
        start = self.page.start_index() - 1
        end = self.page.end_index() - 1
        total = self.page.paginator.count
        response['Content-Range'] = f'items {start}-{end}/{total}'
        return response
