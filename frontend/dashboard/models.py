from djongo import models

# Create your models here.

# Abstract base model for the other models
class Abstract_Reading_Collection(models.Model):
    _id = models.AutoField(primary_key=True, null=False)
    rack = models.IntegerField()
    sensor = models.IntegerField()
    sensor_type = models.CharField(max_length=15)
    sensor_value = models.IntegerField()
    datetime = models.IntegerField()
    date = models.DateField()
    time = models.TimeField()

    class Meta:
        abstract = True

# Model for the Rack 1 collection
class Rack_1(Abstract_Reading_Collection):
    pass

# Model for the Rack 2 collection
class Rack_2(Abstract_Reading_Collection):
    pass

# Model for the Rack 3 collection
class Rack_3(Abstract_Reading_Collection):
    pass

# Model for the Rack 4 collection
class Rack_4(Abstract_Reading_Collection):
    pass

# Model for the Rack 5 collection
class Rack_5(Abstract_Reading_Collection):
    pass

# Model for the Rack 6 collection
class Rack_6(Abstract_Reading_Collection):
    pass

# Model for the Rack 7 collection
class Rack_7(Abstract_Reading_Collection):
    pass

# Model for the Rack 8 collection
class Rack_8(Abstract_Reading_Collection):
    pass

# Model for the Rack 9 collection
class Rack_9(Abstract_Reading_Collection):
    pass

# Model for the Rack 10 collection
class Rack_10(Abstract_Reading_Collection):
    pass

# Model for the Movement collection
class Movement(Abstract_Reading_Collection):
    pass

# Model for the Smoke collection
class Smoke(Abstract_Reading_Collection):
    pass