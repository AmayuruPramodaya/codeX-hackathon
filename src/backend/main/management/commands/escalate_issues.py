from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Q
from main.models import Issue, User, IssueEscalation
from datetime import timedelta


class Command(BaseCommand):
    help = 'Escalate issues that have exceeded their response deadline'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be escalated without actually escalating',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        now = timezone.now()
        
        # Find issues that need escalation
        issues_to_escalate = Issue.objects.filter(
            Q(status='pending') | Q(status='in_progress'),
            next_escalation_date__lte=now,
            current_level__in=['grama_niladhari', 'divisional_secretary', 'district_secretary', 'provincial_ministry']
        )
        
        if dry_run:
            self.stdout.write(f"Would escalate {issues_to_escalate.count()} issues:")
            for issue in issues_to_escalate:
                self.stdout.write(f"  - {issue.reference_number}: {issue.current_level} -> {self.get_next_level(issue.current_level)}")
            return
        
        escalated_count = 0
        
        for issue in issues_to_escalate:
            if self.escalate_issue(issue):
                escalated_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully escalated {escalated_count} issues')
        )

    def get_next_level(self, current_level):
        """Get the next escalation level"""
        hierarchy = {
            'grama_niladhari': 'divisional_secretary',
            'divisional_secretary': 'district_secretary',
            'district_secretary': 'provincial_ministry',
            'provincial_ministry': 'national_ministry',
            'national_ministry': 'prime_minister'
        }
        return hierarchy.get(current_level, current_level)

    def escalate_issue(self, issue):
        """Escalate an issue to the next level"""
        try:
            current_handler = issue.current_handler
            current_level = issue.current_level
            next_level = self.get_next_level(current_level)
            
            if next_level == current_level:
                # Already at the highest level
                self.stdout.write(f"Issue {issue.reference_number} is already at the highest level")
                return False
            
            # Find appropriate user at next level
            next_users = User.objects.filter(
                user_type=next_level,
                is_approved=True
            )
            
            # Filter by jurisdiction for lower levels
            if next_level in ['divisional_secretary', 'district_secretary', 'provincial_ministry']:
                if next_level == 'divisional_secretary':
                    next_users = next_users.filter(
                        province=issue.province,
                        district=issue.district,
                        ds_division=issue.ds_division
                    )
                elif next_level == 'district_secretary':
                    next_users = next_users.filter(
                        province=issue.province,
                        district=issue.district
                    )
                elif next_level == 'provincial_ministry':
                    next_users = next_users.filter(province=issue.province)
            
            next_user = next_users.first()
            
            if not next_user:
                self.stdout.write(f"No user found at level {next_level} for issue {issue.reference_number}")
                # Set escalation date to retry later
                issue.next_escalation_date = timezone.now() + timedelta(hours=6)
                issue.save()
                return False
            
            # Create escalation record
            IssueEscalation.objects.create(
                issue=issue,
                from_user=current_handler,
                to_user=next_user,
                from_level=current_level,
                to_level=next_level,
                reason=f"Auto-escalated due to no response within deadline"
            )
            
            # Update issue
            issue.current_handler = next_user
            issue.current_level = next_level
            issue.escalation_count += 1
            issue.status = 'escalated' if next_level != 'prime_minister' else 'pending'
            
            # Set next escalation date (3 days for most levels, 7 days for national/PM)
            escalation_days = 7 if next_level in ['national_ministry', 'prime_minister'] else 3
            issue.next_escalation_date = timezone.now() + timedelta(days=escalation_days)
            
            issue.save()
            
            self.stdout.write(f"Escalated {issue.reference_number} from {current_level} to {next_level}")
            return True
            
        except Exception as e:
            self.stdout.write(f"Error escalating issue {issue.reference_number}: {str(e)}")
            return False
