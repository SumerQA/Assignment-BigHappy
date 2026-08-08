# API Workflow Guide

## Overview
This project includes a lightweight API automation workflow for the ReqRes public API. The implementation is kept in the API layer so the rest of the framework remains unchanged.

## Structure
- API client: src/api/BaseApi.ts
- API tests: src/tests/api/reqresApi.spec.ts
- Environment file: .env

## Prerequisites
1. Install dependencies:
   - npm install
2. Make sure the following environment variables are available in .env:
   - API_BASE_URL=https://reqres.in  
   - API_TOKEN=your_api_key

## What the workflow does
The API workflow supports:
- GET request to fetch a list of users
- POST request to create a new user
- PUT request to update an existing user
- DELETE request to remove a user

## How to run
Run the API suite with:

```bash
npx playwright test src/tests/api/reqresApi.spec.ts
```

## Notes
- The base URL is configured through environment variables.
- The API helper reads the token from REQRES_API_KEY first and falls back to API_TOKEN.
- Tests use step-based logging for better visibility during execution.
