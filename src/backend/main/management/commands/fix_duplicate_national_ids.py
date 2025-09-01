from django.core.management.base import BaseCommand
from django.db.models import Count
from main.models import User

class Command(BaseCommand):
    help = 'Find and fix duplicate national_ids'

    def handle(self, *args, **options):
        self.stdout.write("Checking for duplicate national_ids...")
        
        # Find users with national_id that are not null or empty
        users_with_national_id = User.objects.exclude(
            national_id__isnull=True
        ).exclude(
            national_id=''
        )
        
        self.stdout.write(f"Total users with national_id: {users_with_national_id.count()}")
        
        # Group by national_id and count
        duplicates = users_with_national_id.values('national_id').annotate(
            count=Count('national_id')
        ).filter(count__gt=1)
        
        if duplicates:
            self.stdout.write(f"Found {len(duplicates)} duplicate national_ids:")
            
            for duplicate in duplicates:
                national_id = duplicate['national_id']
                count = duplicate['count']
                self.stdout.write(f"National ID '{national_id}' is used by {count} users:")
                
                users = User.objects.filter(national_id=national_id)
                for i, user in enumerate(users):
                    self.stdout.write(f"  {i+1}. User ID: {user.id}, Username: {user.username}")
                    
                    # For duplicates, clear the national_id of all but the first user
                    if i > 0:
                        user.national_id = None
                        user.save()
                        self.stdout.write(f"     -> Cleared national_id for user {user.username}")
                        
            self.stdout.write(self.style.SUCCESS("Fixed duplicate national_ids"))
        else:
            self.stdout.write("No duplicate national_ids found")
            
        # Also check for any existing null national_ids that might be causing issues
        users_with_empty_national_id = User.objects.filter(
            national_id__in=['', None]
        )
        self.stdout.write(f"Users with empty/null national_id: {users_with_empty_national_id.count()}")
