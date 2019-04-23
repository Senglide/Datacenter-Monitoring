# Link urls to views
from django.urls import path

from . import views

# App name
app_name = 'dashboard'

# Routes
urlpatterns = [
    path('', views.index, name='index'),
    path('testing', views.testing, name='testing'),
    path('get_newest_readings/<int:rack>/<str:s_type>/<int:amount>', views.get_newest_readings),
    path('get_todays_readings/<int:rack>/<str:s_type>', views.get_todays_readings),
    path('alarm/<int:alarm>', views.alarm)
]