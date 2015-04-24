# Snapcache

Give physical impact to your digital communications.

## Team

  - __Product Owner__: Conor Flannigan
  - __Scrum Master__: Anneke Floor
  - __Project Manager__: Chris Rinaldi

## Table of Contents

1. [Usage](#Usage)
1. [Requirements](#requirements)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Tasks](#tasks)
1. [Team](#team)
1. [Contributing](#contributing)

## Usage

In Browser:

`ionic serve` from command line

Android:

Make sure you have Android SDK installed on the host computer.
Check out [this guide](http://cflann.github.io/2015/03/13/running-ionic-app-on-android.html) for detailed instructions.

    ionic platform add android
    ionic build android
    ionic run android

Emulator:

    ionic platform add [PLATFORM]
    ionic build [PLATFORM]
    ionic emulate [PLATFORM]

iOS (device):

You'll need an Apple Developer account for this. Once you have an account and have set up XCode
with your certificates to enable device testing, you'll want to open the XCode project from
`platform/ios/` and run the build from XCode.

## Requirements

- npm
- Ionic & Cordova
- Cordova InAppBrowser plugin
- Cordova GeoLocation plugin
- Cordova Device plugin
- Cordova Camera plugin
- Cordova Facebook Connect plugin

For generating documentation:

- Gulp
- docco-toc npm module
- gulp-run npm module

## Development

### Installing Dependencies

From within the root directory:

```sh
npm install -g bower
npm install
bower install
ionic plugin add [PLUGIN.LOCATION]
```

### Roadmap

View the project roadmap [here](https://github.com/general-porpoise/snapcache/issues)


## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
