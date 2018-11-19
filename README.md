# Home Control Monitor

Home Control Monitor is the portion of the Home Control application which sits
on your remote Linux server to listen for shutdown/restart commands. Without it,
you would only be able to see the status of your monitor (accomplished via pings)
and send magic packets to your server for start up. In order to use the full
functionality of Home Control, this application must be installed on each server
you would like to monitor. Please see the [Home Control page](https://github.com/jessereitz/home-control)
for more information.

## Installation

For now, Home Control Monitor must be installed manually. This will hopefully
be updated to be available as a Linux Snap in the near future.

Before you get started, you will need sqlite3 installed, if you don't already
have it. If you're on a Debian/Ubuntu system, simply run
`$ sudo apt install sqlite3`.

Once you have that taken care of, follow these steps:

1. Download the Home Control Monitor source files via a git clone or grab the
latest release here on the repo. For the easiest installation, I recommend
placing the directory in `/usr/local/bin` as this is what the included service
unit file will expect. You can change this if you wish, just be sure to edit the
`home-control-monitor.service` file to match what your preferred location.
```shell
    $ sudo git clone https://github.com/jessereitz/home-control-monitor.git /usr/local/bin
```

2. Install dependencies via npm from the home-control-monitor directory.
```shell
    $ npm install
```

3. Run the initialization script from the home-control-monitor directory. This
will walk you through creating a user database (see below) and a user account
and will copy the service unit file to `/etc/systemd/system` and enable/start
the service. (This must be done as sudo in order to copy the `.service` file
into `etc/systemd/system` and enable/start the service)
```shell
    $ sudo npm run initialize
```

4. You should be all set to go! If you would like to add another user or if you
forget your username/password, simply run the create-user script:
```shell
  $ npm run create-user
```

## A Note on User Accounts

Please note that the user accounts in Home Control Monitor are stored locally on
the server you are trying to monitor. They are **completely unrelated** to the
user accounts for your main Home Control installation running on your hub server.

For instance, let's say you have a single server (let's call it Server0) you
would like to remain powered off until you need to access it. You install
Home Control on a Raspberry Pi and Home Control Monitor on Server0. You will
have to create a user account on **BOTH** the Raspberry Pi *and* Server0. You
will use the Raspberry Pi account on the initial web page sign in and the Server0
credentials whenever you restart or power off Server0. If you add another server
(Server1) with Home Control Monitor on it, you will need to create another
account specific to it.

The reason it is done this way is twofold: 1) it adds an extra (admittedly small) bit of
security and, 2) it cuts down on code-complexity. Because each server maintains
its own accounts, you can restrict destructive behavior (restarts/shutdowns) to
certain users while still allowing them to monitor/start the server. It also
keeps us from sending Linux user passwords to and from servers and attempting to
do some crazy ssh tomfoolery.
