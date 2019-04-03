from django.shortcuts import render
from django.http import JsonResponse

# Create your views here.

# Index page
def index(request):
    return render(request, 'dashboard/index.html')

# Get newest readings
def get_newest_readings():
    readings = Rack_1.objects.filter(sensor_type='temp').order_by('datetime').reverse()[:30]
    data = []
    for reading in readings:
        data.append({
            'sensor_value': reading.sensor_value,
            'datetime': reading.datetime
        })
    json_data = {'readings': data}
    return JsonResponse(json_data)