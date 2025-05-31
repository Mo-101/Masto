from setuptools import setup, find_packages

setup(
    name="mntrk",
    version="1.0.1",
    description="Mastomys Natalensis Observatory Unified API",
    author="MoStar Industries",
    author_email="support@mo-overlord.tech",
    url="https://www.mo-overlord.tech/",
    packages=find_packages(),
    include_package_data=True,
    package_data={"": ["swagger.yaml"]},
    install_requires=[
        "connexion[swagger-ui]>=3.0.0",
        "flask>=2.0.0",
        "flask-cors>=4.0.0",
        "pydantic>=2.0.0",
        "PyYAML>=6.0.0",
        "python-dotenv>=1.0.0",
        "requests>=2.28.0",
        "httpx>=0.24.0",
        "sqlalchemy>=2.0.0",
        "asyncpg>=0.28.0",
        "psycopg2-binary>=2.9.0",
        "scikit-learn>=1.3.0",
        "pandas>=2.0.0",
        "numpy>=1.24.0",
        "firebase-admin>=6.0.0",
        "google-cloud-firestore>=2.11.0",
        "uvicorn[standard]>=0.23.0",
        "gunicorn>=21.0.0"
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "pytest-cov>=4.0.0",
            "black>=23.0.0",
            "flake8>=6.0.0",
            "mypy>=1.0.0"
        ],
        "production": [
            "gunicorn>=21.0.0",
            "gevent>=23.0.0"
        ]
    },
    entry_points={
        'console_scripts': [
            'mntrk=app:main',
            'mntrk-server=app:main'
        ]
    },
    python_requires=">=3.8",
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    long_description="Unified MNTRK API for Mastomys habitat analysis, detection patterns, Lassa fever modeling, and AI integration. Supports real-time monitoring, predictive analytics, and outbreak management for public health applications.",
    long_description_content_type="text/plain"
)
