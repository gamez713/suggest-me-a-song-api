# 🎵 Suggest Me a Song API

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white)
![SuperTest](https://img.shields.io/badge/SuperTest-Testing-blue)

## Overview

A REST API for submitting, reviewing, and managing song recommendations. Built with TypeScript, Express, and Node.js, the project demonstrates RESTful API design, request validation, centralized error handling, and comprehensive integration testing.

## Architecture

```text
Routes → Controllers → Services → JSON Storage
```

- **Routes** define the API endpoints and map requests to controllers.
- **Controllers** validate requests, handle errors, and return HTTP responses.
- **Services** contain the application's business logic and data operations.
- **JSON Storage** persists song suggestion data between application restarts.
  git

## Features

- Create song suggestions
- Retrieve all song suggestions
- Retrieve a suggestion by ID
- Update suggestion status (pending, approved, rejected)
- Delete suggestions
- Input validation
- Centralized error handling
- Comprehensive CRUD integration test suite

## API Endpoints

| Method | Endpoint         | Description                 |
| ------ | ---------------- | --------------------------- |
| GET    | /suggestions     | Retrieve all suggestions    |
| GET    | /suggestions/:id | Retrieve a suggestion by ID |
| POST   | /suggestions     | Create a suggestion         |
| PATCH  | /suggestions/:id | Update suggestion status    |
| DELETE | /suggestions/:id | Delete a suggestion         |

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

## Running Tests

This project includes integration tests for all CRUD endpoints using Vitest and SuperTest.

Run the full integration test suite:

```bash
npm test
```

## Future Improvements

- Replace JSON file storage with a database
- Add Spotify API integration
- Deploy the API to the cloud
- Add authentication and user accounts
- Create a frontend application for submitting suggestions
