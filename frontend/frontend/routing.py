from channels.routing import ProtocolTypeRouter, URLRouter
import dashboard.routing

application = ProtocolTypeRouter({
    'http': URLRouter(dashboard.routing.urlpatterns),
})