from django import forms
from .models import User
from django.contrib.auth import authenticate


class RegisterForm(forms.Form):
    username = forms.CharField(max_length=50)
    first_name = forms.CharField(max_length=50)
    last_name = forms.CharField(max_length=50)
    middle_name = forms.CharField(max_length=50, required=False)
    type = forms.ChoiceField(choices=[('S', 'Student'), ('T', 'Teacher')])
    password = forms.CharField(widget=forms.PasswordInput)
    confirm = forms.CharField(widget=forms.PasswordInput)

    def clean_username(self):
        username = self.cleaned_data.get("username")
        if username and User.objects.filter(username=username).exists():
            raise forms.ValidationError("Username already exists.")
        return username

    def clean(self):
        cleaned_data = super().clean()
        pwd = cleaned_data.get("password")
        confirm = cleaned_data.get("confirm")

        # Only check passwords if both are provided
        if pwd and confirm and pwd != confirm:
            raise forms.ValidationError("Passwords do not match.")

        return cleaned_data

    def save(self):
        data = self.cleaned_data

        user = User.objects.create(
            username=data["username"],
            first_name=data["first_name"],
            last_name=data["last_name"],
            middle_name=data.get("middle_name", ""),
            type=data["type"],
            password=data["password"]
        )

        return user

class LoginForm(forms.Form):
    username = forms.CharField(max_length=150)
    password = forms.CharField(widget=forms.PasswordInput)

    def clean(self):
        cleaned_data = super().clean()
        username = cleaned_data.get("username")
        password = cleaned_data.get("password")

        if username and password:
            try:
                user = User.objects.get(username=username)
                if user.password != password:
                    raise forms.ValidationError("Invalid username or password")
            except User.DoesNotExist:
                raise forms.ValidationError("Invalid username or password")

            self.user = user

        return cleaned_data

def save(self):
    data = self.cleaned_data
    user = User.objects.create(
        username=data["username"],
        first_name=data["first_name"],
        last_name=data["last_name"],
        middle_name=data.get("middle_name", ""),
        type=data["type"],
        password=data["password"]  # store plain text
    )
    return user

class EditProfileForm(forms.Form):
    first_name = forms.CharField(max_length=50, required=False)
    last_name = forms.CharField(max_length=50, required=False)
    middle_name = forms.CharField(max_length=50, required=False)

    def __init__(self, *args, **kwargs):
        self.username = kwargs.pop('username', None)
        super().__init__(*args, **kwargs)

    def clean(self):
        cleaned_data = super().clean()
        if not self.username:
            raise forms.ValidationError("User not authenticated.")
        self.cleaned_data = {k: v for k, v in cleaned_data.items() if v not in [None, '']}
        return self.cleaned_data

    def save(self):
        if not self.cleaned_data:
            raise forms.ValidationError("No valid fields to update.")
        try:
            user = User.objects.get(username=self.username)
            for field, value in self.cleaned_data.items():
                setattr(user, field, value)
            user.save()
            return user
        except User.DoesNotExist:
            raise forms.ValidationError("User not found.")