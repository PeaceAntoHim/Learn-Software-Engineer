<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">

<h3 align="center">Inversify Appium</h3>

</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#projects-structure">Projects structure</a></li>
      </ul>
    </li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

<!-- GETTING STARTED -->

## Getting Started

### Prerequisites

- Have appium be installed (for running in local)
- Run this command bellow to download tools needed

  ```
  $ npm install -g appium@next
  $ appium driver install uiautomator2
  $ npm install -g appium-doctor
  ```

- Run this command to start the appium server
  ```
  appium --allow-cors --session-override --relaxed-security  --base-path /wd/hub
  ```
- Install Application to be tested from playstore

  1. <a target="_blank" href="https://play.google.com/store/apps/details?id=com.github.android&hl=en">Github Application</a>
  2. <a target="_blank" href="https://play.google.com/store/search?q=lio&c=apps&hl=en">Tabular Application</a>

- Clone the repo

  ```
  git clone https://github.com/VizzedBuzzed/inversify-appium.git
  ```

### Projects Structure

```
──src
    ├───android
    ├───appium
    ├───components
    ├───configs
    ├───controllers
    ├───interfaces
    ├───libs
    ├───services
    └───types
```
