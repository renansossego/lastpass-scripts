#!/bin/bash

source ~/.bashrc

function do_login() {
  echo $2 | LPASS_DISABLE_PINENTRY=1 lpass login $1
}

function do_create() {
  echo "=== Criando pasta compartilhada $1"
  lpass share create "$1"
  sleep 1
  lpass sync
  sleep 1
}

function do_logout() {
  lpass sync
  sleep 1
  lpass logout --force
}

function do_add() {
  echo "=== Adicionando entrada $1 ($2)"
  echo "URL: $2" | lpass add --non-interactive --sync=now "$1"
}

function do_list() {
  echo "=== Listando $1"
  lpass ls -l "$1"
}

function do_sync() {
  echo "=== Sincronizando"
  lpass sync
}

function do_useradd() {
  echo "=== Adicionando usuario $2 em $1"
  lpass share useradd --read-only=false --admin=false $1 $2
}


# PARAMETERS

BASE="Shared-$1-$2"
CLIENT_EMAIL=$3


# LETS DO THE JOB!

do_login $LOGINLASTPASS "$SENHALASTPASS"

do_create "$BASE"

do_add "$BASE/BRADESCO" https://wwws.bradescoseguros.com.br/100corretor/br/home/default.asp
do_add "$BASE/TOKIO MARINE"      https://ssoportais3.tokiomarine.com.br/openam/XUI/?realm=TOKIOLFR&goto=http://portalparceiros.tokiomarine.com.br/portal-contingencia/group/portal-corretor#login/
do_add "$BASE/ALFA"      https://wwws.alfaseguradora.com.br/Portal/Corretor/Login
do_add "$BASE/GRUPO PORTO"      https://corretor.portoseguro.com.br/portal/site/corretoronline/template.LOGIN/
do_add "$BASE/ALLIANZ"      https://www.allianznet.com.br/drlf01/pt_BR/web/allianznet
do_add "$BASE/GENERALI"      https://www.portalgenerali.com.br/Corretor
do_add "$BASE/HDI"      https://www.hdi.com.br/
do_add "$BASE/LIBERTY"      https://meuespacocorretor.libertyseguros.com.br/Inicio/login.aspx
do_add "$BASE/MAPFRE"      https://www.mapfreconnect.com.br/default.asp
do_add "$BASE/MITSUI"      https://www4.msig.com.br/kitonline/
do_add "$BASE/SOMPO"      https://portalweb.yasudamaritima.com.br/LoginCorrYM/
do_add "$BASE/ZURICH"      https://espacocorretor.zurich.com.br/
do_add "$BASE/ITAU PORTAL"      https://www.itauautoeresidencia.com.br/operacional/appmanager/portais/login?_nfls=false
# e assim por diante

do_sync
do_useradd "$BASE" $CLIENT_EMAIL
do_sync

do_list "$BASE"

do_logout
