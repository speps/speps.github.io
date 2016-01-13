#!/bin/bash

echo -e "\033[0;32mDeploying updates to GitHub...\033[0m"

# Build the project.
hugo -t speps

# Add changes to git.
git add -A

# Commit changes.
git commit || exit 1

# Push source and build repos.
git push origin sources
git subtree push --prefix=public origin master