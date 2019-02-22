# install script for ServMan #
# wget -O - https://github.com/TylerB260/ServMan/install.sh | bash

apt update
apt install curl sudo htop
curl -sL https://deb.nodesource.com/setup_11.x | bash -
apt install -y nodejs
npm install n -g
n latest
adduser servman
adduser servman sudo
