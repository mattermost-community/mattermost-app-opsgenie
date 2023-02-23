# Mattermost/OpsGenie Integration

- [Feature summary](#feature-summary)
- [Set up](#set-up)
  - [Installation HTTP](#installation-http)
  - [Installation on Mattermost Cloud](#installation-mattermost-cloud)
  - [Configuration](#configuration)
- [Admin guide](#admin-guide)
  - [Slash commands](#slash-commands)
- [End user guide](#end-user-guide)
  - [Get started](#get-started)
  - [Use /OpsGenie commands](#use-genie-commands)
- [Development environment](#development-environment)
  - [Manual installation](#manual-installation)
  - [Install dependencies](#install-dependencies)
  - [Run the local development environment](#run-the-local-development-environment)
  - [Run the local development environment with Docker](#run-the-local-development-environment-with-docker)

This application allows you to integrate OpsGenie with your Mattermost instance to notify you of new and updated alerts, as well as allow you to create, manage, and assign new alerts without leaving Mattermost.

# Feature summary

**OpsGenie to Mattermost notifications:** Link Mattermost channels with OpsGenie Teams to receive notifications about new and updated alerts.

# Set up

## Install with HTTP

To install, as a Mattermost system admin user, run the command `/apps install http OPSGENIE_API` in any channel. The `/genie` command should be available after the configuration has been successfully installed.

The `OPSGENIE_API` should be replaced with the URL where the OpsGenie API instance is running. Example: `/apps install http https://myapp.com/manifest.json`

## Install on Mattermost Cloud

To install, as a Mattermost system admin user, run the command `/apps install listed genie` in any channel. The `/genie` command should be available after the configuration has been successfully installed.

## Configure your integration

After [installing](#installation) the app:

1. Open your OpsGenie profile and follow the next steps to retrieve your credentials needed to link to your Mattermost instance.
2. Go to **Settings > Integrations** and select **Add Integration**.
3. Within the **Add Integration** menu, select **API**.
4. Update the integration name and access, and select **Save Integration**.
5. Copy the given API Key.
6. Return to Mattermost.
7. As a Mattermost system admin user, run the `/genie configure` command.
8. In the configuration modal, enter your API Key.

# Admin guide

## Slash commands

- `/genie configure`: This command will enable all the other commands; it asks the administrator for an API key (which will be used to execute calls to OpsGenie’s API).

# End user guide

## Get started

## Use `/genie` commands

- `/genie help`: This command will show all current commands available for this application.
- `/genie alert create`: Allow any user to create a new alert.
- `/genie alert note`: Add a note to an existing alert.
- `/genie alert close`: Close an existing alert.
- `/genie alert ack`: Acknowledge an existing alert.
- `/genie alert unack`: Unacknowledge an existing alert.
- `/genie alert snooze`: Snooze an existing alert for a period of time.
- `/genie alert assign`: Assign an existing to a mattermost team member.
- `/genie alert own`: Take ownership of an existing alert (assign alert to yourself).
- `/genie alert priority`: Set the priority of an existing alert.
- `/genie alert list`: Get a list of the existing alerts.
- `/genie team list`: Get a list of the existing teams.
- `/genie subscription add`: Create a new subscription for notifications by choosing a team and a channel. You can subscribe to more than one team per channel.
- `/genie subscription list`: Show the list of all subscriptions made in all of your channels.
- `/genie subscription remove`: Will allow you to remove a subscription. No more notifications from that team will be received in that channel.

# Development environment

## Manual installation

- Download the latest repository release.

### Run the local development environment

- You need to have at least Node version 15 and maximum version 18 installed. You can download the latest LTS version of Node for your operating system here: https://nodejs.org/es/download/

### Install dependencies

- Move to the project directory or execute `cd` command to the project directory and execute `npm install` with a terminal to download all dependency libraries.

```
$ npm install
```

- Update the environment configuration file. The `.env` file must be modified or added to set the environment variables, it must be in the root of the repository.

```
file: .env

PROJECT=mattermost-opsgenie-app
PORT=4002
HOST=http://localhost:4002
```

Variable definition

- PROJECT: When executing the project with Docker using the `.build.sh` file, this variable will be used for the name of the container.
- PORT: The port number the OpsGenie integration is listening to.
- HOST: The OpsGenie API usage URL.

* Finally, the project must be executed by running the following command:

```
$ npm run dev
```

Or, you can use the Makefile command:

```
$ make watch
```

### Run the local development environment with Docker

- You need to have Docker installed. You can find the necessary steps to install Docker for the following operating systems:

[Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
[Mac](https://docs.docker.com/desktop/mac/install/)
[Windows](https://docs.docker.com/desktop/windows/install/)

- Once you have Docker installed, run the `make run-server` command to create the API container and expose it locally or on the server, depending on the case required.

```
$ make run-server
```

When the container is created correctly, the API runs at `http://127.0.0.1:4002`. If Mattermost is running on the same machine, run the following slash command in Mattermost to install the app:

```
/apps install http http://127.0.0.1:4002
```

To stop the container, run the following command:

```
$ make stop-server
```
