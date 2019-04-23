from django.shortcuts import render
from django.http import JsonResponse

# Create your views here.
import datetime

from django.views.decorators.csrf import csrf_exempt
from django_eventstream import send_event
from .models import Rack_1

# Data prediction test
import pandas as pd
from pandas import datetime as pd_datetime
from statsmodels.tsa.arima_model import ARIMA

# Index page
def index(request):
    return render(request, 'dashboard/index.html')

# Grid testing page
def testing(request):
    return render(request, 'dashboard/testing.html')

# Get newest readings
def get_newest_readings(request, rack, s_type, amount):
    dbRack = getRack(rack)
    readings = dbRack.objects.filter(sensor_type=s_type).order_by('-_id')[:amount]
    data = []
    for reading in readings:
        data.append({
            'sensor_value': reading.sensor_value,
            'date': reading.date,
            'time': reading.time
        })
    json_data = {'readings': data}
    return JsonResponse(json_data)

def getRack(rack):
    if(rack == 1):
        return Rack_1

# Get newest readings
def get_todays_readings(request, rack, s_type):
    today = str(datetime.datetime.now().date())
    dbRack = getRack(rack)
    readings = dbRack.objects.filter(sensor_type=s_type).filter(date__contains=today).order_by('time').reverse()
    data = []
    for reading in readings:
        data.append({
            'sensor_value': reading.sensor_value,
            'date': reading.date,
            'time': reading.time
        })
    json_data = {'readings': data}
    return JsonResponse(json_data)

# Alarm api link
@csrf_exempt
def alarm(request, alarm):
    send_event('alarmChannel', 'message', {'alarm': alarm})
    return JsonResponse({})

# Data prediction test
# today = str(datetime.datetime.now().date())
# readings = Rack_1.objects.filter(sensor_type='temp').filter(date__contains=today).order_by('time').reverse()
# if(readings):
#     r_data = []
#     for reading in readings:
#         r_data.insert(0, [
#             pd_datetime.strptime(reading.date + ' ' + reading.time, '%Y-%m-%d %H:%M:%S.%f'),
#             reading.sensor_value
#         ])
#     df = pd.DataFrame(data=r_data, columns=['Datetime', 'Sensor_value'])
#     df = df.set_index('Datetime')
#     X = df[:90].Sensor_value
#     train = X[0:60]
#     test= X[60:]
#     model = ARIMA(train, order=(1, 1, 1))
#     model_fit = model.fit()
#     predictions = model_fit.forecast(steps=30)
#     import itertools
#     p=d=q=range(0,30)
#     pdq = list(itertools.product(p,d,q))
#     aic = 1000000
#     results = []
#     for param in pdq:
#         try:
#             model = ARIMA(train, order=(param))
#             model_fit = model.fit()
#             if(model_fit.aic < aic):
#                 aic = model_fit.aic
#                 results.append([param, aic])
#         except:
#             continue

#     print(results)

    
    # print(pdq)
    # print(predictions[0])
    # print(predictions)
    # print(df.head(5))
    # print(df.index)
    # print(type(df.index))
# p = d = q = range(0, 2)
# pdq = list(itertools.product(p, d, q))
# seasonal_pdq = [(x[0], x[1], x[2], 12) for x in list(itertools.product(p, d, q))]