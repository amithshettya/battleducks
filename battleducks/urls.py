from django.urls import path

from . import views


urlpatterns = [
    path("", views.index, name="index"),
    path("room/<str:room_name>", views.room, name="room"),
    path("room/<str:room_name>/duck_placement/<int:user_id>", views.duck_placement, name="duck_placement"),
]