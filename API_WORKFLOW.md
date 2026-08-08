# API Workflow Guide

## Overview
This project includes a fixture-based API automation workflow for the ReqRes public API. The implementation is aligned with the existing Playwright TypeScript framework and uses a dedicated API fixture so tests follow the same pattern as UI tests.

## Structure
- API fixture: src/fixtures/apiFixture.ts
- API client: src/api/BaseApi.ts
- API tests: src/tests/api/reqresApi.spec.ts
- Environment file: .env

## Prerequisites
1. Install dependencies:
   - npm install
2. Make sure the following environment variables are available in .env:
   - API_BASE_URL=https://reqres.in
   - REQRES_API_KEY=your_api_key
   - or API_TOKEN=your_api_key

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
- Tests use fixture-based access through the API fixture and step-based logging for better visibility during execution.
- The API workflow logs each major step, including request context setup, URL building, request dispatch, and response handling.
