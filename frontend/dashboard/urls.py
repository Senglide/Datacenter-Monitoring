# Link urls to views
from django.urls import path

from . import views

# App name
app_name = 'dashboard'

# Routes
urlpatterns = [
    path('', views.index, name='index'),
    path('detail', views.detail, name='detail'),
    path('get_newest_readings/<str:racks>/<str:s_type>/<int:amount>', views.get_newest_readings),
    path('get_readings_by_date/<str:racks>/<str:s_type>/<str:r_date>', views.get_readings_by_date),
    path('get_all_readings_by_date/<int:rack>/<str:r_date>', views.get_all_readings_by_date),
    path('alarm/<str:a_type>/<int:alarm>', views.alarm)
]