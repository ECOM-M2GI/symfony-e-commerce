import os
import pytest
import django

# Ensure Django is configured for tests before importing DRF
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ebey.settings_test")
django.setup()

# Run migrations (including sync for apps without migrations) on the SQLite test DB
from django.core.management import call_command  # noqa: E402

call_command("makemigrations", interactive=False, verbosity=0)
call_command("migrate", run_syncdb=True, interactive=False, verbosity=0)
# Ensure a clean DB at the start of the test session
call_command("flush", interactive=False, verbosity=0)

from rest_framework.test import APIClient  # noqa: E402


@pytest.fixture
def api_client():
    return APIClient()


# Clean database before each test to isolate state (since we are not using pytest-django)
@pytest.fixture(autouse=True)
def _clean_db_between_tests():
    call_command("flush", interactive=False, verbosity=0)
    yield
