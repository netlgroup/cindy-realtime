Cindy-Realtime
==============
<img align="right" height="192" width="192" src="https://github.com/heyrict/cindy-realtime/blob/master/react-boilerplate/app/images/icon-192x192.png" />

This is a project started in homage to [latethin](http://sui-hei.net) created by [kamisugi(上杉)](http://sui-hei.net/mondai/profile/1).

Cindy is a website specially designed for playing lateral thinking games, with python django as the backend, and nodejs as the frontend.
It also used a lot of new features like GraphQL as WebAPI, WebSocket for auto-updating.

You can access the **[website](https://www.cindythink.com/ja/)**, or find useful informations in the unofficial **[wiki](https://wiki3.jp/cindy-lat)**.

The name of `Cindy` stands for **Cindy Is Not Dead Yet**,
which comes from the popular original character of
[Cindy](http://sui-hei.net/app/webroot/pukiwiki/index.php?%E3%82%B7%E3%83%B3%E3%83%87%E3%82%A3).

<div style="clear:both;" />

Differences between Cindy
-------------------------
Cindy-Realtime inherit its database from [Cindy][1], but its frontend is completely different from [Cindy][1].

Cindy-Realtime has more features:
    - WebSocket, to make a realtime chat-like application
    - React, to UI more convenient, and more convenient for maintainance :smile:
    - GraphQL & Relay, instead of original REST-like API, to make site load faster.

Though it has some drawbacks:
    - Limited old browser support.
    - Unable to deploy on a single-thread PaaS.

For these reasons, I decide to separate this repository out from Cindy.
*Both repos are under support at now*.

Requisitories
-----------
- [Python3.5](http://www.python.org)

    ```bash
    # Windows
    pip install -r requirements.txt

    # Mac or Linux
    sudo -H pip install -r requirements.txt
    ```
- Postgresql (you can opt to use mysql server using mysql.cnf)
- nodejs manager (latest npm or bower)

    ```bash
    cd ./react-boilerplate && npm install

    # Use npm (bower is somewhat alike)
    ```

Develop
-------
1. Clone this repo.

    ```bash
    git clone https://github.com/heyrict/cindy-realtime
    ```

2. [Install requisitories](#requisitories).
    *Make sure `python` and `pip` exists in your PATH. You may want to use `python3` or `pip3` instead.*

3. Configure your Postgresql database
    - Open postgresql, create a user and a database, grant all previlidges to it.

      ```postgresql
      CREATE DATABASE cindy;
      CREATE USER cindy WITH PASSWORD 'cindy';
      ALTER ROLE cindy SET client_encoding TO 'utf8';
      ALTER ROLE cindy SET default_transaction_isolation TO 'react committed';
      ALTER ROLE cindy SET timezone TO 'UTC';
      GRANT ALL PRIVILEGES ON DATABASE cindy TO cindy;
      \q;
      ```

    - Edit `POSTGREDB_SETTINGS` in `./cindy/security.py` file according to your settings.
      A template is [here](./cindy/security.py.template).
    - Have django generate the necessary data for you

      ```bash
      python3 manage.py makemigrations && python3 manage.py migrate
      python3 manage.py compilemessages
      make schema
      ```

4. Build develop dependencies for nodejs

   ```bash
   cd ./react-boilerplate && npm run build:dll && npm run serve
   ```

5. Run server on your localhost.

   ```bash
   daphne cindy.asgi:application
   ```

6. Open the link appeared in your terminal/cmd with a browser.


Deploy
------
**Note**: This is one method of deployment using nginx under ubuntu16.04LTS. It's definitely OK to use other methods.
Also, note that all the configuration files need to be adjusted to you system (e.g. change username and /path/to/cindy, etc.)

1. Go through step 1 to 3 in [Develop](#Develop)

2. Build Production bundles for nodejs

   ```bash
   cd ./react-boilerplate && npm run build
   ```

3. Configure Nginx

   ```bash
   # Note that you may need su privileges to do this
   cp ./config/nginx-cindy-config /etc/nginx/sites-available/cindy
   ln -s /etc/nginx/sites-available/cindy /etc/nginx/sites-enabled
   # Obtaining SSL Certificate using certbot
   # Skip this command if you want to disable https protocol
   # (you may have to manually edit nginx-cindy-config to allow only http traffic)
   certbot --nginx -d cindy.com -d www.cindy.com
   service nginx restart
   ```

4. Configure daphne

   ```bash
   cp ./config/daphne.service /etc/systemd/system/
   systemctl enable daphne
   service daphne start
   ```

5. (Optionally) Configure Nginx with prerender instead of step 3 to 4

   ```bash
   # Note that you may need su privileges to do this
   ## Configure nginx
   cp ./config/nginx-cindy-config-nginx-cindy-config-with-prerender /etc/nginx/sites-available/cindy
   ln -s /etc/nginx/sites-available/cindy /etc/nginx/sites-enabled
   service nginx restart
   ## Configure daphne and prerender server
   cp ./config/prerender.service ./config/daphne.service /etc/systemd/system/
   systemctl enable daphne
   systemctl enable prerender
   service daphne start
   service prerender start
   ```


Contributers
------------
- [kamisugi(上杉)](http://sui-hei.net/mondai/profile/1)
- [kamisan(上参)](https://github.com/pb10001)
- [shakkuri(しゃっくり)](http://sui-hei.net/mondai/profile/11752)
- [sarubobo(さるぼぼ)](http://sui-hei.net/mondai/profile/6664)
- [ernath(エルナト)](http://sui-hei.net/mondai/profile/15741)
