.PHONY: install test lint format run docker-build docker-run clean help

# Variables
PYTHON := python3
PIP := pip3
DOCKER_IMAGE := mntrk-api
DOCKER_TAG := latest

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Install dependencies
install: ## Install dependencies
	$(PIP) install -e .
	$(PIP) install -e ".[dev]"

install-prod: ## Install production dependencies only
	$(PIP) install -e ".[production]"

# Run tests
test: ## Run tests
	pytest tests/ -v --cov=. --cov-report=html

# Run linting
lint: ## Run linting
	flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
	mypy . --ignore-missing-imports

# Run development server
run: ## Run development server
	$(PYTHON) app.py

run-prod: ## Run production server
	gunicorn --bind 0.0.0.0:5000 --workers 4 --worker-class gevent "app:create_app()"

# Build Docker image
docker-build: ## Build Docker image
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .

# Run Docker container
docker-run: ## Run Docker container
	docker run -p 5000:5000 --env-file .env $(DOCKER_IMAGE):$(DOCKER_TAG)

# Run with docker-compose
docker-compose-up: ## Start with docker-compose
	docker-compose up --build

docker-compose-down: ## Stop docker-compose
	docker-compose down

# Clean up
clean: ## Clean up build artifacts
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf build/ dist/ .coverage htmlcov/ .pytest_cache/

deploy-staging: ## Deploy to staging
	@echo "Deploying to staging..."
	# Add your staging deployment commands here

deploy-prod: ## Deploy to production
	@echo "Deploying to production..."
	# Add your production deployment commands here

# Format code
format: ## Format code
	black . --line-length 88
	isort . --profile black

db-migrate: ## Run database migrations
	$(PYTHON) -c "from shared.database import create_tables; create_tables()"

db-seed: ## Seed database with sample data
	$(PYTHON) scripts/seed_database.py

logs: ## View application logs
	tail -f logs/mntrk.log

backup-db: ## Backup database
	@echo "Creating database backup..."
	# Add your backup commands here
