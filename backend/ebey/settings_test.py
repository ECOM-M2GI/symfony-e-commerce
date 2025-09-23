# ruff: noqa: F405,F403

# Import all settings from the main settings file
from .settings import *

# Override only the database configuration for tests
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}
