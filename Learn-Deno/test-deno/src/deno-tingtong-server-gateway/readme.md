<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">

<h3 align="center">Deno-tingtong-server-gateway</h3>

<!-- <p align="center">
    Upgraded version of frontend-web-apps-beta
    <br /> -->

</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <!-- <li><a href="#prerequisites">Prerequisites</a></li> -->
        <li><a href="#installation">Installation</a></li>
        <li><a href="#testing">Testing</a></li>
        <li><a href="#chacked-All-file">Chacked All File</a></li>
        <li><a href="#docker-build">Docker Build</a></li>
        <li><a href="#docker-compose-build">Docker Compose Build</a></li>
      </ul>
    </li>
    <li>
     <a href="#api-gateway">API GATEWAY</a>
     <ul>
        <li><a href="#healthz">Healthz</a></li>
        <li><a href="#list-all-devices">List All Devices</a></li>
        <li><a href="#list-subscribed-devices">List Subscribed Devices</a></li>
        <li><a href="#list-unsubscribed-devices">List Unsubscribed Devices</a></li>
        <li><a href="#devices-remove-unsubscribed">Remove Unsubscribed Devices</a></li>
        <li><a href="#bc-msg">Bc Msg</a></li>
        <li><a href="#tg-msg">Tg Msg</a></li>
     </ul>
     </li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

<!-- GETTING STARTED -->

## Getting Started

### Installation

1. Run the server
   ```sh
   deno run --allow-net --allow-read --allow-net server.ts
   ```

### Testing

1. Run the test script for testing url
   ```sh
   deno test url_test.ts
   ```
2. Run the test script for testing api

```sh
deno test --allow-env --allow-read --allow-net api.ts
```

### Chacked All file

1. Run the check

```sh
deno fmt && deno lint && deno check **/*.ts
```

### Docker build

```sh
docker build -t deno-api-gateway:server .
```

```sh
docker run -p 5000:5000 deno-api-gateway:server
```

### Docker compose build

```sh
docker compose build tingtong-api-gateway
```

```sh
docker compose up -d tingtong-api-gateway
```

```sh
docker ps
```

## API GATEWAY

### Healthz

```http
host: 0.0.0.0
port: 5000
path: /healthz
METHOD: GET
```

### List All Devices

```http
host: 0.0.0.0
port: 5000
path: /list-devices/all
METHOD: GET
HEAD: {
  content-type: "application/json"
  authorization: Bearer + "YOUR_BEARER_TOKEN_ENCRYPT_UUID"
}
```

### List Subscribed Devices

```http
host: 0.0.0.0
port: 5000
path: /list-devices/subscribed
METHOD: GET
HEAD: {
  content-type: "application/json"
  authorization: Bearer + "YOUR_BEARER_TOKEN_ENCRYPT_UUID"
}
```

### List Unsubscribed Devices

```http
host: 0.0.0.0
port: 5000
path: /list-devices/unsubscribed
METHOD: GET
HEAD: {
  content-type: "application/json"
  authorization: Bearer + "YOUR_BEARER_TOKEN_ENCRYPT_UUID"
}
```

### Remove Unsubscribed Devices

```http
host: 0.0.0.0
port: 5000
path: /devices/remove-unsubscribed 
METHOD: GET
HEAD: {
  content-type: "application/json"
  authorization: Bearer + "YOUR_BEARER_TOKEN_ENCRYPT_UUID"
}
```

### Bc Msg

```http
host: 0.0.0.0
port: 5000
path: /bc-msg
METHOD: POST
HEAD: {
  content-type: "application/json"
  authorization: Bearer + "YOUR_BEARER_TOKEN_ENCRYPT_UUID"
}
BODY: {
  "data": {
     "apps": "skype",
     "title": "New Message",
     "msg": "Test",
     "notification_sound": "shopee_ringtone" --> optional
    }
  }
}
```

### Tg Msg

```http
host: 0.0.0.0
port: 5000
path: /tg-msg
METHOD: POST
HEAD: {
  content-type: "application/json"
  authorization: Bearer + "YOUR_BEARER_TOKEN_ENCRYPT_UUID"
}
BODY: {
    "data": {
        "apps": "skype",
        "title": "New Message",
        "msg": "Test",
        "notification_sound": "tokopedia_ringtone" --> optional
    },
    "include_external_user_ids": ["guest55"]
  }
}
```
