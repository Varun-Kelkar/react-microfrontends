#!/bin/bash
# Vercel Ignored Build Step
# Exit 0 = skip build, Exit 1 = proceed with build
# Docs: https://vercel.com/docs/projects/overview#ignored-build-step

# Directories that should never trigger a build
DOCS_ONLY_DIRS="architecture-decisions|future-plans|interview-questions"

# Get changed files between current and previous commit
CHANGED_FILES=$(git diff --name-only HEAD^ HEAD)

if [ -z "$CHANGED_FILES" ]; then
  echo "✓ No changed files detected — proceeding with build"
  exit 1
fi

# If ALL changed files are in docs-only dirs, skip the build
for file in $CHANGED_FILES; do
  if ! echo "$file" | grep -qE "^($DOCS_ONLY_DIRS)/"; then
    echo "✓ Proceeding with build: $file changed"
    exit 1
  fi
done

echo "⏭ Skipping build: only documentation changed"
exit 0
