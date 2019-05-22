from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings

# Create your views here.
import datetime

from django.views.decorators.csrf import csrf_exempt
from django_eventstream import send_event
from .models import Rack_1, Rack_2, Rack_3, Rack_4, Rack_5, Rack_6, Rack_7, Rack_8, Rack_9, Rack_10

# Data prediction test
import pandas as pd
from pandas import datetime as pd_datetime
from statsmodels.tsa.arima_model import ARIMA

# Index page
def index(request):
    return render(request, 'dashboard/index.html')

# Grid testing page
def detail(request):
    return render(request, 'dashboard/detail.html')

# Grid testing page
def history(request):
    return render(request, 'dashboard/history.html')

# Get current alarm
def get_current_alarm(request):
    return JsonResponse({'smoke': settings.SMOKE_ALARM, 'movement': settings.MOVEMENT_ALARM})

# Get newest readings by rack and type
def get_newest_readings(request, racks, s_type, amount):
    all_readings = {}
    rack_list = racks.split('-')
    for rack in rack_list:
        db_rack = get_rack(rack)
        readings = db_rack.objects.filter(sensor_type=s_type).order_by('-_id')[:amount]
        all_readings[rack + '-readings'] = format_readings(readings)

    return JsonResponse({'all_readings': all_readings})

# Get readings by rack, date and type
def get_readings_by_date(request, racks, s_type, r_date):
    date = datetime.datetime.strptime(r_date, '%Y-%m-%d').date()
    all_readings = {}
    rack_list = racks.split('-')
    for rack in rack_list:
        db_rack = get_rack(rack)
        readings = db_rack.objects.filter(sensor_type=s_type).filter(date__contains=date).order_by('time').reverse()
        all_readings[rack + '-readings'] = format_readings(readings)

    return JsonResponse({'all_readings': all_readings})

# Get readings by rack and date
def get_all_readings_by_date(request, rack, r_date):
    date = datetime.datetime.strptime(r_date, '%Y-%m-%d').date()
    dbRack = get_rack(rack)
    readings = dbRack.objects.filter(date__contains=date).order_by('time').reverse()
    return JsonResponse({'readings': format_readings(readings)})

# Get readings by rack and date
def get_all_readings_by_range(request, racks, date_from, date_to):
    all_readings = {}
    rack_list = racks.split('-')
    for rack in rack_list:
        db_rack = get_rack(rack)
        readings = db_rack.objects.filter(datetime__gte=date_from, datetime__lte=date_to).order_by('-_id')
        all_readings[rack + '-readings'] = format_readings(readings)
    
    return JsonResponse({'all_readings': all_readings})

# Get readings by rack and date
def get_all_readings_since_date(request, racks, date):
    all_readings = {}
    rack_list = racks.split('-')
    for rack in rack_list:
        db_rack = get_rack(rack)
        readings = db_rack.objects.filter(datetime__gte=date).order_by('-_id')
        all_readings[rack + '-readings'] = format_readings(readings)
    
    return JsonResponse({'all_readings': all_readings})


# Get the right model based on the requested rack
def get_rack(rack):
    return {
        '1': Rack_1,
        '2': Rack_2,
        '3': Rack_3,
        '4': Rack_4,
        '5': Rack_5,
        '6': Rack_6,
        '7': Rack_7,
        '8': Rack_8,
        '9': Rack_9,
        '10': Rack_10
    }[str(rack)]

# Convert db responses to json data
def format_readings(readings):
    data = []
    for reading in readings:
        formatted_reading = {
            'id': str(reading._id),
            'rack': reading.rack,
            'sensor_value': reading.sensor_value,
            'sensor_type': reading.sensor_type,
            'date': reading.date,
            'time': reading.time
        }
        data.append(formatted_reading)

    return data

# Alarm api link
@csrf_exempt
def alarm(request, a_type, alarm):
    if(a_type == 'smoke'):
        settings.SMOKE_ALARM = alarm
    else:
        settings.MOVEMENT_ALARM = alarm
    send_event('alarmChannel', 'message', {'a_type': a_type, 'alarm': alarm})
    return JsonResponse({})

# Data prediction test
# today = str(datetime.datetime.now().date())
# readings = Rack_1.objects.filter(sensor_type='temp').filter(date__contains=today).order_by('time').reverse()
# if(readings):
#     index_data = []
#     sensor_data = []
#     for reading in readings:
#         index_data.insert(0, pd_datetime.strptime(reading.date + ' ' + reading.time, '%Y-%m-%d %H:%M:%S.%f'))
#         sensor_data.insert(0, reading.sensor_value)
#     last_index_data = index_data[-90:]
#     last_sensor_data = sensor_data[-90:]
#     predict_index = pd.date_range(last_index_data[0], periods=60, freq='10S')
#     predict_series = pd.Series(last_sensor_data[0:60], index=predict_index)
#     df = pd.DataFrame({'sensor_value': predict_series})
#     model = ARIMA(df, order=(1, 0, 1))
#     model_fit = model.fit()

#     import itertools
#     p = range(1, 31)
#     d = q = range(0, 6)
#     pdq = list(itertools.product(p, d, q))
#     aic = 1000000
#     results = []
#     i = 0
    
#     for param in pdq:
#         print('working on param ' + str(i) + ' of ' + str(len(pdq)))
#         i += 1
#         try:
#             model = ARIMA(df, order=(param))
#             model_fit = model.fit()
#             model_aic = model_fit.aic
#             if(model_aic < aic):
#                 aic = model_aic
#                 results.append([param, aic])
#         except:
#             continue

#     print(results)

#     print('aic: ' + str(model_fit.aic))
#     predictions = model_fit.forecast(steps=30)
#     print(predict_series[:30])
#     print(predictions)
#     df = pd.DataFrame(data=r_data, columns=['Datetime', 'Sensor_value'])
#     df = df.set_index('Datetime')
#     df = df.asfreq(freq='10S')
#     X = df[:90].Sensor_value
#     train = X[0:60]
#     test= X[:30]
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

    
#     print(pdq)
#     print(predictions[0])
#     print(predictions)
#     print(df.head(5))
#     print(df.index)
#     print(type(df.index))
#     p = d = q = range(0, 2)
#     pdq = list(itertools.product(p, d, q))
#     seasonal_pdq = [(x[0], x[1], x[2], 12) for x in list(itertools.product(p, d, q))]