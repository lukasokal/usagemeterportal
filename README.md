Nižšie ti dávam profesionálny návrh riešenia usage metering systému, ktorý budeš poskytovať merchantom ako súčasť platobnej brány tatrapay+. Cieľom je, aby obchodníci mohli vytvárať svoje vlastné usage-based produkty (rovnako ako Stripe Billing), pričom tatrapay+ im poskytne infraštruktúru, spracovanie eventov a billing podklady.
Použité fakty o Stripe mete¬roch vychádzajú zo zdrojov:
– definícia metra (event_name, aggregation, meter events)
– meter resource – parametre a účel ✦ meter creation, formula (sum/count)
– použitie metrov na API volania a iné usage modely (SaaS API requests)
– monitoring usage a prahy využitia [docs.stripe.com] [deepwiki.com] [openmeter.io] [docs.stripe.com]
________________________________________
✅ 1. Definovanie problému / Hypotéza
tatrapay+ chce poskytovať usage metering platformu pre merchantov, aby si mohli tvorbu vlastných subscription a usage-based plánov nastaviť priamo v admin rozhraní.
Hypotéza:
•	Merchanti potrebujú flexibilne účtovať svojich zákazníkov podľa spotreby: počet API volaní, počet transakcií, počet akcií v ich SaaS, počet reportov, použité dáta, kapacity, limity atď.
•	Stripe používa koncept Meter, ktorý definuje čo sa meria, ako sa agreguje a ako sa fakturuje. Rovnaký model môžeš replikovať a ponúknuť ako službu. [docs.stripe.com]
________________________________________
✅ 2. Cieľ služby
Vytvoriť Usage Metering Engine, ktorý umožňuje:
1.	Merchantom definovať vlastné metrické jednotky (Meters).
2.	Prijímať usage eventy cez API alebo webhooks.
3.	Agregovať ich podľa typu (sum/count) – rovnaké ako Stripe. [deepwiki.com]
4.	Umožniť merchantovi vytvoriť ceny, tarify, limity a upozornenia viazané na jednotlivé metre.
5.	Exportovať agregované dáta pre merchant billing (alebo ich fakturovať automaticky).
Dôležité:
Toto nie je billing za tatrapay+, ale služba pre obchodníkov, ktorú použijú na vlastné fakturovanie ich zákazníkov.
________________________________________
✅ 3. Aké metre by tatrapay+ mala poskytovať (podľa Stripe vzoru)
Toto sú typové metre, ktoré poskytovateľ brány ponúkne pre merchantov ako stavebný kameň.
Merchant si môže konfigurovať, ktoré z nich použije vo svojom SaaS produkte.
________________________________________
A. Count based metre (COUNT aggregation)
Podľa Stripe: aggregation formula môže byť count. [deepwiki.com]
Tieto metre počítajú počet eventov.
1.	User Actions Count
o	počet vykonaných úkonov v aplikácii merchantov (napr. rezervácie, objednávky, generovanie reportu).
o	Merchant nastaví event_name: user_action.
2.	API Calls Count (ako Stripe API request meter)
o	meranie počtu volaní API ich vlastným zákazníkom.
o	Event: api_call.
3.	Feature Usage Count
o	merchant meria koľkokrát jeho zákazník využil nejakú funkciu (napr. export PDF, prístup do modulu, upload).
4.	Generated Items Count
o	meranie vytvorených objektov: dokumenty, ticket, fotky, faktúry.
5.	Seats / Users Count
o	počet aktívnych používateľov zákazníka (licenčné modely).
6.	Session Start Count
o	počet spustení služby.
________________________________________
B. Sum based metre (SUM aggregation)
Podľa Stripe: aggregation formula môže byť sum. [deepwiki.com]
1.	Data Transfer Volume (MB/GB)
o	SaaS merchant účtuje podľa prenesených dát (napr. video streaming, veľké súbory).
2.	Resource Time Consumption
o	sum CPU time, worker time, výpočtový čas (napr. machine learning scoring).
3.	Storage Used (GB)
o	množstvo uložených dát.
4.	Processed Volume
o	merchant môže účtovať svojich klientov podľa spracovaného objemu (napr. audit logy, veľkosť datasetu).
5.	Processing Credits
o	merchant si môže definovať interné kredity (napr. 1 kredit = 1 min AI generovania).
________________________________________
C. Event-driven metre (flexibilné custom eventy)
Stripe podporuje libovolný event_name, ktorý si definujete. [deepwiki.com]
tatrapay+ poskytne merchantovi:
•	meter pre ľubovoľný custom event, ktorý merchant nahlási cez API
•	agregácia podľa count alebo sum
•	možnosť pridať dimenzie: endpoint, typ zákazníka, segment
Príklady:
1.	Webhook Delivery Count
2.	Notification Sent (email/SMS)
3.	AI Model Execution Count
4.	Task Automation Count
________________________________________
✅ 4. Ako to bude merchant používať – scenáre v praxi
________________________________________
✅ Scenár 1: SaaS systém pre rezervácie
Merchant chce účtovať svojich klientov podľa:
•	počtu rezervácií mesačne,
•	počtu notifikácií,
•	počtu API volaní mobilnej aplikácie.
V admin rozhraní si vytvorí tieto metre:
Meter Name	event_name	aggregation
Reservations	reservation_created	count
Notifications	notification_sent	count
API Calls	api_call	count
________________________________________
✅ Scenár 2: Analytická platforma
Obchodník účtuje:
•	objem spracovaných dát (GB),
•	počet generovaných reportov,
•	čas CPU pri spracovaní pipeline.
Metre:
1.	pipeline_data_volume – sum
2.	report_generated – count
3.	cpu_time – sum
________________________________________
✅ Scenár 3: AI služba
Účtovanie podľa:
•	počtu generovaných obrázkov,
•	dĺžky inference času (sekundy),
•	počtu API volaní pre LLM.
________________________________________
✅ Scenár 4: Licenčný model (SaaS B2B)
Merchant účtuje podľa:
•	počtu aktívnych používateľov,
•	počtu tímov,
•	počtu workflow, ktoré zákazník spustil.
________________________________________
✅ Scenár 5: Mobilná app platforma
Merchant meria:
•	počet zaslaných push notifikácií,
•	počet synchronizácií,
•	spotrebované dáta.
________________________________________
✅ 5. Čo si merchant vie nastaviť v admin rozhraní (rovnaké ako Stripe)
Podľa Stripe dokumentácie merchant definuje parametre metra (event_name, aggregation formula, display_name). [deepwiki.com]
________________________________________
A. Definícia metra
Merchant definuje:
•	Názov metra – “PDF Exporty”
•	event_name – pdf_exported
•	Aggregation formula: 
o	COUNT – ak sa meria počet eventov
o	SUM – ak merchant reportuje hodnotu (MB, čas, kredity)
•	Unit – ks, MB, sekundy, atď.
•	Optional dimensions: endpoint, user_id, plan_id
________________________________________
B. Prijímanie usage eventov
Merchant bude môcť poslať usage event cez:
•	API (rovnako ako v Stripe) – event obsahuje: 
o	event_name
o	customer_id
o	usage_value
o	timestamp
•	CSV upload (ako Stripe umožňuje pri recording usage) [docs.stripe.com]
•	S3 upload (ako Stripe bulk import) [docs.stripe.com]
________________________________________
C. Pricing modely
Merchant si vytvorí pre každý meter ceny:
•	čistý usage model (pay-as-you-go)
•	tiered pricing (ako Stripe – hranice a ceny)
•	free tier (napr. prvých 1000 eventov)
•	prenájmy a kredity
________________________________________
D. Monitoring a alerty
Podľa Stripe merchant potrebuje monitoring usage a threshold upozornenia. [docs.stripe.com]
Admin umožní:
•	nastaviť alerty pri prekročení limitu (napr. 80%)
•	graf spotreby
•	export histórie usage eventov
________________________________________
✅ 6. Výsledná architektúra tatrapay+ Usage Platform
Komponenty:
1.	Meter Registry
o	správa meter definícií merchantov (event_name, aggregation formula).
2.	Usage Event Collector
o	API endpoint na príjem eventov (batch & real-time).
o	validácia eventov podľa definície metra.
3.	Aggregation Engine
o	denné/týždenné/mesačné agregácie podľa metra.
o	podporuje count & sum (ako Stripe).
4.	Pricing Engine
o	vyhodnocuje tarifné modely merchantov.
5.	Usage Dashboard
o	grafy, alerty, exporty.
6.	Billing Export Modul
o	merchant si stiahne podklady pre svoje vlastné faktúry.
________________________________________
✅ 7. Záver
Tento návrh replikuje moderný Stripe Billing model (Meter → Usage Events → Aggregation → Pricing), ktorý je detailne popísaný v zdrojoch a podporuje rôzne typy spotrebných metrik (count/sum/event-based).
Ty ako poskytovateľ platobnej brány tak ponúkneš usage metering platformu, ktorú obchodníci môžu použiť ako základ pre monetizáciu svojich vlastných služieb.
Ak chceš, dopracujem ešte:
✅ ERD schému pre metre a usage events
✅ API špecifikáciu /usage-events, /meters, /prices
✅ návrh databázových tabuliek
✅ návrh UI pre merchant admin

## Production Deployment (Container + Nginx)

This repository now includes a production container image for static deployment with hardened HTTP headers.

### Build and run locally

```bash
npm run docker:build
npm run docker:run
```

App is served on `http://localhost:8080`.

### Security headers enforced at server level

- Content-Security-Policy
- Strict-Transport-Security
- X-Content-Type-Options
- X-Frame-Options
- Referrer-Policy
- Permissions-Policy
- Cross-Origin-Opener-Policy
- Cross-Origin-Resource-Policy

### Verify headers

```bash
curl -sSI http://localhost:8080/ | grep -Ei "content-security-policy|strict-transport-security|x-content-type-options|x-frame-options|referrer-policy|permissions-policy|cross-origin-opener-policy|cross-origin-resource-policy"
```

### Deploy to production

1. Build container image in CI using `Dockerfile`.
2. Push image to your registry.
3. Deploy to your orchestrator (Kubernetes, ECS, or similar) and expose over HTTPS.
4. Ensure TLS termination is enabled in front of the container.

## Kubernetes Deployment (Production)

Kubernetes manifests are in `k8s/` and include:

- Namespace
- Deployment (2 replicas, probes, hardened container security context)
- Service (ClusterIP)
- Ingress (TLS + redirect + HSTS)

### 1. Build and push image

```bash
export IMAGE=ghcr.io/lukasokal/usagemeterportal:$(git rev-parse --short HEAD)
docker build -t "$IMAGE" .
docker push "$IMAGE"
```

### 2. Set your image tag in deployment

Update the image field in `k8s/deployment.yaml` to your pushed tag.

### 3. Set your production hostname and TLS secret

Update these fields in `k8s/ingress.yaml`:

- host: `usagemeterportal.example.com`
- secretName: `usagemeterportal-tls`

### 4. Deploy

```bash
kubectl apply -k k8s
kubectl -n usagemeterportal rollout status deploy/usagemeterportal
```

### 5. Verify runtime headers in cluster

```bash
kubectl -n usagemeterportal port-forward svc/usagemeterportal 8080:80
curl -sSI http://127.0.0.1:8080/ | grep -Ei "content-security-policy|strict-transport-security|x-content-type-options|x-frame-options|referrer-policy|permissions-policy|cross-origin-opener-policy|cross-origin-resource-policy"
```

## GitHub Actions CD (GHCR -> Kubernetes)

Workflow file: `.github/workflows/deploy-k8s.yml`

Trigger:

- Push to `main`
- Manual dispatch

Required repository secret:

- `KUBE_CONFIG_DATA`: base64-encoded kubeconfig content.

How to create `KUBE_CONFIG_DATA`:

```bash
base64 -w 0 ~/.kube/config
```

Copy the output into repository secret `KUBE_CONFIG_DATA`.
