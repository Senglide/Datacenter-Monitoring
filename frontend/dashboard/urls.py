# Link urls to views
from django.urls import path

from . import views

# App name
app_name = 'dashboard'

# Routes
urlpatterns = [
    path('', views.index, name='index'),
    path('update_readings', views.update_readings)
]