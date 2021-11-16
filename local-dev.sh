#!/bin/bash

function create_cluster() {

#check https://kind.sigs.k8s.io/docs/user/local-registry/


# create registry container unless it already exists
reg_name='kind-registry'
reg_port='5000'
running="$(docker inspect -f '{{.State.Running}}' "${reg_name}" 2>/dev/null || true)"
if [ "${running}" != 'true' ]; then
  docker run \
    -d --restart=always -p "127.0.0.1:${reg_port}:5000" --name "${reg_name}" \
    registry:2
fi

docker network connect "kind" "${reg_name}" || true
DIR=$(pwd)
cat <<EOF | kind create cluster --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
containerdConfigPatches:
- |-
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."localhost:${reg_port}"]
    endpoint = ["http://${reg_name}:${reg_port}"]
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraMounts:
  - hostPath: $DIR
    containerPath: /host_files
    readOnly: false
    propagation: HostToContainer
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
EOF


cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: local-registry-hosting
  namespace: kube-public
data:
  localRegistryHosting.v1: |
    host: "localhost:${reg_port}"
    help: "https://kind.sigs.k8s.io/docs/user/local-registry/"
EOF

kubectl config current-context
}

function deploy_local() {
  sops -d kube-templates/secrets/stage.secret.yaml | kubectl apply -f -
  
  kubectl kustomize kube-templates/systems/overlays/local/ | kubectl apply -f -

  kubectl rollout status deploy ingress-nginx-controller -n ingress-nginx
  kubectl kustomize kube-templates/gateway/overlays/local/  | kubectl apply -f -
  kubectl rollout status deploy tyk-gtw 
  kubectl kustomize kube-templates/db/overlays/local/ | kubectl apply -f -
  kubectl rollout status deploy db-deployment

  kubectl kustomize kube-templates/api/overlays/local/ | kubectl apply -f -

  kubectl kustomize kube-templates/client/overlays/local/ | kubectl apply -f -

}

function build_images() {
  (cd src/backend/ && npm install)
  IMAGE_NAME=localhost:5000/api:$TAG
  docker build -t $IMAGE_NAME src/backend/
  docker push $IMAGE_NAME
  
  
  (cd src/client/ && npm install)
  IMAGE_NAME=localhost:5000/ui:$TAG
  docker build -t $IMAGE_NAME -f src/client/Dockerfile.dev src/client/
  docker push $IMAGE_NAME
  

}

// kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml




if [ $1 = "build" ]; then 
    echo "building..."
    echo "tag: $2"

    export TAG=test
    build_images

elif [ $1 = "deploy" ]; then 
    echo "deploying..."
    echo "tag: $2"

    export TAG=$2
    deploy_local

elif [ $1 = "list-tags" ]; then 
  echo "listing tags..."
  echo "tag: $2"

  export TAG=$2
  gcloud artifacts docker tags list australia-southeast1-docker.pkg.dev/$PROJECT_ID/$REGISTRY_ID/ui
  gcloud artifacts docker tags list australia-southeast1-docker.pkg.dev/$PROJECT_ID/$REGISTRY_ID/api

elif [ $1 = "infra-deploy" ]; then  
    echo "building infra..."
    create_cluster
fi
