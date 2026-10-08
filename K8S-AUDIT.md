# K8S Audit

Fill this in after you run `./audit.sh`. The script is only a hint. Your evidence below is what gets scored.

## My app

- Name: CampusKart, an online store for students (books, stationery, tools and gadgets). This repo is a fork of [Thejasam04/CampusKart-AWS-3-Tier-E-Commerce-Application](https://github.com/Thejasam04/CampusKart-AWS-3-Tier-E-Commerce-Application). The Kubernetes work in this fork is mine (see the README).
- Repo link: https://github.com/rashid-khan681/CampusKart-AWS-3-Tier-E-Commerce-Application
- Tiers (frontend / API / database or cache, and what each one is built with):
  - Frontend: React (Create React App) with Bootstrap, built to static files and served by nginx.
  - API: Node.js with Express (JWT login, bcrypt passwords), port 3000.
  - Database: MySQL 8.0.
- Kubernetes manifests are in (folder): [k8s/](k8s/)
- How to run it from a fresh machine (every command, in order, starting from `kind create cluster`):

```bash
git clone https://github.com/rashid-khan681/CampusKart-AWS-3-Tier-E-Commerce-Application.git
cd CampusKart-AWS-3-Tier-E-Commerce-Application

kind create cluster --config kind/kind-config.yaml

# ingress-nginx for kind, then pin the controller to the control-plane node
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.15.1/deploy/static/provider/kind/deploy.yaml
kubectl -n ingress-nginx patch deployment ingress-nginx-controller --type=merge \
  -p '{"spec":{"template":{"spec":{"nodeSelector":{"ingress-ready":"true"}}}}}'
kubectl -n ingress-nginx wait --for=condition=ready pod -l app.kubernetes.io/component=controller --timeout=180s

# metrics-server (needed for the HPA)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl -n kube-system patch deployment metrics-server --type=json \
  -p '[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'
kubectl -n kube-system rollout status deployment metrics-server

# build the images and load them into kind (2.0 is the same image with a new tag, used for the rolling update)
docker build -t campuskart-backend:1.0 ./backend
docker tag campuskart-backend:1.0 campuskart-backend:2.0
docker build -t campuskart-frontend:1.0 ./frontend
kind load docker-image campuskart-backend:1.0 campuskart-backend:2.0 campuskart-frontend:1.0 --name audit

# deploy the app
kubectl apply -n campuskart -f k8s/
kubectl -n campuskart rollout status deploy/mysql --timeout=300s
kubectl -n campuskart rollout status deploy/backend
kubectl -n campuskart rollout status deploy/frontend
```

- How to open it (URL, or port-forward command): http://campuskart.localtest.me (localtest.me points to 127.0.0.1 and the kind config maps port 80 of my machine to the ingress controller). Register a new user, login, add products to the cart and place an order.

## Before you submit

- [x] "My app" is filled in and the run steps work on a fresh cluster
- [x] Every row has a status; every ✅ has evidence and a one-line reason
- [x] I ran `./audit.sh` and I can explain every ❌ and ⚠️
- [x] Manifests are in the repo and the links in the table work

## How to fill the table

- **Status**: ✅ used and working. ⚠️ tried, or only partly used (say what is missing). ❌ not used.
- **Evidence**: a link to the file in your repo (with line numbers if the file is long), or pasted command output in a code block. Not a screenshot.
- **Why I used it in my app**: one line. What would break or get worse without it?
- A tick without evidence does not count. A concept that does nothing for your app does not count either.
- Leave the last column as it is. It is there to help you.

## Audit

| Concept | Status (✅ / ⚠️ / ❌) | Evidence | Why I used it in my app | Where to look |
|---|---|---|---|---|
| Deployment + ReplicaSet | ✅ | 3 Deployments: [backend](k8s/04-backend.yaml#L1-L44), [frontend](k8s/05-frontend.yaml#L1-L30), [mysql](k8s/03-mysql.yaml#L13-L79). Output: "Deployments, ReplicaSets, Services" below. | Backend runs 2 replicas, so if one pod dies the shop keeps working. | [nginx Deployment](https://github.com/LondheShubham153/kubestarter/blob/main/examples/nginx/deployment.yml), [ReplicaSet](https://github.com/LondheShubham153/kubernetes-in-one-shot/blob/master/nginx/replicasets.yml) <!-- TODO: add video timestamp --> |
| Service | ✅ | 3 ClusterIP Services: [backend](k8s/04-backend.yaml#L46-L54), [frontend](k8s/05-frontend.yaml#L32-L40), [mysql](k8s/03-mysql.yaml#L81-L89). Output below. | The backend connects to the host name `mysql` (DB_HOST), so the Service must have exactly this name. Pod IPs change, the Service name does not. | [nginx Service](https://github.com/LondheShubham153/kubestarter/blob/main/examples/nginx/service.yml) <!-- TODO: add video timestamp --> |
| Namespace | ✅ | [00-namespace.yaml](k8s/00-namespace.yaml). Output: "Namespace" below. | The whole app lives in `campuskart`, so it stays separate from system pods and I can clean it up with one command. | [namespace manifest](https://github.com/LondheShubham153/kubernetes-in-one-shot/blob/master/nginx/namespace.yml), [k8s docs](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) <!-- TODO: add video timestamp --> |
| Labels and selectors | ✅ | Pod labels `app` and `tier` ([backend](k8s/04-backend.yaml#L12-L16)) and the Service selector ([backend](k8s/04-backend.yaml#L52)). Every Service has endpoints, see "Labels and selectors" output below. | Services and Deployments find their pods by the `app` label. If the label is wrong, the Service has no endpoints and the shop is down. | [commands: namespaces, labels, selectors](https://github.com/LondheShubham153/kubernetes-in-one-shot/blob/master/README.md), [k8s docs](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/) <!-- TODO: add video timestamp --> |
| Rolling update + rollback | ✅ | [strategy](k8s/04-backend.yaml#L9-L11) and the full output below (two ReplicaSets with different images, undo, history). | I moved backend from `1.0` to `2.0` with `maxUnavailable: 0`, so 2 pods stay ready during the update. Then `rollout undo` took it back to `1.0`. | [rolling update](https://github.com/LondheShubham153/kubestarter/blob/main/Deployment_Strategies/Rolling-Update-Deployment/) (rollback is not covered there, see [k8s docs](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)) <!-- TODO: add video timestamp --> |
| ConfigMap | ✅ | [campuskart-config](k8s/01-config.yaml#L2-L11), used by backend with [envFrom](k8s/04-backend.yaml#L26-L27) and by [mysql](k8s/03-mysql.yaml#L38-L43). Output below shows the values inside the running pod. | DB host, name and user are settings, not code. I can change them without building a new image. | [MySQL ConfigMap](https://github.com/LondheShubham153/kubestarter/blob/main/examples/mysql/configMap.yml) <!-- TODO: add video timestamp --> |
| Secret | ✅ | [campuskart-secrets](k8s/01-config.yaml#L13-L22) (type Opaque), read with `secretKeyRef` by [backend](k8s/04-backend.yaml#L28-L34), [mysql](k8s/03-mysql.yaml#L35-L37) and the [backup job](k8s/09-backup-cronjob.yaml). | DB password and JWT secret stay out of the image and out of the Deployment text. Without JWT_SECRET login does not work. A Secret is only base64, not encryption. | [MySQL Secret](https://github.com/LondheShubham153/kubestarter/blob/main/examples/mysql/secrets.yml) <!-- TODO: add video timestamp --> |
| Requests and limits | ✅ | Every container has all four values, for example [mysql](k8s/03-mysql.yaml#L72-L74), [backend](k8s/04-backend.yaml#L42-L44), [frontend](k8s/05-frontend.yaml#L28-L30). `./audit.sh` says `4 of 4 containers`. | Without requests the scheduler cannot place pods well. Without limits one busy backend pod can starve MySQL on the same node. The HPA also needs a CPU request. | [Deployment with resources](https://github.com/LondheShubham153/kubestarter/blob/main/HPA_VPA/apache-deployment.yml), [k8s docs](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) <!-- TODO: add video timestamp --> |
| Probes (liveness + readiness) | ✅ | All containers have both: [backend](k8s/04-backend.yaml#L35-L41), [frontend](k8s/05-frontend.yaml#L21-L27), [mysql](k8s/03-mysql.yaml#L50-L71). `./audit.sh` says `4 of 4`. | Readiness keeps a starting pod out of the Service until it answers, and rolling update depends on it. Liveness restarts a stuck pod. MySQL also has a startup probe, so it gets time to load the schema on the first run. | [k8s docs](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/), [liveness example](https://github.com/LondheShubham153/kubernetes-in-one-shot/blob/master/django-notes-app/k8s/deployment.yml) <!-- TODO: add video timestamp --> |
| PVC | ✅ | [mysql-data](k8s/03-mysql.yaml#L2-L11), status Bound. Output below (MySQL pod deleted, data stayed). | Users and orders must stay after a MySQL pod restart. I deleted the pod and the counts (2 users, 1 order) were the same after. | [PVC](https://github.com/LondheShubham153/kubestarter/blob/main/PersistentVolumes/PersistentVolumeClaim.yaml), [MySQL volumes](https://github.com/LondheShubham153/kubestarter/blob/main/examples/mysql/persistentVols.yml) (kind creates the volume for you, see [kind/README.md](kind/README.md)) <!-- TODO: add video timestamp --> |
| Ingress | ✅ | [06-ingress.yaml](k8s/06-ingress.yaml). `curl http://campuskart.localtest.me/` returns 200 and `/api/products` returns JSON. Output below. | One entry point on port 80: `/api` goes to the backend and everything else to the frontend. The browser sees one host, so there is no CORS problem and no NodePort. | [Ingress examples](https://github.com/LondheShubham153/kubestarter/blob/main/Ingress/) (written for minikube, use [kind/README.md](kind/README.md) for the controller), [Ingress manifest](https://github.com/LondheShubham153/kubernetes-in-one-shot/blob/master/nginx/ingress.yml) <!-- TODO: add video timestamp --> |
| Multi-node kind cluster | ✅ | [kind-config.yaml](kind/kind-config.yaml). `kubectl get nodes` shows 3 nodes and the 2 backend pods ran on two different workers. Output below. | I wanted pods to spread over nodes, and every image had to be loaded on all 3 nodes with `kind load`. | [kubestarter kind config](https://github.com/LondheShubham153/kubestarter/blob/main/kind-cluster/kind-config.yml), [our config](kind/kind-config.yaml) <!-- TODO: add video timestamp --> |
| HPA (stretch) | ✅ | [07-hpa.yaml](k8s/07-hpa.yaml). Under load `kubectl get hpa` showed `cpu: 417%/60%` and 5 replicas, later back to 2. Output below. | Login and register use bcrypt, which needs a lot of CPU, so the backend is the tier that gets busy. It scales from 2 to 5 pods at 60% CPU. | [HPA manifest](https://github.com/LondheShubham153/kubestarter/blob/main/HPA_VPA/apache-hpa.yml), [metrics-server steps](https://github.com/LondheShubham153/kubestarter/blob/main/HPA_VPA/README.md) <!-- TODO: add video timestamp --> |
| RBAC + ServiceAccount (stretch) | ✅ | [08-rbac.yaml](k8s/08-rbac.yaml) and the output below. Backend pods use `backend-app` ([lines](k8s/04-backend.yaml#L18-L19)). | `backend-app` is the identity of the backend pods and has no API token mounted, because the app never calls the Kubernetes API. `viewer` can read pods and logs, nothing else. | [RBAC examples](https://github.com/LondheShubham153/kubestarter/blob/main/RBAC/) <!-- TODO: add video timestamp --> |
| CronJob (stretch) | ✅ | [09-backup-cronjob.yaml](k8s/09-backup-cronjob.yaml) and the output below (I ran it once by hand). | A `mysqldump` runs every night at 2 AM into its own PVC. Users and orders are the only data this shop has. | [CronJob manifest](https://github.com/LondheShubham153/kubernetes-in-one-shot/blob/master/nginx/cron-job.yml), [k8s docs](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/) <!-- TODO: add video timestamp --> |
| GitHub Actions deploying to kind (stretch) | ✅ | [kind-deploy.yml](.github/workflows/kind-deploy.yml). Successful run: https://github.com/rashid-khan681/CampusKart-AWS-3-Tier-E-Commerce-Application/actions/runs/37856780353 (about 3 minutes). | On every push it builds the images, creates a clean 3-node kind cluster, applies the manifests, and checks backend health, the products API and the frontend. | [helm/kind-action](https://github.com/helm/kind-action), [example workflow](examples/sample-app-k8s/.github/workflows/kind-deploy.yml) <!-- TODO: add video timestamp --> |

## Score

- Must-have concepts with ✅ and evidence (12 max): 12
- Stretch concepts with ✅ and evidence (4 max): 4
- Total (pass at 10 or more): 16

## Evidence output

The audit script (first run, before I added the workflow file):

```
$ ./audit.sh campuskart
context: kind-audit   scope: campuskart

✅ Deployment + ReplicaSet              3 deployment(s) in app namespaces
✅ Service                              3 service(s)
✅ Namespace                            1 namespace(s) besides default and system ones
✅ Labels and selectors                 3 service(s) have endpoints, so selectors match pod labels
✅ Rolling update + rollback            1 deployment(s) rolled to a new image (rollback itself is not visible, show it in your evidence)
✅ ConfigMap                            2 non-default configmap(s)
✅ Secret                               1 Opaque secret(s)
✅ Requests and limits                  4 of 4 containers have cpu+memory requests and limits
✅ Probes (liveness+readiness)          4 of 4 containers have both probes
✅ PVC                                  1 bound PVC(s)
✅ Ingress                              1 ingress resource(s), 1 running controller pod(s)
✅ Multi-node cluster                   3 node(s)
✅ HPA (stretch)                        1 HPA(s)
✅ RBAC + ServiceAccount (stretch)      2 role/rolebinding(s), 2 custom serviceaccount(s)
✅ CronJob (stretch)                    1 cronjob(s)
❌ GitHub Actions to kind (stretch)     looks for kind create cluster / helm/kind-action in ./.github/workflows

Seen: 15/16  (must 12/12, stretch 3/4). Pass mark is 10+. Now write the evidence in K8S-AUDIT.md.
```

After I added `.github/workflows/kind-deploy.yml`:

```
$ ./audit.sh campuskart | tail -4
✅ CronJob (stretch)                    1 cronjob(s)
✅ GitHub Actions to kind (stretch)     looks for kind create cluster / helm/kind-action in ./.github/workflows

Seen: 16/16  (must 12/12, stretch 4/4). Pass mark is 10+. Now write the evidence in K8S-AUDIT.md.
```

Deployments, ReplicaSets, Services (taken right after the first deploy):

```
$ kubectl -n campuskart get deploy,rs,svc,pvc,ingress
NAME                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/backend    2/2     2            2           9m58s
deployment.apps/frontend   1/1     1            1           9m58s
deployment.apps/mysql      1/1     1            1           7m49s

NAME                                  DESIRED   CURRENT   READY   AGE
replicaset.apps/backend-7ffb74b4f6    2         2         2       9m58s
replicaset.apps/frontend-59f5f5865d   1         1         1       9m58s
replicaset.apps/mysql-6fccbdcd77      1         1         1       7m49s

NAME               TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
service/backend    ClusterIP   10.96.150.187   <none>        3000/TCP   9m58s
service/frontend   ClusterIP   10.96.227.63    <none>        80/TCP     9m58s
service/mysql      ClusterIP   10.96.162.231   <none>        3306/TCP   9m58s

NAME                               STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
persistentvolumeclaim/mysql-data   Bound    pvc-c194223c-1a82-4a2f-852b-48374707a595   1Gi        RWO            standard       <unset>                 9m58s

NAME                                   CLASS   HOSTS                     ADDRESS     PORTS   AGE
ingress.networking.k8s.io/campuskart   nginx   campuskart.localtest.me   localhost   80      9m58s
```

Namespace:

```
$ kubectl get ns
NAME                 STATUS   AGE
campuskart           Active   21h
default              Active   2d21h
ingress-nginx        Active   2d21h
kube-node-lease      Active   2d21h
kube-public          Active   2d21h
kube-system          Active   2d21h
local-path-storage   Active   2d21h
```

Labels and selectors (each Service has endpoints):

```
$ kubectl -n campuskart get endpointslices
NAME             ADDRESSTYPE   PORTS   ENDPOINTS               AGE
backend-p7xk2    IPv4          3000    10.244.1.3,10.244.2.3   10m
frontend-2tzcr   IPv4          80      10.244.2.2              10m
mysql-2nc9r      IPv4          3306    10.244.2.5              10m
```

Rolling update and rollback (I tagged the same backend image as `2.0`, the code is the same, only the tag is different):

```
$ kubectl -n campuskart set image deploy/backend backend=campuskart-backend:2.0
deployment.apps/backend image updated
$ kubectl -n campuskart annotate deploy/backend kubernetes.io/change-cause="update backend image from 1.0 to 2.0" --overwrite
deployment.apps/backend annotated
$ kubectl -n campuskart rollout status deploy/backend
deployment "backend" successfully rolled out
$ kubectl -n campuskart get rs -l app=backend -o wide
NAME                 DESIRED   CURRENT   READY   AGE   CONTAINERS   IMAGES                   SELECTOR
backend-5d94db6d85   2         2         2       20h   backend      campuskart-backend:2.0   app=backend,pod-template-hash=5d94db6d85
backend-7ffb74b4f6   0         0         0       21h   backend      campuskart-backend:1.0   app=backend,pod-template-hash=7ffb74b4f6

$ kubectl -n campuskart rollout undo deploy/backend
Warning: resource deployments/backend was previously managed with 'kubectl apply'. Rolling back will not update the kubectl.kubernetes.io/last-applied-configuration annotation, which may cause unexpected behavior on future 'kubectl apply' operations. Consider using 'kubectl apply' with your previous configuration file instead.
deployment.apps/backend rolled back
$ kubectl -n campuskart annotate deploy/backend kubernetes.io/change-cause="rollback to image 1.0" --overwrite
deployment.apps/backend annotated
$ kubectl -n campuskart rollout status deploy/backend
deployment "backend" successfully rolled out
$ kubectl -n campuskart get rs -l app=backend -o wide
NAME                 DESIRED   CURRENT   READY   AGE   CONTAINERS   IMAGES                   SELECTOR
backend-5d94db6d85   0         0         0       20h   backend      campuskart-backend:2.0   app=backend,pod-template-hash=5d94db6d85
backend-7ffb74b4f6   2         2         2       21h   backend      campuskart-backend:1.0   app=backend,pod-template-hash=7ffb74b4f6
$ kubectl -n campuskart rollout history deploy/backend
deployment.apps/backend 
REVISION  CHANGE-CAUSE
4         update backend image from 1.0 to 2.0
5         rollback to image 1.0

$ kubectl -n campuskart get deploy backend -o jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'
campuskart-backend:1.0
```

ConfigMap values inside the running backend pod (the password is not printed, I only check that JWT_SECRET is set):

```
$ kubectl -n campuskart exec deploy/backend -- sh -c 'echo "DB_HOST=$DB_HOST DB_NAME=$DB_NAME DB_USER=$DB_USER"; if [ -n "$JWT_SECRET" ]; then echo "JWT_SECRET is set"; fi'
DB_HOST=mysql DB_NAME=ecommerce DB_USER=campuskart
JWT_SECRET is set
```

PVC keeps the data (2 users and 1 order before and after deleting the MySQL pod):

```
$ SQL='select count(*) as users from users; select count(*) as orders from orders;'
$ kubectl -n campuskart exec deploy/mysql -- sh -c "mysql -ucampuskart -p\"\$MYSQL_PASSWORD\" ecommerce -e '$SQL'"
users
2
orders
1
$ kubectl -n campuskart delete pod -l app=mysql
pod "mysql-6fccbdcd77-whwjw" deleted from campuskart namespace
$ kubectl -n campuskart rollout status deploy/mysql --timeout=180s
deployment "mysql" successfully rolled out
$ kubectl -n campuskart exec deploy/mysql -- sh -c "mysql -ucampuskart -p\"\$MYSQL_PASSWORD\" ecommerce -e '$SQL'"
users
2
orders
1
$ kubectl -n campuskart get pvc
NAME            STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
mysql-backups   Bound    pvc-89c69d4e-a5b9-47d0-a80b-509e7a08e3c0   1Gi        RWO            standard       <unset>                 28m
mysql-data      Bound    pvc-c194223c-1a82-4a2f-852b-48374707a595   1Gi        RWO            standard       <unset>                 29h
```

Ingress (one host, `/api` goes to the backend, `/` goes to the frontend). The controller runs on the control-plane node:

```
$ kubectl -n ingress-nginx get pod -o wide
NAME                                        READY   STATUS    RESTARTS   AGE   IP           NODE                  NOMINATED NODE   READINESS GATES
ingress-nginx-controller-575c4d8bc6-8ltnm   1/1     Running   0          42s   10.244.0.5   audit-control-plane   <none>           <none>
$ curl -s -o /dev/null -w "%{http_code}\n" http://campuskart.localtest.me/
200
$ curl -s http://campuskart.localtest.me/api/products | head -c 200
[{"id":1,"name":"Data Structures Textbook","description":"Core DSA concepts with examples","price":"499.00","category_id":1},{"id":2,"name":"Operating Systems Notes","description":"Handwritten-style s
$ curl -s -X POST $BASE/api/cart -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"product_id":1,"quantity":2}'
{"message":"Product added to cart"}
$ curl -s -X POST $BASE/api/orders -H "Authorization: Bearer $TOKEN"
{"message":"Order placed successfully","order_id":3}
$ curl -s $BASE/api/orders -H "Authorization: Bearer $TOKEN"
[{"order_id":2,"name":"Data Structures Textbook","price":"499.00","quantity":2},{"order_id":3,"name":"Data Structures Textbook","price":"499.00","quantity":2}]
```

Multi-node cluster (the backend pods are on two different workers):

```
$ kubectl get nodes
NAME                  STATUS   ROLES           AGE     VERSION
audit-control-plane   Ready    control-plane   2d21h   v1.37.0
audit-worker          Ready    <none>          2d21h   v1.37.0
audit-worker2         Ready    <none>          2d21h   v1.37.0
$ kubectl -n campuskart get pods -o wide
NAME                        READY   STATUS    RESTARTS      AGE     IP           NODE            NOMINATED NODE   READINESS GATES
backend-7ffb74b4f6-r4bht    1/1     Running   0             7m43s   10.244.1.5   audit-worker2   <none>           <none>
backend-7ffb74b4f6-vbjl4    1/1     Running   0             7m41s   10.244.2.6   audit-worker    <none>           <none>
frontend-59f5f5865d-kkmkc   1/1     Running   2 (16m ago)   21h     10.244.2.3   audit-worker    <none>           <none>
mysql-6fccbdcd77-crtlc      1/1     Running   2 (16m ago)   20h     10.244.2.4   audit-worker    <none>           <none>
```

HPA. I sent many login requests with a wrong password in a loop (bcrypt uses a lot of CPU), then checked the HPA and the pods. Later, after the load stopped, the replicas came back to 2:

```
$ seq 1 3000 | xargs -P 8 -I{} curl -s -o /dev/null -X POST $BASE/api/auth/login -H 'Content-Type: application/json' -d '{"email":"k8s@example.com","password":"wrong-password"}'
$ kubectl -n campuskart get hpa
NAME      REFERENCE            TARGETS         MINPODS   MAXPODS   REPLICAS   AGE
backend   Deployment/backend   cpu: 417%/60%   2         5         5          6m46s
$ kubectl -n campuskart get pods -l app=backend
NAME                       READY   STATUS    RESTARTS   AGE
backend-66b89fb65d-78qnv   1/1     Running   0          7m12s
backend-66b89fb65d-7zs2q   1/1     Running   0          2m17s
backend-66b89fb65d-fth8c   1/1     Running   0          2m17s
backend-66b89fb65d-vfpdw   1/1     Running   0          7m18s
backend-66b89fb65d-x6hmn   1/1     Running   0          2m2s

$ kubectl -n campuskart get hpa
NAME      REFERENCE            TARGETS        MINPODS   MAXPODS   REPLICAS   AGE
backend   Deployment/backend   cpu: 10%/60%   2         5         2          28m
```

RBAC:

```
$ kubectl auth can-i list pods -n campuskart --as=system:serviceaccount:campuskart:viewer
yes
$ kubectl auth can-i delete pods -n campuskart --as=system:serviceaccount:campuskart:viewer
no
$ kubectl -n campuskart get pods -l app=backend -o jsonpath='{range .items[*]}{.metadata.name}{"  sa="}{.spec.serviceAccountName}{"\n"}{end}'
backend-66b89fb65d-78qnv  sa=backend-app
backend-66b89fb65d-vfpdw  sa=backend-app
```

CronJob (I ran it once by hand, instead of waiting for 2 AM):

```
$ kubectl -n campuskart create job --from=cronjob/mysql-backup mysql-backup-manual
job.batch/mysql-backup-manual created
$ kubectl -n campuskart wait --for=condition=complete job/mysql-backup-manual --timeout=180s
job.batch/mysql-backup-manual condition met
$ kubectl -n campuskart logs job/mysql-backup-manual
total 12
-rw-r--r-- 1 root root 8812 Oct  8 22:45 ecommerce-20261008-224531.sql
$ kubectl -n campuskart get cronjob,job,pvc
NAME                         SCHEDULE    TIMEZONE   SUSPEND   ACTIVE   LAST SCHEDULE   AGE
cronjob.batch/mysql-backup   0 2 * * *   <none>     False     0        <none>          28m

NAME                            STATUS     COMPLETIONS   DURATION   AGE
job.batch/mysql-backup-manual   Complete   1/1           37s        20m

NAME                                  STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
persistentvolumeclaim/mysql-backups   Bound    pvc-89c69d4e-a5b9-47d0-a80b-509e7a08e3c0   1Gi        RWO            standard       <unset>                 28m
persistentvolumeclaim/mysql-data      Bound    pvc-c194223c-1a82-4a2f-852b-48374707a595   1Gi        RWO            standard       <unset>                 29h
```

GitHub Actions: workflow [kind-deploy.yml](.github/workflows/kind-deploy.yml), run #1 on commit 01edd69, status Success, total time 3m 19s:
https://github.com/rashid-khan681/CampusKart-AWS-3-Tier-E-Commerce-Application/actions/runs/37856780353

## What was hard / what I would change

What was hard:

- The app was not ready for Kubernetes. The database host and password were hard coded in `db.js`, and the React app had a fixed load balancer URL. I moved the database settings to environment variables and made the frontend use a relative `/api` URL. So now one Ingress host can serve both frontend and backend.
- The register query used wrong column names, so register was failing. There was also no health endpoint, no Dockerfile and no SQL file. I fixed the query, added `/health`, wrote the Dockerfiles and made the schema and seed from the backend queries.
- My first `kubectl apply` failed because I wrote the wrong `apiVersion` for the MySQL Deployment. I corrected it and applied again.
- `audit.sh` showed "3 of 4 containers have both probes". When I checked the live Deployment YAML, MySQL had only a readiness probe. I added the liveness probe, applied again and then it showed 4 of 4.
- In my first rollout I added the change-cause annotation before `set image`, so both revisions showed the same message. I did the rollout again in the right order (`set image` first, then `annotate`) and the history became clear.
- Some time `kubectl` was pointing to my other kind cluster, so it said the namespace is not found. I switched back with `kubectl config use-context kind-audit`. Now I check the context first.
- For the rolling update I tagged the same backend image as `2.0`. The code is same, only the tag is different. I did this to show the update and rollback clearly.

What I would change:

- The backend Deployment has `replicas: 2` and the HPA also controls replicas. When I run `kubectl apply` again, replicas go back to 2. I would let only the HPA manage the replicas.
- The Secret values are plain text in Git. They are only for local testing. In a real project I would not commit them. I would use Sealed Secrets or an external secret manager.
- MySQL is a single replica Deployment with `Recreate` strategy. It is fine for this project, but for high availability I would use a StatefulSet or a managed database.
- When the same email is registered again, the backend returns a generic "Server error". I would return a clear 409 message.
- The GitHub Actions workflow tests the deploy, the backend and the frontend, but it does not install ingress-nginx and metrics-server. So the Ingress and the HPA are tested only on my own kind cluster. I would add these two steps to the workflow.
- The workflow shows a warning about Node.js 20 for `actions/checkout@v4`. It still passes, but I would update the action versions later.
