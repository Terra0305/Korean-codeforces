from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Grants admin privileges (is_staff=True, is_superuser=True) to the specified user.'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='The username to grant admin privileges to')

    def handle(self, *args, **options):
        username = options['username']
        try:
            user = User.objects.get(username=username)
            
            if user.is_staff and user.is_superuser:
                self.stdout.write(self.style.SUCCESS(f'User "{username}" is already an admin.'))
                return

            user.is_staff = True
            user.is_superuser = True
            user.save()
            
            self.stdout.write(self.style.SUCCESS(f'Successfully granted admin privileges to user "{username}"'))
            
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User "{username}" does not exist'))
