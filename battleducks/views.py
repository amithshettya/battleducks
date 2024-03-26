from django.shortcuts import render

# Create your views here.
def index(request):
    return render(request, "battleducks/index.html")

def room(request, room_name):
    return render(request, "battleducks/room.html", {"room_name": room_name})

def duck_placement(request, room_name, user_id):
    context = {
        "room_name": room_name,
        "user_id": user_id, 
    }
    return render(request, "battleducks/duck_placement.html", context)