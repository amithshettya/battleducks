from django.shortcuts import render

# Create your views here.
def index(request):
    return render(request, "battleducks/index.html")

def room(request, room_name):
    return render(request, "battleducks/room.html", {"room_name": room_name})
