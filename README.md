# Frontend Development Guide

Welcome to the frontend development team! This guide will help you get started with the project and establish a smooth workflow for collaboration.

## Getting Started

### Initial Setup

First, clone the repository to your local machine:

bash
git https://github.com/lorenzoworx/wdm-group-project.git
cd wdm-group-project



### Switch to Frontend Branch

Once you've cloned the repository, switch to the frontend branch:

bash
git checkout frontend


### Create Your Personal Branch

Each team member should create their own branch from the frontend branch. Use the naming convention yourname_frontend:

bash
git checkout -b yourname_frontend


Replace yourname with your actual name. For example:
- dhanya_frontend
- sanjukktha_frontend
- gowtham_frontend

## Daily Workflow

### Before Starting Work

Always pull the latest changes from the frontend branch before you start working:

bash
git checkout frontend
git pull origin frontend
git checkout yourname_frontend
git merge frontend


This ensures you're working with the most up-to-date code and helps prevent merge conflicts later.

### While Working

Make your changes and commit them regularly with clear, descriptive messages:

bash
git add .
git commit -m "Description of changes made"


### Pushing Your Work

When you're ready to share your work, push your branch to the remote repository:

bash
git push origin yourname_frontend


If this is your first push on this branch, you might need to set the upstream:

bash
git push -u origin yourname_frontend


### Merging to Frontend Branch

Once your work is complete and tested, create a pull request to merge your changes into the frontend branch. This allows the team to review your code before it becomes part of the main frontend codebase.

## Best Practices

- *Commit often*: Make small, logical commits with clear messages
- *Pull regularly*: Update your branch with the latest frontend changes at least once a day
- *Communicate*: Let the team know when you're working on a specific feature
- *Test before pushing*: Always test your changes locally before pushing
- *Review pull requests*: Help review your teammates' code to maintain quality

## Quick Reference

| Action | Command |
|--------|---------|
| Clone repository | git clone <repository-url> |
| Switch to frontend | git checkout frontend |
| Create your branch | git checkout -b yourname_frontend |
| Pull latest changes | git pull origin frontend |
| Push your work | git push origin yourname_frontend |
| Check current branch | git branch |
| Check status | git status |

## Need Help?

If you encounter any issues or have questions about the workflow, feel free to reach out. Happy coding!
