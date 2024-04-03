from django.apps import AppConfig


class BattleducksConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "battleducks"

    # Override ready to import signals
    def ready(self):
        import battleducks.signals
