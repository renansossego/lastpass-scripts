#!/bin/bash

source ~/.bashrc

function do_login() {
  echo $2 | LPASS_DISABLE_PINENTRY=1 lpass login $1
}

function do_logout() {
  lpass sync
  sleep 1
  lpass logout --force
}

LOGINLASTPASS=lastpass@sossego.com.br
SENHALASTPASS=shdgf8wrywhbugf67trg83v276rge6rf247r

# LETS DO THE JOB!

do_login $LOGINLASTPASS "$SENHALASTPASS"

lpass export --fields=url,username,password,name,grouping >> credentials.csv

node credentials-saving-entry.js

do_logout

rm credentials.csv