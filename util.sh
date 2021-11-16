#!/bin/bash

function build_images() {
  IMAGE_NAME=australia-southeast1-docker.pkg.dev/weekstreak/$REGISTRY_ID/api:$TAG
  docker build -t $IMAGE_NAME src/backend/
  docker push $IMAGE_NAME

  gcloud artifacts docker tags list australia-southeast1-docker.pkg.dev/$PROJECT_ID/$REGISTRY_ID/api

  IMAGE_NAME=australia-southeast1-docker.pkg.dev/weekstreak/$REGISTRY_ID/ui:$TAG
  docker build -t $IMAGE_NAME -f src/client/Dockerfile.dev src/client/
  docker push $IMAGE_NAME
  gcloud artifacts docker tags list australia-southeast1-docker.pkg.dev/$PROJECT_ID/$REGISTRY_ID/ui
}

function infra() {
  
  gcloud config set project ${PROJECT_ID}

  gcloud --project=${PROJECT_ID} \
      services enable\
      container.googleapis.com\
      artifactregistry.googleapis.com

  gcloud services enable cloudbuild.googleapis.com compute.googleapis.com

  gcloud container clusters create \
      --num-nodes 1 \
      --machine-type e2-small \
      --zone australia-southeast1-a \
      ws-cluster || echo "GKE cluster exists..."

  gcloud artifacts repositories create $REGISTRY_ID \
  --repository-format=docker --location=australia-southeast1 \
   || echo "Repository exists..."

  # KMS for SOPs
  gcloud kms keyrings create "ws-kr" \
      --location "global" || echo "Key Ring exists..."

  gcloud kms keys create sops-key --location global --keyring "ws-kr" \
    --purpose encryption || echo "Key exists..."
  gcloud kms keys list --location global --keyring "ws-kr" 

}

function deploy_api() {
cat << EOF >> kube-templates/api/overlays/stage/ingress-patch.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    kubernetes.io/ingress.class: nginx
spec:
  rules:
  - host: api.${NGINX_IP}.nip.io
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 1337
EOF

cat << EOF >> kube-templates/api/overlays/stage/kustomization.yaml
bases:
  - ../../base

commonLabels:
  env: stage

resources:
  - ingress.yaml

images:
  - name: api
    newName: australia-southeast1-docker.pkg.dev/$PROJECT_ID/$REGISTRY_ID/api
    newTag: $TAG

patchesStrategicMerge:
  - deployment.yaml
  - ingress-patch.yaml
EOF

  kubectl kustomize kube-templates/api/overlays/stage/ | kubectl apply -f -
  kubectl rollout status deploy api-deployment

  rm kube-templates/api/overlays/stage/ingress-patch.yaml
  rm kube-templates/api/overlays/stage/kustomization.yaml

}

function deploy_ui() {

cat << EOF >> kube-templates/client/overlays/stage/kustomization.yaml
bases:
  - ../../base

resources:
  - ingress.yaml

commonLabels:
  env: stage

patchesStrategicMerge:
  - deployment-patch.yaml
  - ingress-patch.yaml

configMapGenerator:
- name: ui-config
  literals:
    - API_HOST=api.$NGINX_IP.nip.io
    - API_PORT=80

images:
  - name: ui
    newName: australia-southeast1-docker.pkg.dev/$PROJECT_ID/$REGISTRY_ID/ui
    newTag: $TAG
EOF

cat << EOF >> kube-templates/client/overlays/stage/ingress-patch.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ui-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: $NGINX_IP.nip.io
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ui-service
            port:
              number: 3000
EOF
  kubectl kustomize kube-templates/client/overlays/stage/ | kubectl apply -f -
  kubectl rollout status deploy ui-deployment

  rm kube-templates/client/overlays/stage/ingress-patch.yaml
  rm kube-templates/client/overlays/stage/kustomization.yaml
}

function deploy() {
  kubectl config current-context 

  # deploy cluster resources
  kubectl kustomize kube-templates/systems/overlays/gcp/ | kubectl apply -f -
  kubectl rollout status deploy ingress-nginx-controller -n ingress-nginx
  NGINX_IP=`kubectl get service ingress-nginx-controller -n ingress-nginx -o json | jq -r '.status.loadBalancer.ingress[].ip'`
  echo $NGINX_IP

  # Deploy secrets
  SECRET_FILE=kube-templates/secrets/stage.secret.yaml
  sops -d $SECRET_FILE | kubectl apply -f -

  # deploy db
  kubectl kustomize kube-templates/db/overlays/stage/ | kubectl apply -f -
  kubectl rollout status deploy db-deployment

  # deploy api
  deploy_api

  # deploy ui
  deploy_ui
}

export PROJECT_ID=weekstreak
export REGISTRY_ID=ws-registry

# if [ ]  - check that command is being executed in the correct directory - or change this

if [ $1 = "build" ]; then 
    echo "building..."
    echo "tag: $2"

    export TAG=$2
    gcloud auth configure-docker australia-southeast1-docker.pkg.dev
    build_images

elif [ $1 = "deploy" ]; then 
    echo "deploying..."
    echo "tag: $2"

    export TAG=$2
    deploy

elif [ $1 = "list-tags" ]; then 
  echo "listing tags..."
  echo "tag: $2"

  export TAG=$2
  gcloud artifacts docker tags list australia-southeast1-docker.pkg.dev/$PROJECT_ID/$REGISTRY_ID/ui
  gcloud artifacts docker tags list australia-southeast1-docker.pkg.dev/$PROJECT_ID/$REGISTRY_ID/api

elif [ $1 = "infra-deploy" ]; then  
    echo "building infra..."
    infra
fi
