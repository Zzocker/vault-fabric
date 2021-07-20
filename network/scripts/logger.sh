# /bin/sh


RED="\e[31m"
GREEN="\e[32m"
BLUE="\e[34m"
ENDCOLOR="\e[0m"


function deubg(){
    MESSAGE=$1
    echo -e "${BLUE}["DEUGB"] ${MESSAGE}${ENDCOLOR}"
}

function errro(){
    MESSAGE=$1
    echo -e "${RED}[ERROR] ${MESSAGE}${ENDCOLOR}"
}

function info(){
    MESSAGE=$1
    echo -e "${GREEN}[INFO ] ${MESSAGE}${ENDCOLOR}"
}