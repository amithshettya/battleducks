from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Duck(models.Model):
    name=models.CharField(max_length=25)
    height=models.IntegerField()
    width=models.IntegerField()

class Game(models.Model):
    class PlayerTurn(models.IntegerChoices):
        PLAYER_ONE = 1, "Player1",
        PLAYER_TWO = 2, "Player2"

    class GamePhase(models.IntegerChoices):
        PLACEMENT = 1, "Placement Phase",
        GUESS = 2, "Guessing Phase",
        END = 3, "End"
    
    player1_id = models.ForeignKey(User, on_delete=models.PROTECT, related_name="p1_games")
    player2_id = models.ForeignKey(User, on_delete=models.PROTECT, related_name="p2_games")
    player_turn = models.IntegerField(
        choices=PlayerTurn.choices,
        default=PlayerTurn.PLAYER_ONE,
        verbose_name="Player Turn"
    )
    game_phase = models.IntegerField(
        choices=GamePhase.choices,
        default=GamePhase.PLACEMENT,
        verbose_name="Game Phase"
    )
    ducks = models.ManyToManyField(Duck, through='InGameDuck')
    creation_time = models.DateTimeField()

class Player(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE
    )
    wins = models.IntegerField()
    losses = models.IntegerField()

class CellGuesses(models.Model):
    game_id = models.ForeignKey(Game, on_delete=models.CASCADE)
    owner = models.ForeignKey(User, on_delete=models.PROTECT)
    # cell grid location
    x = models.IntegerField()
    y = models.IntegerField()

class InGameDuck(models.Model):
    class DuckOrientation(models.IntegerChoices):
        NORTH = 1, "North",
        EAST = 2, "East",
        SOUTH = 3, "South",
        WEST = 4, "West"
    
    class DuckStatus(models.IntegerChoices):
        ALIVE = 1, "Alive",
        DEAD = 2, "DEAD",
    
    game_id = models.ForeignKey(Game, on_delete=models.CASCADE) #When game is deleted, clean up the ducks
    duck_id = models.ForeignKey(Duck, on_delete=models.CASCADE) #Cascades since if a duck type is removed, should no longer be used in games.
    owner = models.ForeignKey(User, on_delete=models.PROTECT)
    orientation = models.IntegerField(
        choices=DuckOrientation.choices,
        default=DuckOrientation.NORTH,
        verbose_name="Duck Orientation"
    )
    status = models.IntegerField(
        choices=DuckStatus.choices,
        default=DuckStatus.ALIVE,
        verbose_name="Duck Status"
    )
    # x,y locations are the top left corner of the duck
    x = models.IntegerField()
    y = models.IntegerField()