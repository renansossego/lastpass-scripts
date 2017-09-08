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

# PARAMETERS

