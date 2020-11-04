#!/bin/sh
REGISTRY=$1
hostname=$2

# install docker
apt-get update
which docker || curl -fsSL https://get.docker.com -o get-docker.sh
which docker || sh get-docker.sh

# setup docker registry mirror and Prometheus interface
# (See https://docs.docker.com/config/daemon/prometheus)
cat > '/etc/docker/daemon.json' << EOF
{
	"registry-mirrors": ["$REGISTRY"],

	"metrics-addr" : "0.0.0.0:9323",
	"experimental" : true
}
EOF
systemctl restart docker
# Now you can do `curl 127.0.0.1:9323/metrics`

# get mosh in case of login in slow connection
apt-get install -y -qq --no-install-recommends mosh
echo Mosh Usage: mosh --ssh="'ssh -p 8921'" SSH_ADDR

# change hostname
echo "$hostname" > /etc/hostname
hostname -F /etc/hostname

# install prometheus node exporter (listening at localhost:9100/metrics)
apt-get install -y -qq --no-install-recommends prometheus-node-exporter

# install other utility commands
apt-get install -y -qq --no-install-recommends atop smem
# smem usage: smem -pkw
