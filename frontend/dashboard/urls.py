# Link urls to views
from django.urls import path

from . import views

# App name
app_name = 'dashboard'

# Routes
urlpatterns = [
    path('', views.index, name='index'),
    path('detail', views.detail, name='detail'),
    path('history', views.history, name='history'),
    path('get_newest_readings/<str:racks>/<str:s_type>/<int:amount>', views.get_newest_readings),
    path('get_readings_by_date/<str:racks>/<str:s_type>/<str:r_date>', views.get_readings_by_date),
    path('get_all_readings_by_date/<int:rack>/<str:r_date>', views.get_all_readings_by_date),
    path('get_all_readings_by_range/<str:racks>/<int:date_from>/<int:date_to>', views.get_all_readings_by_range),
    path('get_all_readings_since_date/<str:racks>/<int:date>', views.get_all_readings_since_date),
    path('alarm/<str:a_type>/<int:alarm>', views.alarm),
    path('get_current_alarm', views.get_current_alarm)
]