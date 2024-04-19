from django.urls import path

from . import views


urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login, name="login"),
    path("room/<str:room_name>", views.room, name="room"),
    path("room/<str:room_name>/save_ducks", views.save_ducks, name="save_ducks"),
    path("room/<str:room_name>/game_state", views.get_game_state, name="get_game_state"),
    path("create-room", views.create_room, name="create-room"),
    path("leaderboard", views.leaderboard, name="leaderboard")
]