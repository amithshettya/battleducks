from django.urls import path

from . import views


urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login, name="login"),
    path("room/<str:room_name>", views.room, name="room"),
    path("room/<str:room_name>/place_ducks/<int:user_id>", views.place_ducks, name="place_ducks"),
    path("create-room", views.create_room, name="create-room"),
    path("leaderboard", views.leaderboard, name="leaderboard")
]