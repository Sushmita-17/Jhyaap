"""
Django management command to create an admin user for Jhyaap Station.
Usage: python manage.py create_admin
"""

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Create a new admin user for Jhyaap Station'

    def add_arguments(self, parser):
        parser.add_argument(
            '--phone',
            type=str,
            help='Admin phone number',
        )
        parser.add_argument(
            '--email',
            type=str,
            help='Admin email',
        )
        parser.add_argument(
            '--password',
            type=str,
            help='Admin password',
        )
        parser.add_argument(
            '--interactive',
            action='store_true',
            help='Run in interactive mode',
            default=False,
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🔐 Jhyaap Station Admin User Creation'))
        self.stdout.write(self.style.WARNING('-' * 50))

        if options['interactive'] or not all([options.get('phone'), options.get('password')]):
            # Interactive mode
            phone = input('Enter admin phone number (10 digits): ').strip()
            email = input('Enter admin email: ').strip()
            password = input('Enter admin password: ').strip()
            password_confirm = input('Confirm password: ').strip()

            if password != password_confirm:
                raise CommandError('Passwords do not match.')

            if len(password) < 8:
                raise CommandError('Password must be at least 8 characters.')
        else:
            # Command-line mode
            phone = options['phone']
            email = options['email']
            password = options['password']

        # Validate phone number
        if not phone or len(phone) != 10 or not phone.isdigit():
            raise CommandError('Invalid phone number. Must be 10 digits.')

        if not phone.startswith('9'):
            raise CommandError('Phone number must start with 9 for Nepal.')

        # Validate email
        if not email or '@' not in email:
            raise CommandError('Invalid email address.')

        # Check if user already exists
        if User.objects.filter(phone=phone).exists():
            raise CommandError(f'User with phone {phone} already exists.')

        try:
            # Create admin user
            user = User.objects.create_superuser(
                phone=phone,
                email=email,
                password=password,
            )

            self.stdout.write(self.style.SUCCESS('✅ Admin user created successfully!'))
            self.stdout.write(f'   Phone: {user.phone}')
            self.stdout.write(f'   Email: {user.email}')
            self.stdout.write(f'   User ID: {user.id}')
            self.stdout.write(f'   Role: {user.get_role_display()}')
            self.stdout.write(f'   Staff Status: {user.is_staff}')
            self.stdout.write(self.style.SUCCESS('\n✨ You can now login to the admin panel!'))

        except Exception as e:
            raise CommandError(f'Failed to create admin user: {str(e)}')
