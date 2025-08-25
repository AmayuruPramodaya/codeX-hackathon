#!/bin/bash

# Automatic Issue Escalation Script
# This script should be run via cron job every hour to check for issues that need escalation

# Change to the project directory
cd /path/to/your/project/backend

# Activate virtual environment (if using one)
# source venv/bin/activate

# Run the escalation command
python manage.py escalate_issues

# Log the execution
echo "Escalation check completed at $(date)" >> /var/log/govson_escalation.log
