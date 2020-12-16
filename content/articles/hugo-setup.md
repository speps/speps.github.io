+++
date = "2016-01-24T11:26:57Z"
title = "Setup Hugo with Travis CI and GitHub Pages"
toc = true
+++

## Disclaimer

**This article is now obsolete as TravisCI added severe limitations to their free tier. Use GitHub Actions which is [what I used to replace the workflow](https://github.com/speps/speps.github.io/blob/sources/.github/workflows/main.yml) described here. Main difference with the usual tutorials is that I commit the `hugo` binary so I know what version is used and the website isn't broken by Hugo updates.**

This article aims to introduce and show how to generate your [Hugo](http://gohugo.io) site on [Travis CI](http://travis-ci.org) and then deploy it automatically to [GitHub Pages](https://pages.github.com).

## Have your Hugo website ready

The first step is to have your Hugo website working locally at least. It should build without errors. The default output folder is `public`. NOTE: if you changed that using `publishdir` in your config file please change it in the following steps.

For more information, please refer to [Hugo's documentation](https://gohugo.io/overview/quickstart/).

## GitHub Pages setup

For GitHub Pages, there are a few options available. You can have User/Organization Pages or Project Pages. The steps presented here should work for both but the different branch names might differ depending on how you want to organize your repository.

Usually you have a branch with the website sources and another one with the website generated files. In my case, I have a `sources` branch and a `master` branch because I'm using User Pages (same applies to Organization Pages). For Project Pages, you'd probably have the sources in the `master` branch (in a sub-folder for example) and then the generated files in the `gh-pages` branch (as required by GitHub).

The important thing is to have your sources in the right branch in the first place. For User/Organization pages, it should be any branch other than `master`. For Project Pages, it should be any branch other than `gh-pages`.

There are plenty of tutorials on how to create a new branch in Git and submit it to your GitHub account. For more information, please refer to [User, Organization, and Project Pages](https://help.github.com/articles/user-organization-and-project-pages/).

## Travis CI setup

On Travis CI, you can build and deploy your website automatically.

### Obtain the deploy.sh script

You need this script in your root folder :

https://github.com/X1011/git-directory-deploy/blob/master/deploy.sh

### Generate an access token for GitHub

You need to generate a new "Personal Access Token" from this GitHub page : https://github.com/settings/tokens

Click on "Generate new token" and follow the instructions. You need to select the `public_repo` or `repo` scopes. Once the token is generated, you need to copy it.

Then you need to encrypt it so you can use on Travis CI, [follow those instructions](https://docs.travis-ci.com/user/encryption-keys/) and then run this command :

~~~bash
travis encrypt GIT_DEPLOY_REPO=https://GENERATED_TOKEN@github.com/username/reponame.git
~~~

Replace `GENERATED_TOKEN` with the generated token earlier and `username` by your GitHub username and `reponame` by the repository name.

### Setup .travis.yml

In your `sources` branch, you have to create a .travis.yml file which will be picked up by Travis CI and be used to configure your build process.

The contents of .travis.yml should be as follows, **note instructions inlined** :

~~~yaml
env:
  global:
    - secure: "..." # replace by the output from travis encrypt done earlier
    - GIT_DEPLOY_DIR=public # this is the default output dir of Hugo
    - GIT_DEPLOY_BRANCH=master # this is the target branch, replace by gh-pages for Project Pages
    - GIT_DEPLOY_USERNAME="Travis CI" # dummy name
    - GIT_DEPLOY_EMAIL=user@example.com # replace by your email
branches:
  only:
    - sources # replace by master for Project Pages

install:
  - rm -rf public || exit 0 # cleanup previous run
script:
  - binaries/hugo # generate!
after_success:
  - cp .travis.yml public # all branches need this file
  - bash deploy.sh # run the deploy script
~~~

NOTE the [latest version of `.travis.yml` will always be at my `sources` branch](https://github.com/speps/speps.github.io/blob/sources/.travis.yml).


### Cross compiling Hugo

You could setup your Travis CI to install a Go version, but it will be faster to cross compile the `hugo` binary yourself and then deploy it in your `sources` branch.

Run from your root folder those following commands, line by line :

~~~sh
mkdir binaries
cd binaries
env GOPATH="`pwd`" go get -v github.com/spf13/hugo
env GOPATH="`pwd`" GOOS=linux GOARCH=amd64 go build -v github.com/spf13/hugo
git add hugo
~~~

This will add the `hugo` binary compiled for a Travis VM to Git's index. Don't forget to commit it.

## Wrapping up

By the end of these steps, you should now have something like this in your root folder :

* [root folder]
  - [archetypes]
  - [binaries]
    - hugo
  - [content]
  - [data]
  - [layouts]
  - [static]
  - [themes]
  - **.travis.yml**
  - config.toml
  - **deploy.sh**

Most of those are Hugo's default folders when you create a new site. The important files are `.travis.yml` and `deploy.sh`.

Once you push everything to GitHub, don't forget to activate your project on Travis CI so it will start builds.