from djongo import models

# Create your models here.

# Abstract base model for the other models
class Abstract_Reading_Collection(models.Model):
    _id = models.AutoField(primary_key=True, null=False)
    rack = models.IntegerField()
    sensor = models.IntegerField()
    sensor_type = models.CharField(max_length=15)
    sensor_value = models.IntegerField()
    datetime = models.DateTimeField()

    class Meta:
        abstract = True

# Model for the Rack 1 collection
class Rack_1(Abstract_Reading_Collection):
    pass

# Model for the Movement collection
class Movement(Abstract_Reading_Collection):
    pass

# Model for the Smoke collection
class Smoke(Abstract_Reading_Collection):
    pass