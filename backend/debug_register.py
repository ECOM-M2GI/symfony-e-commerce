import os

import django
from django.core.management import call_command
from django.urls import reverse
from rest_framework.test import APIClient

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ebey.settings_test")

django.setup()

call_command("makemigrations", interactive=False, verbosity=0)
call_command("migrate", run_syncdb=True, interactive=False, verbosity=0)
call_command("flush", interactive=False, verbosity=0)

client = APIClient()
url = reverse("register")
payload = {
    "username": "alice",
    "email": "alice@example.com",
    "password": "StrongPass!123",
    "password_confirm": "StrongPass!123",
    "first_name": "Alice",
    "last_name": "Doe",
}
resp = client.post(url, data=payload, format="json")
print("status=", resp.status_code)
print("data=", resp.json())
