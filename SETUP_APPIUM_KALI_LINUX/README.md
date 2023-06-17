This post shows how to install android sdk tools without Android Studio. We might need to do in many cases like setting up an CI machine ..etc

We need java, android(tools, build tools), gradle. 

## Table of contents

1. [Setup server](#setup-server)
   1. [System Requirements](#system-requirements)
   1. [Install java Jdk](#install-java-jdk)
   1. [Install sdk tools](#install-sdk-tools)
   1. [Build-tools installation](#build-tools-installation)
   1. [Path Export](#path-export)
   1. [Extras](#extras)
   1. [Install Gradle](#install-gradle)
1. [Test](#test)
1. [Update machine](#update-machine)
1. [Trouble Shoot](#trouble-shoot)



# Setup server

#### System Requirements
1. 64-bit distribution capable of running 32-bit applications
2. GNU C Library (glibc) 2.19 or later
3. 3 GB RAM minimum, 8 GB RAM recommended (For massive projects min 8GB is required for decent fast builds)
4. 2 GB of available disk space minimum

#### Install java Jdk
1. check if Jdk exists
```bash 
javac -version
```
2. if none installed, install java JDK (not JRE)
```bash 
sudo apt-get install openjdk-8-jdk 
```


#### Install sdk tools
1. Go to https://developer.android.com/studio/index.html scroll till the end and get url of latest linux command tools. 
>  Current version(https://dl.google.com/android/repository/sdk-tools-linux-3859397.zip)
2. create some folder and cd there and get the tools 
```bash 
wget https://dl.google.com/android/repository/sdk-tools-linux-3859397.zip
```
>  in my case i created var/dev/android and download 
3. Unzip the file. if unzip is not installed, install it
```bash 
apt install unzip
unzip fileName -d dirPathWhereTo
# fileName => downloaded file name
# dirPathWhereTo => directory where to unzip
```
4. Install platform tools and others. cd to tools in unzipped folder and install all sdk packages
```bash 
./android update sdk --no-ui
```

> step 4 takes time and this cmd has no progress ui representation, so please be patient

> now both SDK and platform_tools are installed

#### Build-tools installation
1. To get the list of files, cd to tools/bin and execute
```bash 
./sdkmanager --list
```
2. now install the build tools that you need
```bash 
# change version based on your requirements
./sdkmanager "build-tools;26.0.1"
```
3. if you need to install multiple tools from sdkManager use coma separated string
```bash 
./sdkmanager "build-tools;26.0.1,platforms;android-25"
```

#### Path Export
1. Edit etc/profile. So on every Login these get executed.
```bash 
nano /etc/profile
```
2. add these commands.
```bash 
# change it according to your path and version
export PATH=${PATH}:var/dev/android/sdk/platform-tools:var/dev/android/sdk/tools:var/dev/android/sdk/build-tools/26.0.1/
export ANDROID_HOME=var/dev/android/sdk/
```
3. save it
4. logout (exit ssh) and Login (open a new shell), then type "echo $PATH", "echo $ANDROID_HOME" to verify
```bash 
echo $PATH
echo $ANDROID_HOME
```

#### Extras
1. If you get "~/.android/repositories.cfg file not found" error too often. Then execute this command to create that file,this file is of no use but just to avoid a warning which pops too often.
```bash 
touch ~/.android/repositories.cfg
```

#### Install Gradle
1. find the gradle version you need
  1. from android plugin version get the gradle version => (https://developer.android.com/studio/releases/gradle-plugin.html)
  2. or can also be found from gradle-wrapper.properties
2. get gradle link based on version you need from https://gradle.org/releases/
```bash 
wget https://services.gradle.org/distributions/gradle-4.1-all.zip
```
3. make new directory
```bash 
mkdir /opt/gradle
```
4. unzip gradle to that location (/opt/gradle)
5. To /etc/profile file. add the following command (similar to [Path Export](#path-export) step-1,2)
```bash 
export GRADLE_HOME="/opt/gradle/gradle-4.1/bin
```
6. Add the gradle to path as well => just add $GRADLE_HOME for the line which we added earlier in [Path Export](#path-export) step-2.
```bash 
# so now the file will have these lines 
export ANDROID_HOME=var/dev/android/sdk/
export GRADLE_HOME="/opt/gradle/gradle-4.1/bin
export PATH=${PATH}:var/dev/android/sdk/platform-tools:var/dev/android/sdk/tools:var/dev/android/sdk/build-tools/26.0.1/:$GRADLE_HOME
```
7. logout and login again => verify gradle.
```bash 
gradle -v
```

# Test
```bash 
# Check gradle version - To Verify gradle path
gradle -v

# Verify jre path
java -version

# Verify jdk path
javac -version

# Verify tools path
android list device

# Verify platform-tools path
adb devices
```

# Update machine
1. Update all tools and platform-tools
```bash 
android update sdk --no-ui
```
2. Get new build tools
```bash 
sdkmanager "build-tools;required_version"
```
3. Download and unzip gradle
4. Edit /etc/profile based on new versions. (similar to [Path Export](#path-export) step-1,2)
5. Logout and Login and perform test

# Trouble Shoot
1. Check if machine has enough Power (Ram/CPU's).
```markdown
Common errors due to Less Ram
    1. Gradle build daemon disappeared unexpectedly (it may have been killed or may have crashed)
    2. OpenJDK 64-Bit Server VM warning: INFO: os::commit_memory(0x0000000089b00000, 524288, 0) failed; error='Cannot allocate memory' (errno=12)
```
```bash 
# To check Ram usage
free -m

# More detail Ram/CPU Usage
top

# Check no of CPU's
lscpu | egrep '^Thread|^Core|^Socket|^CPU\('
```
2. Check if machine has internet access
```bash 
ping 8.8.8.8
```
3. Check if android build tools version in machine match with your project. If not update
```bash 
sdkmanager "build-tools;required_version"
``` 
4. Check if machine has all required environmental variables.
```bash 
printenv | grep environmental_variable_name
```
