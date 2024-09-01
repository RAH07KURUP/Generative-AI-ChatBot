from django.contrib import admin
from .models import ChatSession, ChatHistory

# Register your models here.
admin.site.register(ChatSession)
admin.site.register(ChatHistory)

