# Week Streak 

Week Streak (or Streak Week) is a simple web app with a backend to keep track of weekly goals like going to the gym or studying.

It is meant to demostrate some of the skills I have while being a pretty fun app to make. 

- WIP (feeling inspired)


# Todo

Deploy to GCP
Replace Strapi with NestJs backend


# Get Stuck In

## Dev

```bash
./dev.sh infra-deploy
./dev.sh build <tag>
./dev.sh list-tags

./dev.sh deploy

```

## GCP

```bash

./util.sh infra-deploy
./util.sh build <tag>
./util.sh list-tags
./util.sh deploy
```



# Dependencies


- npm | node 16
- docker
- docker-compose
- gcloud cli
x
- helm - https://v3.helm.sh/docs/intro/install/#from-apt-debianubuntu
- jq
- sops

kubectl

```bash
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl
sudo curl -fsSLo /usr/share/keyrings/kubernetes-archive-keyring.gpg https://packages.cloud.google.com/apt/doc/apt-key.gpg
echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt-get update
sudo apt-get install -y kubectl
```

kind 
```bash
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.11.1/kind-linux-amd64
chmod +x ./kind
mv ./kind ~/bin
echo 'export PATH=$PATH:~/bin' >> ~/.bashrc

```


- podman for ubuntu 21.04 
```bash
. /etc/os-release
echo "deb https://download.opensuse.org/repositories/devel:/kubic:/libcontainers:/stable/xUbuntu_${VERSION_ID}/ /" | sudo tee /etc/apt/sources.list.d/devel:kubic:libcontainers:stable.list
curl -L "https://download.opensuse.org/repositories/devel:/kubic:/libcontainers:/stable/xUbuntu_${VERSION_ID}/Release.key" | sudo apt-key add -
sudo apt-get update
sudo apt-get -y upgrade
sudo apt-get -y install podman
```
cgroupsv2: https://github.com/containers/podman/blob/main/docs/tutorials/rootless_tutorial.md#cgroup-v2-support



# Infrastructure

https://cloud.google.com/binary-authorization/docs/getting-started-cli#artifact-registry
```


```


# Local Deployment using Kind

```
KIND_EXPERIMENTAL_PROVIDER=podman kind create cluster


```

# Nginx Templates
```bash
minikube addons enable ingress


helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx

helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx

https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.0.0/deploy/static/provider/baremetal/deploy.yaml
```

# GCP Deployment 

```bash
kubectl config use-context gke..





TAG=0.0.1-3

kubectl kustomize kube-templates/client/overlays/local/ | kubectl apply -f -

rm kube-templates/client/overlays/stage/API_PORT
rm kube-templates/client/overlays/stage/API_HOST
rm kube-templates/client/overlays/stage/ingress-patch.yaml

```

# Cluster Resources


# Build the Images


https://cloud.google.com/architecture/managing-infrastructure-as-code
```bash


gcloud auth configure-docker australia-southeast1-docker.pkg.dev

CLOUDBUILD_SA="$(gcloud projects describe $PROJECT_ID \
    --format 'value(projectNumber)')@cloudbuild.gserviceaccount.com"

./util.sh build
```

# Test deployment

```bash
./util.sh deploy

```


# Destroy

```bash

gcloud container clusters delete test-cluster --zone australia-southeast1-a

```


